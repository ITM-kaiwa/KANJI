"use client";

import { useRef, useState } from "react";

interface SpeakButtonProps {
  text: string;
  voice?: string;
  className?: string;
}

/**
 * Speaker button that calls the Edge TTS backend (api/tts.py, a Python
 * serverless function on Vercel) and plays back the resulting audio.
 */
export default function SpeakButton({
  text,
  voice = "ja-JP-NanamiNeural",
  className = "",
}: SpeakButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handleClick(event: React.MouseEvent) {
    event.stopPropagation();
    if (status === "loading" || status === "playing") return;
    if (!text) return;

    setStatus("loading");
    try {
      const response = await fetch(
        `/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`
      );
      if (!response.ok) throw new Error("TTS request failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      setStatus("playing");
      audio.onended = () => {
        setStatus("idle");
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setStatus("error");
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Phát âm"
      title="Phát âm"
      className={`btn-press flex h-9 w-9 items-center justify-center rounded-full bg-leaf-200 text-kanjibrown shadow hover:bg-leaf-300 hover:brightness-95 ${className}`}
    >
      {status === "loading" ? <SpinnerIcon /> : <SpeakerIcon isPlaying={status === "playing"} />}
    </button>
  );
}

function SpeakerIcon({ isPlaying }: { isPlaying: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
      <path
        d="M4 9v6h4l5 4V5L8 9H4Z"
        fill="currentColor"
      />
      <path
        d="M16 8.5c1 1 1 6 0 7"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        opacity={isPlaying ? 1 : 0.55}
      />
      <path
        d="M18.5 6.5c2 2.2 2 8.8 0 11"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        opacity={isPlaying ? 1 : 0.3}
      />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2.5} opacity={0.25} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}
