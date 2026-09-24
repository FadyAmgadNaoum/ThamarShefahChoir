"use client";

import React, { useState, useEffect } from "react";
import NavbarApple from "@/components/apple/NavbarApple";
import HeroApple from "@/components/apple/HeroApple";
import BentoGridApple from "@/components/apple/BentoGridApple";
import RoleShowcaseApple from "@/components/apple/RoleShowcaseApple";
import FeatureGridApple from "@/components/apple/FeatureGridApple";
import RoadmapApple from "@/components/apple/RoadmapApple";
import FooterApple from "@/components/apple/FooterApple";
import ExcuseSubmissionModal from "@/components/excuses/ExcuseSubmissionModal";

export default function LandingPage() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
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

  useEffect(() => {
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = isArabic ? "ar-EG" : "en";
  }, [isArabic]);

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
      <main>
        {/* 2. Apple Cinematic Hero with 3D Tilt Card & Live Radar Simulator */}
        <HeroApple
          isArabic={isArabic}
          currentUser={currentUser}
          activeRehearsal={activeRehearsal}
          onOpenExcuseModal={() => setIsExcuseModalOpen(true)}
        />

        {/* 3. Apple Asymmetrical Bento Grid Showcase (Vocal Stems Equalizer + GPS Radar) */}
        <BentoGridApple
          isArabic={isArabic}
          onOpenExcuseModal={() => setIsExcuseModalOpen(true)}
        />

        {/* 4. Apple Keynote Deep Obsidian Role Showcase (macOS Segmented Control) */}
        <RoleShowcaseApple isArabic={isArabic} />

        {/* 5. Core 6-Pillar Feature Matrix */}
        <FeatureGridApple
          isArabic={isArabic}
          onOpenExcuseModal={() => setIsExcuseModalOpen(true)}
        />

        {/* 6. Apple Editorial 10-Phase Roadmap & Technical Metrics */}
        <RoadmapApple isArabic={isArabic} />
      </main>

      {/* 7. Apple Editorial Footer */}
      <FooterApple isArabic={isArabic} />

      {/* Reusable Excuse Submission Modal */}
      <ExcuseSubmissionModal
        isOpen={isExcuseModalOpen}
        onClose={() => setIsExcuseModalOpen(false)}
        defaultRehearsalId={activeRehearsal?.id}
        onSuccess={() => {
          // Re-fetch active rehearsal to reflect any updates
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
