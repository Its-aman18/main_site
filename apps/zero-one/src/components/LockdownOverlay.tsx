import React, { useState, useEffect } from 'react';
import { useSimulation } from '../services/simulationContext';
import { Lock, AlertOctagon } from 'lucide-react';

export const LockdownOverlay: React.FC = () => {
  const { isLockdownActive, eventStatus } = useSimulation();
  const [secondsToFreeze, setSecondsToFreeze] = useState<number>(60);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [lockdownTimestamp, setLockdownTimestamp] = useState<string>('');

  useEffect(() => {
    if (!isLockdownActive && eventStatus !== 'LOCKDOWN') {
      setIsFrozen(false);
      setSecondsToFreeze(60);
      return;
    }

    if (secondsToFreeze > 0) {
      const timer = setInterval(() => {
        setSecondsToFreeze((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsFrozen(true);
            setLockdownTimestamp(new Date().toTimeString().split(' ')[0]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLockdownActive, eventStatus, secondsToFreeze]);

  if (!isLockdownActive && eventStatus !== 'LOCKDOWN') return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end p-4 md:p-8">
      {/* 60s Room-wide Countdown banner if not fully frozen yet */}
      {!isFrozen ? (
        <div className="pointer-events-auto max-w-xl mx-auto w-full bg-red-600/95 text-white p-5 rounded-3xl shadow-2xl backdrop-blur-md border border-red-400 flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-white animate-spin" />
            <div>
              <div className="font-heading font-black text-lg uppercase tracking-wider">
                LOCKDOWN IMMINENT
              </div>
              <div className="text-xs text-red-100">
                All market orders and ledger mutations closing room-wide.
              </div>
            </div>
          </div>
          <div className="text-3xl font-black font-mono bg-red-800/80 px-4 py-1.5 rounded-2xl border border-red-300">
            00:{secondsToFreeze.toString().padStart(2, '0')}
          </div>
        </div>
      ) : (
        /* Full Room Freeze Screen */
        <div className="pointer-events-auto fixed inset-0 bg-stone-950/85 backdrop-blur-lg flex items-center justify-center p-6 text-center z-[100] animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-[#12141C] p-8 rounded-3xl border border-red-500/40 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-950 text-red-500 mx-auto flex items-center justify-center border border-red-500/30">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-black font-heading uppercase tracking-tight text-white">
                BOOKS CLOSED
              </h2>
              <p className="text-sm text-stone-400">
                Official Zero → One Event Simulation Freeze
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 text-stone-300 text-xs font-mono">
              <div>SERVER TIMESTAMP: {lockdownTimestamp || '16:30:00 IST'}</div>
              <div className="text-emerald-400 mt-1">ALL AUDIT LOGS COMMITTED & LOCKED</div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Financial ledger, canvas edits, inventory, and trades are permanently finalized for Qualifier Judging & Deliberation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
