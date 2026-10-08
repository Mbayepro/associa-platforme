'use client';

import React, { useState, useEffect, useRef } from 'react';

export function CertificatePreview({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);
  const observerRef = useRef<ResizeObserver | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const A4_WIDTH = 1123;
  const A4_HEIGHT = 794;

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
          if (w > 0) setScale(w / A4_WIDTH);
        }
      });
      obs.observe(node);
      observerRef.current = obs;
      const w = node.getBoundingClientRect().width;
      if (w > 0) setScale(w / A4_WIDTH);
    }
  };

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return (
    <div
      ref={setContainerRef}
      className="relative w-full flex-col flex items-center justify-center overflow-hidden"
      style={{ aspectRatio: `${A4_WIDTH}/${A4_HEIGHT}` }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
