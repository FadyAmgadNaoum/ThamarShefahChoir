import * as XLSX from "xlsx";
import mammoth from "mammoth";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export interface ExtractedMember {
  fullName: string;
  email?: string;
  phone?: string;
  voicePart?: "SOPRANO" | "ALTO" | "TENOR" | "BASS";
  tier?: "STUDENT" | "WORKING" | "OTHER";
}

export interface ExtractedRehearsal {
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  locationName?: string;
}

export interface ExtractedSong {
  title: string;
  copticTitle?: string;
  category?: string;
  musicalKey?: string;
  tempo?: string;
  lyrics?: string;
}

export interface ExtractedAttendance {
  memberName: string;
  rehearsalDateOrTitle: string;
  status: "PRESENT" | "LATE" | "VERY_LATE" | "EXTREME_LATE" | "EXCUSED_ABSENCE" | "ABSENT";
}

export interface ExtractedPayment {
  memberName: string;
  amount: number;
  paymentDate?: string;
  monthYear?: string;
}

export interface AIClassificationResult {
  fileName: string;
  fileType: string;
  summary: string;
  members: ExtractedMember[];
  rehearsals: ExtractedRehearsal[];
  songs: ExtractedSong[];
  attendance: ExtractedAttendance[];
  payments: ExtractedPayment[];
}

/**
 * Extract raw text from uploaded Word, Excel, or PDF buffers
 */
export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ rawText: string; fileType: string }> {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  if (ext === "xlsx" || ext === "xls" || ext === "csv") {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetTexts: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      sheetTexts.push(`--- شيت: ${sheetName} ---\n${csv}`);
    }
    return { rawText: sheetTexts.join("\n\n"), fileType: "EXCEL" };
  }

  if (ext === "docx" || ext === "doc") {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return { rawText: result.value, fileType: "WORD" };
    } catch {
      return { rawText: buffer.toString("utf-8"), fileType: "WORD" };
    }
  }

  if (ext === "pdf") {
    try {
      const data = await pdfParse(buffer);
      return { rawText: data.text, fileType: "PDF" };
    } catch {
      return { rawText: buffer.toString("utf-8"), fileType: "PDF" };
    }
  }

  return { rawText: buffer.toString("utf-8"), fileType: "TEXT" };
}

/**
 * Smart Heuristic Fallback Classifier (Regex & Pattern Recognition for Arabic Choir Data)
 */
function heuristicClassify(rawText: string, fileName: string, fileType: string): AIClassificationResult {
  const members: ExtractedMember[] = [];
  const rehearsals: ExtractedRehearsal[] = [];
  const songs: ExtractedSong[] = [];
  const attendance: ExtractedAttendance[] = [];
  const payments: ExtractedPayment[] = [];

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  for (const line of lines) {
    // Check for phone numbers
    const phoneMatch = line.match(/(01[0125][0-9]{8})/);
    const phone = phoneMatch ? phoneMatch[1] : undefined;

    // Check for voice parts
    let voicePart: "SOPRANO" | "ALTO" | "TENOR" | "BASS" | undefined;
    if (/سوبرانو|soprano/i.test(line)) voicePart = "SOPRANO";
    else if (/ألتو|التو|alto/i.test(line)) voicePart = "ALTO";
    else if (/تينور|tenor/i.test(line)) voicePart = "TENOR";
    else if (/باص|bass/i.test(line)) voicePart = "BASS";

    // Check for date (YYYY-MM-DD or DD/MM/YYYY)
    const dateMatch = line.match(/(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/);

    // Check for payments (amount in pounds/EGP)
    const amountMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:جنيه|ج\.م|ج|egp)/i);

    if (amountMatch) {
      const amount = parseFloat(amountMatch[1]);
      const nameParts = line.replace(amountMatch[0], "").replace(phone || "", "").split(/[,;\t]/);
      const name = nameParts[0]?.trim() || "عضو كورال";
      payments.push({
        memberName: name,
        amount,
        paymentDate: dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0],
      });
      continue;
    }

    if (line.includes("بروفة") || (dateMatch && (line.includes("ميعاد") || line.includes("قاعة") || line.includes("الساعة")))) {
      const timeMatch = line.match(/(\d{1,2}:\d{2})/g);
      rehearsals.push({
        title: line.split(/[,;\t]/)[0] || "بروفة كورال أسبوعية",
        date: dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0],
        startTime: timeMatch && timeMatch[0] ? timeMatch[0] : "19:00",
        endTime: timeMatch && timeMatch[1] ? timeMatch[1] : "21:30",
        locationName: line.includes("مطرانية") ? "مطرانية سوهاج" : "قاعة الكورال",
      });
      continue;
    }

    if (line.includes("ترنيمة") || line.includes("لحن") || line.includes("كنتاتا") || line.includes("مقام")) {
      const parts = line.split(/[,;\t-]/);
      songs.push({
        title: parts[0]?.replace("ترنيمة", "").trim() || line,
        category: line.includes("آلام")
          ? "PASSION_WEEK"
          : line.includes("قيامة")
          ? "RESURRECTION"
          : line.includes("كنتاتا")
          ? "CANTATA"
          : "GENERAL",
      });
      continue;
    }

    // If it looks like a member row (has voice part or phone, or multiple words)
    if (voicePart || phone || (line.split(/\s+/).length >= 2 && !line.startsWith("---") && !line.includes("إجمالي"))) {
      const parts = line.split(/[,;\t]/).map((p) => p.trim());
      const name = parts[0];
      if (name && name.length >= 3 && !/اسم|كود|رقم|ملاحظات|مبلغ/.test(name)) {
        members.push({
          fullName: name,
          phone,
          voicePart,
          tier: /طالب|جامعة/i.test(line) ? "STUDENT" : "WORKING",
        });
      }
    }
  }

  const summary = `تم تحليل الملف واكتشاف: ${members.length} مرنم، ${rehearsals.length} بروفة، ${songs.length} ترنيمة، و ${payments.length} مدفوعة مالية.`;

  return {
    fileName,
    fileType,
    summary,
    members,
    rehearsals,
    songs,
    attendance,
    payments,
  };
}

/**
 * Main AI Document Classifier using Gemini API (with seamless heuristic fallback)
 */
export async function classifyDocumentWithAI(
  rawText: string,
  fileName: string,
  fileType: string
): Promise<AIClassificationResult> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return heuristicClassify(rawText, fileName, fileType);
  }

  try {
    const prompt = `
أنت المساعد الذكي لإدارة واستيراد بيانات كورال ثمر شفاه القبطي الأرثوذكسي بمطرانية سوهاج.
المطلوب منك تحليل النص المستخرج من ملف تم رفعه (${fileName} - نوعه: ${fileType})، وتصنيف واستخراج جميع الكيانات الموجودة فيه إلى الأقسام الخمسة التالية بدقة متناهية:

1. members: قائمة المرنمين [{ fullName, email, phone, voicePart ("SOPRANO" | "ALTO" | "TENOR" | "BASS"), tier ("STUDENT" | "WORKING" | "OTHER") }]
2. rehearsals: قائمة البروفات [{ title, date (YYYY-MM-DD), startTime (HH:MM), endTime (HH:MM), locationName }]
3. songs: قائمة الترانيم والنوت [{ title, copticTitle, category ("GENERAL" | "PASSION_WEEK" | "RESURRECTION" | "KOIAHK" | "LENT" | "NATIVITY" | "PRAISES" | "FEASTS" | "CANTATA"), musicalKey, tempo, lyrics }]
4. attendance: سجلات الحضور [{ memberName, rehearsalDateOrTitle, status ("PRESENT" | "LATE" | "VERY_LATE" | "EXTREME_LATE" | "EXCUSED_ABSENCE" | "ABSENT") }]
5. payments: سجلات الاشتراكات المالية [{ memberName, amount, paymentDate (YYYY-MM-DD), monthYear (YYYY-MM) }]

قم بإرجاع كائن JSON فقط بالهيكل التالي دون أي شروحات خارج الـ JSON:
{
  "summary": "ملخص باللغة العربية لما تم اكتشافه بالملف",
  "members": [...],
  "rehearsals": [...],
  "songs": [...],
  "attendance": [...],
  "payments": [...]
}

النص المستخرج من الملف هو:
"""
${rawText.slice(0, 15000)}
"""
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data: any = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("No candidate returned by Gemini");
    }

    const parsed = JSON.parse(candidateText);
    return {
      fileName,
      fileType,
      summary: parsed.summary || "تم تحليل وتصنيف محتوى الملف بنجاح بواسطة الذكاء الاصطناعي.",
      members: parsed.members || [],
      rehearsals: parsed.rehearsals || [],
      songs: parsed.songs || [],
      attendance: parsed.attendance || [],
      payments: parsed.payments || [],
    };
  } catch (err) {
    console.warn("[AI Classifier Warning] Falling back to heuristic classifier:", err);
    return heuristicClassify(rawText, fileName, fileType);
  }
}
