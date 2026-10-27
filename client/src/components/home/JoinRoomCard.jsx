import React, { useState } from "react";
import Button from "../common/Button";
import Input from "../common/Input";
import { UsersIcon } from "../common/Icons";

export default function JoinRoomCard({
  username,
  setUsername,
  initialCode = "",
  onJoin,
  error,
}) {
  const [code, setCode] = useState(initialCode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    if (code.trim().length < 4) return;
    onJoin(code.trim().toUpperCase());
  };

  return (
    <div className="glass-panel border border-slate-700/70 rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <UsersIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">
              Join an Existing Room
            </h2>
            <p className="text-xs text-slate-400">
              Enter a 6-character room code
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your Name"
            placeholder="e.g. Ayush Singh"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={24}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Room Code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB12CD"
              maxLength={6}
              required
              className="w-full rounded-xl bg-dark-900 border border-slate-700/70 text-slate-100 placeholder-slate-500 font-mono text-center tracking-widest text-lg font-bold uppercase py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="w-full mt-2 hover:border-indigo-500/60"
          >
            Enter Room
          </Button>
        </form>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          Got an invite link? Simply paste it into your browser to jump straight
          in!
        </p>
      </div>
    </div>
  );
}
