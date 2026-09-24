import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { getDb, schema } from "@/db";
import {
  extractTextFromFile,
  classifyDocumentWithAI,
  AIClassificationResult,
} from "@/lib/ai/classifier";
import { logAuditEvent } from "@/lib/audit/service";
import { hashPassword } from "@/lib/auth/crypto";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";

    // 1. Commit action (JSON payload)
    if (contentType.includes("application/json")) {
      const body: any = await request.json();
      if (body.action === "commit" && body.payload) {
        const payload: AIClassificationResult = body.payload;
        const db = await getDb();

        let membersAdded = 0;
        let rehearsalsAdded = 0;
        let songsAdded = 0;
        let paymentsAdded = 0;

        // Fetch active quarter
        const quarters = await db.select().from(schema.quarters).orderBy(desc(schema.quarters.startDate));
        const activeQuarter = quarters.find((q) => q.status === "ACTIVE") || quarters[0];
        const quarterId = activeQuarter?.id || "q1_2026";

        // Commit Members
        if (payload.members && payload.members.length > 0) {
          const defaultPasswordHash = await hashPassword("ChoirMember2026!");
          for (const m of payload.members) {
            if (!m.fullName) continue;
            const memberId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const email = m.email || `member_${Date.now()}_${Math.random().toString(36).substring(2, 5)}@thamar-shefah.org`;
            const phone = m.phone || `010${Math.floor(10000000 + Math.random() * 90000000)}`;

            try {
              await db.insert(schema.users).values({
                id: memberId,
                fullName: m.fullName.trim(),
                email,
                phone,
                passwordHash: defaultPasswordHash,
                status: "APPROVED",
                voicePart: m.voicePart || "TENOR",
                tier: m.tier || "WORKING",
              });

              await db.insert(schema.userRoles).values({
                userId: memberId,
                roleId: "role_member",
                assignedBy: user.userId,
              });

              membersAdded++;
            } catch (e) {
              console.warn("Could not insert member (duplicate or invalid):", e);
            }
          }
        }

        // Commit Rehearsals
        if (payload.rehearsals && payload.rehearsals.length > 0) {
          for (const r of payload.rehearsals) {
            if (!r.title || !r.date) continue;
            const rehearsalId = `reh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            try {
              await db.insert(schema.rehearsals).values({
                id: rehearsalId,
                quarterId,
                title: r.title.trim(),
                date: r.date,
                startTime: r.startTime || "19:00",
                endTime: r.endTime || "21:30",
                locationName: r.locationName || "مطرانية سوهاج — قاعة الكورال",
                latitude: 26.5565,
                longitude: 31.6958,
                radiusMeters: 100,
              });
              rehearsalsAdded++;
            } catch (e) {
              console.warn("Could not insert rehearsal:", e);
            }
          }
        }

        // Commit Songs
        if (payload.songs && payload.songs.length > 0) {
          for (const s of payload.songs) {
            if (!s.title) continue;
            const songId = `sng_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            try {
              await db.insert(schema.songs).values({
                id: songId,
                title: s.title.trim(),
                copticTitle: s.copticTitle || null,
                category: s.category || "GENERAL",
                musicalKey: s.musicalKey || null,
                tempo: s.tempo || null,
                lyrics: s.lyrics || null,
                isActive: true,
                createdById: user.userId,
              });
              songsAdded++;
            } catch (e) {
              console.warn("Could not insert song:", e);
            }
          }
        }

        // Commit Payments
        if (payload.payments && payload.payments.length > 0) {
          const membersInDb = await db.select().from(schema.users);
          const currentMonth = new Date().toISOString().slice(0, 7);

          for (const p of payload.payments) {
            if (!p.amount) continue;
            // Match member by name or pick first
            const matched = membersInDb.find((m) =>
              m.fullName.toLowerCase().includes(p.memberName.toLowerCase())
            ) || membersInDb[0];

            if (matched) {
              const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
              try {
                await db.insert(schema.subscriptionPayments).values({
                  id: paymentId,
                  userId: matched.id,
                  amountPaid: p.amount,
                  paymentDate: p.paymentDate || new Date().toISOString().split("T")[0],
                  recordedBy: user.userId,
                  notes: `استيراد ذكي من ملف: ${payload.fileName}`,
                });
                paymentsAdded++;
              } catch (e) {
                console.warn("Could not insert payment:", e);
              }
            }
          }
        }

        // Log to Audit Trail
        await logAuditEvent({
          actorId: user.userId,
          action: "AI_IMPORT_EXECUTED",
          entity: "SYSTEM",
          entityId: payload.fileName,
          newValue: {
            fileName: payload.fileName,
            membersAdded,
            rehearsalsAdded,
            songsAdded,
            paymentsAdded,
          },
          reason: `استيراد وجدولة محتويات ملف ${payload.fileName} بالذكاء الاصطناعي (أعضاء: ${membersAdded}، بروفات: ${rehearsalsAdded}، ترانيم: ${songsAdded})`,
        });

        return NextResponse.json({
          success: true,
          message: `تمت جدولة وحفظ البيانات بنجاح: ${membersAdded} مرنم، ${rehearsalsAdded} بروفة، ${songsAdded} ترنيمة، و ${paymentsAdded} مدفوعة مالية.`,
          stats: {
            membersAdded,
            rehearsalsAdded,
            songsAdded,
            paymentsAdded,
          },
        });
      }
    }

    // 2. File Ingestion & Extraction (multipart/form-data)
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "يرجى اختيار ملف للمعالجة" }, { status: 400 });
    }

    const fileName = file.name;
    const mimeType = file.type || "application/octet-stream";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from Word, Excel, or PDF
    const { rawText, fileType } = await extractTextFromFile(buffer, fileName, mimeType);

    if (!rawText.trim()) {
      return NextResponse.json({ error: "لم يتم العثور على نصوص قابلة للقراءة في هذا الملف" }, { status: 400 });
    }

    // Classify using AI / Heuristics
    const classification = await classifyDocumentWithAI(rawText, fileName, fileType);

    return NextResponse.json({
      success: true,
      classification,
    });
  } catch (error) {
    console.error("[AI Import API Error]:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء معالجة الملف بالذكاء الاصطناعي" }, { status: 500 });
  }
}
