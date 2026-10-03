"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { hasAnalyticsConsent } from "@/lib/analytics";

export function AnalyticsScripts() {
  const [consentGranted, setConsentGranted] = useState<boolean>(false);

  useEffect(() => {
    // Initial check
    setConsentGranted(hasAnalyticsConsent());

    // Listen for consent updates
    const handleConsentUpdate = () => {
      setConsentGranted(hasAnalyticsConsent());
    };

    window.addEventListener("avanya_consent_updated", handleConsentUpdate);
    return () => {
      window.removeEventListener("avanya_consent_updated", handleConsentUpdate);
    };
  }, []);

  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID || "G-AVANYA12345";
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  if (!consentGranted) {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 (Only loaded upon affirmative DPDP user consent) */}
      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}', {
                page_path: window.location.pathname,
                anonymize_ip: true
              });
            `}
          </Script>
        </>
      )}

      {/* Meta (Facebook) Pixel */}
      {metaPixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
