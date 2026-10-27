import React from "react";
import { SparklesIcon, YoutubeIcon } from "../common/Icons";

export default function Hero() {
  return (
    <div className="text-center max-w-3xl mx-auto mb-10 pt-4">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-5 shadow-sm">
        <span>Ayush PARTY ROOM</span>
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display tracking-tight leading-tight sm:leading-none mb-4">
        Watch YouTube Together,{" "}
        <span className="bg-gradient-to-r from-brand-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
          Perfect In Sync
        </span>
      </h1>
      <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
        Stream YouTube with friends across the world. Control playback
        seamlessly with Host and Moderator permissions, real-time approval
        queues, and persistent MongoDB chat.
      </p>
    </div>
  );
}
