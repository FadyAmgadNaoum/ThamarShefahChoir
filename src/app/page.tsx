"use client";

import React, { useState, useEffect } from "react";
import NavbarApple from "@/components/apple/NavbarApple";
import FooterApple from "@/components/apple/FooterApple";
import ExcuseSubmissionModal from "@/components/excuses/ExcuseSubmissionModal";
import ChoirHero from "@/components/profile/ChoirHero";
import ChoirAbout from "@/components/profile/ChoirAbout";
import ChoirTimeline from "@/components/profile/ChoirTimeline";
import ChoirGallery from "@/components/profile/ChoirGallery";
import ChoirVocalSections from "@/components/profile/ChoirVocalSections";
import ChoirFeaturedHymns from "@/components/profile/ChoirFeaturedHymns";
import ChoirContact from "@/components/profile/ChoirContact";
import { ChoirProfileData, defaultChoirProfile } from "@/data/choir-profile";

export default function LandingPage() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [profile, setProfile] = useState<ChoirProfileData>(defaultChoirProfile);
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);

  // Authenticated Member & Active Rehearsal State
  const [currentUser, setCurrentUser] = useState<{
    userId: string;
    fullName: string;
    roles: string[];
    voicePart?: string;
    status: string;
  } | null>(null);

  const [activeRehearsal, setActiveRehearsal] = useState<{
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    locationName: string;
    windowStatus: string;
  } | null>(null);

  const isArabic = lang === "ar";
  const isAdmin = Boolean(
    currentUser?.roles?.includes("ADMIN") || currentUser?.roles?.includes("SUPER_ADMIN")
  );

  useEffect(() => {
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = isArabic ? "ar-EG" : "en";
  }, [isArabic]);

  // Fetch Public Profile CMS Data
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: any) => {
        if (data?.profile) setProfile(data.profile);
      })
      .catch(() => {});
  }, []);

  // Fetch Authenticated User & Rehearsal Info
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: any) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    fetch("/api/rehearsals/active")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: any) => {
        if (data?.rehearsal) setActiveRehearsal(data.rehearsal);
      })
      .catch(() => {});
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "ar" ? "en" : "ar"));
  };

  return (
    <div className="min-h-screen bg-surface-canvas text-charcoal font-sans selection:bg-gold-200 selection:text-burgundy-900 relative">
      {/* 1. Omnipresent Apple Dynamic Island Capsule */}
      <NavbarApple
        lang={lang}
        toggleLanguage={toggleLanguage}
        currentUser={currentUser}
        activeRehearsal={activeRehearsal}
        onOpenExcuseModal={() => setIsExcuseModalOpen(true)}
      />

      <main>
        {/* 2. Choir Profile Hero with Official Logo, Motto, Verse & Action Pills */}
        <ChoirHero
          profile={profile}
          isArabic={isArabic}
          isAdmin={isAdmin}
        />

        {/* 3. Spiritual Mission & Choir About Section */}
        <ChoirAbout
          profile={profile}
          isArabic={isArabic}
        />

        {/* 4. History Milestones & 25+ Years Chronicle */}
        <ChoirTimeline
          history={profile.history}
          isArabic={isArabic}
        />

        {/* 5. Photographic Archive & Interactive Lightbox Gallery */}
        <ChoirGallery
          gallery={profile.gallery}
          isArabic={isArabic}
        />

        {/* 6. Four-Part Polyphonic Vocal Sections (SATB) */}
        <ChoirVocalSections
          sections={profile.vocalSections}
          isArabic={isArabic}
        />

        {/* 7. Repertoire Highlights & Cantatas Player */}
        <ChoirFeaturedHymns
          hymns={profile.featuredHymns}
          isArabic={isArabic}
        />

        {/* 8. Service Location, Rehearsal Schedule & Join Us */}
        <ChoirContact
          contact={profile.contact}
          isArabic={isArabic}
        />
      </main>

      {/* 9. Liturgical Footer */}
      <FooterApple isArabic={isArabic} />

      {/* Reusable Excuse Submission Modal */}
      <ExcuseSubmissionModal
        isOpen={isExcuseModalOpen}
        onClose={() => setIsExcuseModalOpen(false)}
        defaultRehearsalId={activeRehearsal?.id}
        onSuccess={() => {
          fetch("/api/rehearsals/active")
            .then((r) => (r.ok ? r.json() : null))
            .then((data: any) => {
              if (data?.rehearsal) setActiveRehearsal(data.rehearsal);
            })
            .catch(() => {});
        }}
      />
    </div>
  );
}
