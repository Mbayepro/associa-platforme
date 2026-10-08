'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, CalendarDays, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import '@fontsource/inter';

export interface CardVisualProps {
  memberName: string;
  memberFunction?: string | null;
  memberNumber: string;
  phone?: string | null;
  photoUrl?: string | null;
  orgName?: string | null;
  orgLogo?: string | null;
  orgTagline?: string | null;
  colorPrimary: string;
  colorSecondary: string;
  issuedAt?: string | null;
  expiresAt?: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED' | string;
  verificationToken?: string | null;
  onPhotoUpload?: (file: File) => Promise<void>;
  uploading?: boolean;
  isFlipped?: boolean;
  hideFlipButton?: boolean;
}

export function CardVisual({
  memberName,
  memberFunction,
  memberNumber,
  phone,
  photoUrl,
  orgName,
  orgLogo,
  orgTagline,
  colorPrimary,
  colorSecondary,
  issuedAt,
  expiresAt,
  status,
  verificationToken,
  onPhotoUpload,
  uploading,
  isFlipped = false,
  hideFlipButton = false
}: CardVisualProps) {
  const [scale, setScale] = useState(0.4672);
  const [localFlipped, setLocalFlipped] = useState(false);
  const flipped = hideFlipButton ? isFlipped : localFlipped;
  const observerRef = useRef<ResizeObserver | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const setContainerRef = (node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    containerRef.current = node;
    if (node) {
      const obs = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          if (w > 0) setScale(w / 856);
        }
      });
      obs.observe(node);
      observerRef.current = obs;
      const w = node.getBoundingClientRect().width;
      if (w > 0) setScale(w / 856);
    }
  };

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const handlePhotoClick = () => {
    if (onPhotoUpload && !uploading) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          await onPhotoUpload(file);
        }
      };
      input.click();
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://associa.app';
  const verifyUrl = verificationToken ? `${baseUrl}/verify/card/${verificationToken}` : baseUrl;

  return (
    <>
      <style>{`
        @media print {
          /* Force physical dimensions */
          .card-wrapper-print {
            width: 85.6mm !important;
            height: 54mm !important;
            max-width: none !important;
            break-inside: avoid;
            page-break-inside: avoid;
            margin: 0 !important; /* Adjust if needed */
          }
          
          /* Use ZOOM instead of TRANSFORM for WebKit/Chrome print reliability */
          .card-inner-print {
            transform: none !important; 
            zoom: 0.37795 !important;
            position: relative !important;
          }
          
          /* Disable 3D and blend modes which break print engines */
          .card-face-print {
            backface-visibility: visible !important;
            transform: none !important;
            position: absolute !important;
          }
          
          .print-safe-blend {
            mix-blend-mode: normal !important;
            filter: none !important;
          }
        }
      `}</style>
      <div
        ref={setContainerRef}
        className="card-visual-wrapper relative mx-auto w-full max-w-[400px] flex-col group card-wrapper-print"
        style={{ perspective: '2000px', aspectRatio: '856/540' }}
      >
        <div
          className={`absolute top-0 left-0 transition-transform duration-700 motion-reduce:transition-none origin-top-left card-inner-print`}
          style={{
            width: '856px',
            height: '540px',
            transform: `scale(${scale}) ${flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}`,
            transformStyle: 'preserve-3d'
          }}
        >
              {/* RECTO */}
            <div
              className={`absolute inset-0 shadow-xl text-white print:shadow-none print:break-inside-avoid print:!bg-exact card-face-print ${flipped ? 'print:hidden' : 'print:block'}`}
              style={{
                fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
                borderRadius: '32px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Background and Watermark Layer */}
              <div className="absolute inset-0 overflow-hidden print-safe-blend" style={{ borderRadius: '32px', background: `linear-gradient(110deg, ${colorPrimary} 0%, ${colorSecondary} 100%)` }}>
                <div className="absolute -bottom-[80px] -right-[80px] opacity-10 pointer-events-none mix-blend-overlay print-safe-blend" style={{ width: '640px', height: '640px' }}>
                  {orgLogo ? (
                    <img src={orgLogo} alt="Watermark" className="w-full h-full object-contain filter grayscale print-safe-blend" />
                  ) : (
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="print-safe-blend">
                      <path d="M12 22v-6"/><path d="M12 8v8"/><path d="M12 8c-2-2-5-1-6 2-1.3 3.8 2.7 6.8 6 9"/><path d="M12 8c2-2 5-1 6 2 1.3 3.8-2.7 6.8-6 9"/><path d="M12 8c-1-3-4-4-6-1-2 3-1 6 0 8"/><path d="M12 8c1-3 4-4 6-1 2 3 1 6 0 8"/>
                    </svg>
                  )}
                </div>
              </div>

              {/* Content Layer */}
              <div className="absolute inset-0 flex flex-col justify-between z-10" style={{ padding: '32px' }}>
                <div className="flex items-start" style={{ gap: '24px' }}>
                  <div className="shrink-0 overflow-hidden rounded-full bg-white flex items-center justify-center" style={{ width: '112px', height: '112px', padding: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    {orgLogo ? (
                      <img src={orgLogo} alt="Logo" className="h-full w-full object-contain rounded-full" />
                    ) : (
                      <span style={{ fontSize: '48px', fontWeight: 'bold', color: colorPrimary }}>
                        {orgName?.charAt(0) || 'O'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col justify-center" style={{ paddingTop: '8px', paddingLeft: '24px', borderLeft: '4px solid rgba(255,255,255,0.4)' }}>
                    <h1 className="font-extrabold leading-tight tracking-tight line-clamp-2" style={{ fontSize: '40px' }}>
                      {orgName || 'Organisation'}
                    </h1>
                    {orgTagline && (
                      <p className="font-medium italic leading-tight line-clamp-2" style={{ fontSize: '24px', marginTop: '8px', color: 'rgba(255,255,255,0.9)', maxWidth: '400px' }}>
                        {orgTagline}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center" style={{ gap: '24px', marginTop: '24px' }}>
                  <div
                    onClick={handlePhotoClick}
                    className={`shrink-0 overflow-hidden bg-white/10 backdrop-blur-md flex items-center justify-center ${onPhotoUpload ? 'cursor-pointer hover:bg-white/20 transition' : ''}`}
                    style={{ width: '160px', height: '192px', borderRadius: '24px', border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  >
                    {photoUrl ? (
                      <img src={photoUrl} alt="Membre" className="h-full w-full object-cover" />
                    ) : (
                      <User className={`text-white/50 ${uploading ? 'animate-pulse' : ''}`} style={{ width: '80px', height: '80px' }} />
                    )}
                  </div>

                  <div className="flex flex-col" style={{ paddingLeft: '24px', paddingBottom: '8px', paddingTop: '8px', borderLeft: '4px solid #86efac' }}>
                    <h2 className="font-extrabold tracking-tight leading-none" style={{ fontSize: '48px' }}>
                      {memberName}
                    </h2>
                    <div className="inline-flex" style={{ marginTop: '16px' }}>
                      <span className="font-bold text-white" style={{ background: 'linear-gradient(to right, #4ade80, #3b82f6)', padding: '4px 24px', borderRadius: '9999px', fontSize: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        {memberFunction || 'Membre'}
                      </span>
                    </div>
                    <p className="font-semibold truncate" style={{ fontSize: '28px', marginTop: '16px', color: 'rgba(255,255,255,0.9)', maxWidth: '440px' }}>
                      N° {memberNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '2px solid rgba(255,255,255,0.2)' }}>
                  <div className="flex items-center" style={{ gap: '16px' }}>
                    <div className="flex items-center justify-center rounded-full bg-white" style={{ width: '64px', height: '64px', color: colorPrimary, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                      <Phone style={{ width: '32px', height: '32px' }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="uppercase tracking-wider font-semibold leading-tight" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)' }}>Téléphone</span>
                      <span className="font-bold leading-tight" style={{ fontSize: '28px' }}>{phone || '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center" style={{ gap: '12px' }}>
                    <CalendarDays style={{ width: '40px', height: '40px', color: 'rgba(255,255,255,0.9)' }} />
                    <div className="flex flex-col" style={{ paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.4)' }}>
                      <span className="font-bold" style={{ fontSize: '28px' }}>Exp. {expiresAt ? new Date(expiresAt).toLocaleDateString('fr-FR', {month: '2-digit', year: 'numeric'}) : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VERSO */}
            <div
              className={`absolute inset-0 shadow-xl text-white print:shadow-none print:break-inside-avoid print:!bg-exact card-face-print ${!flipped ? 'print:hidden' : 'print:block'}`}
              style={{
                fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
                borderRadius: '32px',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
                transform: 'rotateY(180deg)',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden'
              }}
            >
              {/* Background and Watermark Layer */}
              <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: '32px', background: `linear-gradient(110deg, ${colorPrimary} 0%, ${colorSecondary} 100%)` }}>
                <div className="absolute left-0 bottom-0 opacity-10 pointer-events-none -translate-x-1/4 translate-y-1/4">
                  {orgLogo ? (
                    <img src={orgLogo} alt="" className="object-contain grayscale" style={{ width: '512px', height: '512px' }} />
                  ) : (
                    <User style={{ width: '512px', height: '512px' }} />
                  )}
                </div>
              </div>

              {/* Content Layer */}
              <div className="absolute inset-0 flex flex-col h-full z-10" style={{ padding: '32px' }}>
                <div className="text-center" style={{ marginBottom: '16px' }}>
                  <h3 className="font-bold" style={{ fontSize: '28px', color: 'rgba(255,255,255,0.9)' }}>Scannez pour vérifier</h3>
                  <p className="mx-auto leading-tight line-clamp-2" style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', maxWidth: '400px', marginTop: '4px' }}>
                    Cette carte est strictement personnelle. En cas de perte, veuillez la rapporter à {orgName}.
                  </p>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="bg-white rounded-xl flex items-center justify-center" style={{ padding: '16px', marginTop: '8px', border: '2px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <QRCodeSVG value={verifyUrl} size={164} level="M" />
                  </div>
                </div>

                <div className="flex flex-col" style={{ gap: '8px', borderTop: '2px solid rgba(255,255,255,0.2)', paddingTop: '16px', marginTop: '16px', fontSize: '24px', color: 'rgba(255,255,255,0.8)' }}>
                  <div className="flex justify-between items-center">
                    <span className="shrink-0">N° Membre :</span>
                    <span className="font-bold tracking-wider text-white truncate text-right" style={{ maxWidth: '320px' }}>{memberNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Émission :</span>
                    <span className="font-bold text-white">
                      {issuedAt ? new Date(issuedAt).toLocaleDateString('fr-FR', {month: '2-digit', year: 'numeric'}) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expiration :</span>
                    <span className="font-bold text-white">
                      {expiresAt ? new Date(expiresAt).toLocaleDateString('fr-FR', {month: '2-digit', year: 'numeric'}) : '—'}
                    </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!hideFlipButton && (
        <button
          onClick={() => setLocalFlipped(!flipped)}
          className="absolute -right-12 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-md text-neutral-500 hover:text-neutral-900 print:hidden"
          style={{ padding: '8px' }}
        >
          <RotateCcw style={{ width: '24px', height: '24px' }} />
        </button>
      )}
    </div>
    </>
  );
}

