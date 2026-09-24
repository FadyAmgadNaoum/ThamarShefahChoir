"use client";

import React, { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onVerify?: (token: string) => void;
  siteKey?: string;
}

export default function TurnstileWidget({ onVerify, siteKey }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const effectiveSiteKey = siteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!effectiveSiteKey) return;

    // Load Turnstile script if not present
    if (!document.getElementById("cloudflare-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cloudflare-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        renderWidget();
      };
    } else {
      renderWidget();
    }

    function renderWidget() {
      if (typeof window !== "undefined" && (window as any).turnstile && containerRef.current) {
        try {
          (window as any).turnstile.render(containerRef.current, {
            sitekey: effectiveSiteKey,
            callback: (token: string) => {
              if (onVerify) onVerify(token);
            },
            theme: "light",
            language: "ar",
          });
        } catch (e) {
          console.warn("Turnstile render error:", e);
        }
      }
    }
  }, [effectiveSiteKey]);

  if (!effectiveSiteKey) return null;

  return (
    <div className="flex justify-center my-3">
      <div ref={containerRef} />
    </div>
  );
}

