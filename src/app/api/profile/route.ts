import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { defaultChoirProfile, ChoirProfileData } from "@/data/choir-profile";

export const runtime = "edge";

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "choir_profile"))
      .limit(1);

    if (rows.length > 0 && rows[0].value) {
      try {
        const customData = JSON.parse(rows[0].value) as Partial<ChoirProfileData>;
        const merged: ChoirProfileData = {
          general: { ...defaultChoirProfile.general, ...(customData.general || {}) },
          stats: { ...defaultChoirProfile.stats, ...(customData.stats || {}) },
          history: customData.history && customData.history.length > 0 ? customData.history : defaultChoirProfile.history,
          gallery: customData.gallery && customData.gallery.length > 0 ? customData.gallery : defaultChoirProfile.gallery,
          vocalSections: customData.vocalSections && customData.vocalSections.length > 0 ? customData.vocalSections : defaultChoirProfile.vocalSections,
          featuredHymns: customData.featuredHymns && customData.featuredHymns.length > 0 ? customData.featuredHymns : defaultChoirProfile.featuredHymns,
          contact: { ...defaultChoirProfile.contact, ...(customData.contact || {}) },
        };
        return NextResponse.json({ profile: merged, isCustom: true });
      } catch {
        return NextResponse.json({ profile: defaultChoirProfile, isCustom: false });
      }
    }

    return NextResponse.json({ profile: defaultChoirProfile, isCustom: false });
  } catch (error) {
    console.error("Failed to load choir profile:", error);
    return NextResponse.json({ profile: defaultChoirProfile, isCustom: false });
  }
}
