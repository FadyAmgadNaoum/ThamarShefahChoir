"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Repeat,
  Volume2,
  VolumeX,
  X,
  Music,
  Gauge,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ActiveAudioTrack {
  songId: string;
  title: string;
  copticTitle?: string | null;
  musicalKey?: string | null;
  categoryLabel?: string;
  audioUrl: string;
  audioFileName?: string | null;
}

interface RehearsalAudioPlayerProps {
  track: ActiveAudioTrack | null;
  onClose: () => void;
}

export default function RehearsalAudioPlayer({ track, onClose }: RehearsalAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-play when new track is loaded
  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.loop = isLooping;
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((e) => {
          console.warn("Auto-play blocked or waiting for user interaction:", e);
          setIsPlaying(false);
          setIsLoading(false);
        });
    } else {
      setIsPlaying(false);
    }
  }, [track]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(duration, audioRef.current.currentTime + seconds)
    );
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (audioRef.current) {
      audioRef.current.loop = nextLoop;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {track && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-4 inset-x-0 mx-auto max-w-4xl z-50 px-3 sm:px-4 pointer-events-auto"
        >
          {/* Hidden native HTML5 Audio element */}
          <audio
            ref={audioRef}
            preload="metadata"
            onTimeUpdate={() => {
              if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration || 0);
              }
            }}
            onEnded={() => {
              if (!isLooping) setIsPlaying(false);
            }}
          />

          <div className="apple-glass rounded-3xl p-3.5 sm:p-4 shadow-glass-elevated border border-gold-300/60 bg-surface-canvas/95 backdrop-blur-2xl">
            {/* Scrubber Progress Bar */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-[11px] font-mono font-bold text-charcoal-muted shrink-0 w-10 text-end">
                {formatTime(currentTime)}
              </span>
              <div className="relative flex-1 group flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-surface-border rounded-lg appearance-none cursor-pointer accent-burgundy"
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-charcoal-muted shrink-0 w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Controls & Track Info */}
            <div className="flex items-center justify-between gap-3">
              {/* Track Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-burgundy to-burgundy-dark flex items-center justify-center text-gold shrink-0 shadow-xs">
                  <Music className="w-5 h-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-display font-extrabold text-xs sm:text-sm text-charcoal truncate">
                      {track.title}
                    </h4>
                    {track.musicalKey && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gold-100 text-burgundy border border-gold-300 shrink-0">
                        {track.musicalKey}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-charcoal-muted truncate">
                    {track.copticTitle || track.categoryLabel || "تسجيل بروفة الكورال"}
                    {track.audioFileName ? ` • ${track.audioFileName}` : ""}
                  </p>
                </div>
              </div>

              {/* Player Primary Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* 10s Backward */}
                <button
                  type="button"
                  onClick={() => skipTime(-10)}
                  title="رجوع 10 ثوانٍ"
                  className="p-2 rounded-full hover:bg-surface-border text-charcoal-muted hover:text-burgundy transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Play / Pause */}
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="w-10 h-10 rounded-full bg-burgundy hover:bg-burgundy-dark text-white flex items-center justify-center shadow-xs transition-all transform active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-gold fill-gold" />
                  ) : (
                    <Play className="w-5 h-5 text-gold fill-gold translate-x-0.5" />
                  )}
                </button>

                {/* 10s Forward */}
                <button
                  type="button"
                  onClick={() => skipTime(10)}
                  title="تقديم 10 ثوانٍ"
                  className="p-2 rounded-full hover:bg-surface-border text-charcoal-muted hover:text-burgundy transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Rehearsal Speed, Loop, Volume & Dismiss */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* Rehearsal Speed Button (0.75x, 1x, 1.25x) */}
                <button
                  type="button"
                  onClick={cycleSpeed}
                  title="تغيير سرعة التمرين"
                  className="px-2 py-1 rounded-full text-[11px] font-bold bg-gold-50 hover:bg-gold-100 text-burgundy border border-gold-300 transition-colors flex items-center gap-0.5"
                >
                  <Gauge className="w-3 h-3 text-gold" />
                  <span>{playbackRate}x</span>
                </button>

                {/* Loop Toggle */}
                <button
                  type="button"
                  onClick={toggleLoop}
                  title={isLooping ? "إلغاء التكرار" : "تكرار المقطع"}
                  className={`p-2 rounded-full transition-colors ${
                    isLooping
                      ? "bg-gold-200 text-burgundy font-bold"
                      : "text-charcoal-muted hover:bg-surface-border"
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </button>

                {/* Mute Toggle */}
                <button
                  type="button"
                  onClick={toggleMute}
                  title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
                  className="p-2 rounded-full text-charcoal-muted hover:bg-surface-border transition-colors hidden sm:block"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (audioRef.current) audioRef.current.pause();
                    setIsPlaying(false);
                    onClose();
                  }}
                  className="p-2 rounded-full text-charcoal-muted hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  title="إغلاق المشغل"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

