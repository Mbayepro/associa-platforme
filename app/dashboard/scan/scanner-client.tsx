'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import jsQR from 'jsqr';
import { createClient } from '@/lib/supabase/client';

type ScanResult = {
  success: boolean;
  message: string;
  member_name?: string;
  member_number?: string;
};

function extractToken(raw: string): string {
  const trimmed = raw.trim();
  const parts = trimmed.split('/verify/card/');
  return parts.length > 1 ? parts[1].replace(/\/$/, '') : trimmed;
}

export function ScannerClient() {
  const searchParams = useSearchParams();
  const sessionType = (searchParams.get('type') as 'FORMATION' | 'EVENT') || null;
  const sessionId = searchParams.get('id');

  const supabase = createClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const busyRef = useRef(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);

  async function processToken(rawToken: string) {
    if (!sessionType || !sessionId) return;
    const token = extractToken(rawToken);
    if (!token || busyRef.current) return;
    if (lastScannedRef.current === token) return; // évite les doubles scans immédiats
    busyRef.current = true;
    lastScannedRef.current = token;

    const { data, error } = await supabase
      .rpc('record_attendance', {
        p_token: token,
        p_session_type: sessionType,
        p_session_id: sessionId,
      })
      .single();

    const result: ScanResult = error || !data
      ? { success: false, message: "Erreur lors de l'enregistrement" }
      : (data as any);

    setLastResult(result);
    setHistory((h) => [result, ...h].slice(0, 10));

    // Autorise un nouveau scan du même token après 4 secondes
    setTimeout(() => {
      if (lastScannedRef.current === token) lastScannedRef.current = null;
    }, 4000);
    busyRef.current = false;
  }

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      tick();
    } catch {
      setCameraError(
        "Impossible d'accéder à la caméra. Utilisez la saisie manuelle ci-dessous."
      );
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setCameraOn(false);
  }

  function tick() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          processToken(code.data);
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!sessionType || !sessionId) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-600">
        Ouvrez le scanner depuis la fiche d&apos;une formation ou d&apos;un
        événement pour enregistrer les présences.
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Scanner de présence</h1>
        <p className="text-sm text-neutral-600">
          Session : {sessionType === 'FORMATION' ? 'Formation' : 'Événement'}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-black">
        {cameraOn ? (
          <video ref={videoRef} className="w-full" muted playsInline />
        ) : (
          <div className="flex aspect-video items-center justify-center text-sm text-white/70">
            Caméra désactivée
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      {cameraError && <p className="text-sm text-red-600">{cameraError}</p>}

      <button
        onClick={cameraOn ? stopCamera : startCamera}
        className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
      >
        {cameraOn ? 'Arrêter la caméra' : 'Activer la caméra'}
      </button>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Ou coller le lien / code de la carte
        </label>
        <div className="flex gap-2">
          <input
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="associa.app/verify/card/…"
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus-ring"
          />
          <button
            onClick={() => {
              lastScannedRef.current = null;
              processToken(manualToken);
              setManualToken('');
            }}
            disabled={!manualToken}
            className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Valider
          </button>
        </div>
      </div>

      {lastResult && (
        <div
          className={`rounded-xl border p-4 text-center ${
            lastResult.success
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <p
            className={`font-semibold ${
              lastResult.success ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {lastResult.success ? 'PRÉSENCE ENREGISTRÉE' : lastResult.message}
          </p>
          {lastResult.member_name && (
            <p className="text-sm text-neutral-700">
              {lastResult.member_name} · {lastResult.member_number}
            </p>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-neutral-500">Derniers scans</p>
          {history.map((h, i) => (
            <div
              key={i}
              className="flex justify-between rounded-lg border border-neutral-200 px-3 py-2 text-xs"
            >
              <span>{h.member_name ?? '—'}</span>
              <span className={h.success ? 'text-green-700' : 'text-red-600'}>
                {h.success ? 'OK' : h.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
