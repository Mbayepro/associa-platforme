'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import '@fontsource/inter';
import '@fontsource/great-vibes';
import '@fontsource/playfair-display';

export interface CertificateVisualProps {
  participantName: string;
  memberNumber: string;
  sessionType: string;
  sessionTitle: string;
  issuedAt: string;
  verificationToken?: string | null;
  orgName: string;
  orgLogo?: string | null;
  colorPrimary?: string;
}

export function CertificateVisual({
  participantName,
  memberNumber,
  sessionType,
  sessionTitle,
  issuedAt,
  verificationToken,
  orgName,
  orgLogo,
  colorPrimary = '#c6a87c' // Gold border color
}: CertificateVisualProps) {
  const A4_WIDTH = 1123;
  const A4_HEIGHT = 794;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
    (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://associa-platforme.vercel.app'));
  const verifyUrl = verificationToken ? `${baseUrl}/verify/certificate/${verificationToken}` : baseUrl;
  
  const formattedDate = new Date(issuedAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const formatName = (name: string) => {
    return name.split(/[\s-]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  const getTypeTitle = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'TRAINING':
      case 'FORMATION':
        return 'Attestation de participation';
      case 'EVENT':
        return 'Attestation de participation';
      case 'MEMBERSHIP':
        return "Attestation d'adhésion";
      case 'FELICITATION':
        return 'Attestation de félicitation';
      default:
        if (!type) return 'Attestation';
        return `Attestation de ${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}`;
    }
  };

  const getSubTitle = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'TRAINING':
      case 'FORMATION':
        return 'Formation';
      case 'EVENT':
        return 'Événement';
      case 'MEMBERSHIP':
        return 'Adhésion';
      case 'FELICITATION':
        return 'Félicitation';
      default:
        if (!type) return '';
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }
  };

  const title = getTypeTitle(sessionType);
  const sessionTypeLabel = getSubTitle(sessionType);
  const shortToken = verificationToken ? `${verificationToken.substring(0, 8).toUpperCase()}...` : 'N/A';

  const darkGreen = "#0c4a3d";
  const darkBlue = "#183251";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .cert-wrapper-print {
            width: 297mm !important;
            height: 210mm !important;
            max-width: none !important;
            break-inside: avoid;
            page-break-inside: avoid;
            margin: 0 !important;
          }
        }
        .cert-stamp {
          border: 2px dashed #183251;
          border-radius: 50%;
          width: 100px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .cert-stamp-inner {
          border: 1px solid #183251;
          border-radius: 50%;
          width: 86px;
          height: 86px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 8px;
          font-weight: bold;
          color: #183251;
          text-transform: uppercase;
        }
      `}} />
      <div
        className="relative bg-[#FDFBF7] overflow-hidden cert-wrapper-print mx-auto"
        style={{
          width: `${A4_WIDTH}px`,
          height: `${A4_HEIGHT}px`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.05)'
        }}
      >
          {/* Subtle Org Logo Watermark */}
          {orgLogo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
              <img src={orgLogo} alt="" className="w-1/2 h-1/2 object-contain grayscale" />
            </div>
          )}

          {/* Background Waves Top Right */}
          <svg viewBox="0 0 200 200" className="absolute top-0 right-0 w-[250px] h-[250px] pointer-events-none z-0" preserveAspectRatio="none">
            <path d="M200 0 L200 120 C140 120 80 60 0 0 Z" fill={darkGreen} />
            <path d="M200 0 L200 180 C110 180 50 110 0 0 Z" fill={colorPrimary} />
            <path d="M200 0 L200 150 C120 150 60 80 0 0 Z" fill={darkGreen} />
          </svg>

          {/* Background Waves Bottom Left */}
          <svg viewBox="0 0 200 200" className="absolute bottom-0 left-0 w-[280px] h-[280px] pointer-events-none z-0" preserveAspectRatio="none">
            <path d="M0 200 L160 200 C160 120 80 40 0 0 Z" fill={colorPrimary} />
            <path d="M0 200 L120 200 C120 140 60 80 0 40 Z" fill={darkGreen} />
            <path d="M0 200 L70 200 C70 160 30 110 0 80 Z" fill="#083027" />
          </svg>

          {/* Golden Border Frame */}
          <div className="absolute inset-5 border-[1px] pointer-events-none z-10" style={{ borderColor: colorPrimary }}>
            <div className="absolute inset-1 border-[1px]" style={{ borderColor: colorPrimary }}></div>
          </div>

          {/* Content Container */}
          <div className="relative z-20 w-full h-full flex flex-col pt-10 pb-6 px-16">
            
            {/* Header */}
            <div className="flex justify-between items-start w-full">
              <div className="flex items-center gap-4">
                {orgLogo ? (
                  <img src={orgLogo} alt="Logo" className="w-20 h-20 object-contain" />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md" style={{ backgroundColor: colorPrimary }}>
                    {orgName.charAt(0)}
                  </div>
                )}
                <span className="text-3xl font-extrabold tracking-widest text-neutral-800 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {orgName}
                </span>
              </div>
              
              <div className="text-right text-neutral-600 text-[10px] italic font-serif leading-tight pt-1 pr-2 z-30 relative">
                Ensemble pour des associations<br/>plus fortes
              </div>
            </div>

            {/* Main Title */}
            <div className="text-center w-full mt-4">
              <h1 className="text-4xl font-bold tracking-[0.15em] mb-3 px-4 uppercase" style={{ color: darkGreen, fontFamily: '"Playfair Display", serif' }}>
                {title}
              </h1>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-16 h-[1px]" style={{ backgroundColor: colorPrimary }}></div>
                <div className="w-2 h-2 rotate-45" style={{ backgroundColor: colorPrimary }}></div>
                <div className="w-16 h-[1px]" style={{ backgroundColor: colorPrimary }}></div>
              </div>
            </div>

            {/* Name & Details */}
            <div className="text-center w-full flex-1 flex flex-col items-center justify-center">
              <h3 className="text-[80px] leading-normal mb-2" style={{ fontFamily: '"Great Vibes", cursive', color: darkBlue }}>
                {formatName(participantName)}
              </h3>
              <p className="text-sm text-neutral-600 font-semibold tracking-wide mb-4">
                N° {memberNumber}
              </p>
              
              <p className="text-xl font-bold tracking-widest mt-0 mb-2 uppercase" style={{ color: darkGreen }}>
                {sessionTypeLabel}
              </p>

              <p className="text-2xl text-neutral-800 font-serif mb-1 max-w-2xl font-medium">
                {sessionTitle}
              </p>

              <div className="mt-6 text-neutral-600 text-sm space-y-1">
                <p>Émise le {formattedDate}</p>
                <p>Réf: {shortToken}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="w-full grid grid-cols-3 items-end mt-auto pb-4 px-4">
              
              {/* Signature - Left Aligned */}
              <div className="flex flex-col items-start">
                <div className="mb-0.5 ml-4">
                  <svg width="80" height="25" viewBox="0 0 120 40" fill="none" stroke={darkBlue} strokeWidth="2">
                    <path d="M10 30 Q 30 10, 50 30 T 90 20" />
                    <path d="M40 30 Q 60 5, 80 25" />
                  </svg>
                </div>
                <div className="w-32 border-b border-neutral-400 mb-1"></div>
                <p className="text-[9px] text-neutral-600 font-medium pl-1">Signature / Responsable</p>
              </div>

              {/* Central Stamp - Centered */}
              <div className="flex justify-center -mt-4">
                <div className="cert-stamp bg-white shadow-sm" style={{ width: '80px', height: '80px' }}>
                  <div className="cert-stamp-inner" style={{ width: '68px', height: '68px', fontSize: '6px' }}>
                    <span className="leading-tight">{orgName.substring(0, 15)}<br/>CERTIFIÉ</span>
                  </div>
                </div>
              </div>

              {/* QR Code & Verify Notice - Right Aligned */}
              <div className="flex items-center justify-end gap-3">
                <div className="flex flex-col items-center">
                  <div className="p-1 bg-white rounded border border-neutral-200 mb-1 shadow-sm">
                    <QRCodeSVG value={verifyUrl} size={50} level="H" includeMargin={false} />
                  </div>
                  <p className="text-[7px] font-semibold text-neutral-700 text-center leading-tight">
                    Vérifier l'authenticité<br/>sur ASSOCIA
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 border-l border-neutral-200 pl-3">
                  <div className="w-5 h-5 rounded bg-[#0c4a3d] flex items-center justify-center text-white shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                  </div>
                  <p className="text-[7px] text-[#0c4a3d] leading-tight font-medium whitespace-nowrap">
                    Document généré et vérifiable<br/>via la plateforme ASSOCIA
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
    </>
  );
}
