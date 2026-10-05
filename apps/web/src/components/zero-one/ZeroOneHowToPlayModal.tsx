import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';
import { zoStyles } from './zeroOneTheme';

interface ZeroOneHowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZeroOneHowToPlayModal: React.FC<ZeroOneHowToPlayModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'how' | 'rules' | 'schedule' | 'faq'>('how');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-[#220F06] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex items-center justify-between border-b border-amber-500/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                GAME MANUAL & PROTOCOLS
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-[#FFF7ED]">
                ZERO → ONE Guide
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#180B04] border border-amber-500/20 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-amber-500/15 pb-3 text-xs font-mono">
          <button
            onClick={() => setActiveTab('how')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'how'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-[#FED7AA]/70 hover:text-white'
            }`}
          >
            How to Play
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'rules'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-[#FED7AA]/70 hover:text-white'
            }`}
          >
            Rules & Security
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'schedule'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-[#FED7AA]/70 hover:text-white'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'faq'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-[#FED7AA]/70 hover:text-white'
            }`}
          >
            FAQ
          </button>
        </div>

        {/* How to Play Content */}
        {activeTab === 'how' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#FED7AA]/90">
            <p className="leading-relaxed">
              ZERO → ONE is an interactive startup simulation game where teams evolve a conceptual problem into a validated enterprise solution across 5 sequential levels.
            </p>

            <div className="space-y-2.5">
              {[
                { step: '1', title: 'Register & Assemble Squad', desc: 'Sign in, choose your founder seat (CEO, CTO, CFO, CMO), and invite up to 4 teammates using your 8-character squad invite code.' },
                { step: '2', title: 'Enter Level 01 (Discover)', desc: 'Clarify target users, define problem scope, and establish product differentiation.' },
                { step: '3', title: 'Complete Objectives', desc: 'Build working prototypes, deploy code, and record milestone evidence in the objective ledger.' },
                { step: '4', title: 'Submit for Mission Control Review', desc: 'Post prototype links, code repositories, or pitch decks before the timer expires.' },
                { step: '5', title: 'Unlock Next Level & Climb Leaderboard', desc: 'Earn XP, gain rank, and unlock Level 02 (Build) through Level 05 (Scale).' },
                { step: '6', title: 'The Ultimate Pitch (Level 06)', desc: 'Defend your venture live on stage before the VC jury to achieve ZERO → ONE.' },
              ].map((s) => (
                <div key={s.step} className="p-3 rounded-2xl bg-[#190B05] border border-amber-500/20 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <div className="font-bold text-[#FFF7ED]">{s.title}</div>
                    <div className="text-xs text-[#FED7AA]/70 mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules & Security */}
        {activeTab === 'rules' && (
          <div className="space-y-3 text-xs sm:text-sm text-[#FED7AA]/90">
            <div className="p-3.5 rounded-2xl bg-[#190B05] border border-amber-500/20 space-y-1">
              <div className="font-bold text-amber-400">Server-Authoritative Progression</div>
              <p className="text-xs text-[#FED7AA]/70">
                Level unlocks and completion states are validated directly by the backend database. Client-side URL tampering or DevTools edits cannot bypass locked levels.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#190B05] border border-amber-500/20 space-y-1">
              <div className="font-bold text-amber-400">Team Collaboration & Submissions</div>
              <p className="text-xs text-[#FED7AA]/70">
                Any squad member can edit and submit deliverables, but each level accepts only one authoritative team submission per active round.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#190B05] border border-amber-500/20 space-y-1">
              <div className="font-bold text-amber-400">Time Constraints & Automatic Lock</div>
              <p className="text-xs text-[#FED7AA]/70">
                When the mission timer reaches 00:00:00, Mission Control locks the level for judging. Late submissions cannot be processed.
              </p>
            </div>
          </div>
        )}

        {/* Schedule */}
        {activeTab === 'schedule' && (
          <div className="space-y-2.5 text-xs">
            {[
              { time: '10:00 AM', title: 'Arena Opening & Genesis', desc: 'Squad formation, role assignment, and Level 01 kickoff.' },
              { time: '11:00 AM', title: 'Level 02: Build & MVP', desc: 'Architecture development, prototype assembly, and feature freeze.' },
              { time: '01:30 PM', title: 'Level 03: Validate & Testing', desc: 'Peer testing, user feedback collection, and market metric logging.' },
              { time: '03:00 PM', title: 'Level 04 & 05: Grow & Scale', desc: 'Unit economics, flash crisis scenarios, and go-to-market plan.' },
              { time: '04:30 PM', title: 'Level 06: Final Pitch Defense', desc: 'Auditorium main stage defense before VC jury.' },
            ].map((ev, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#190B05] border border-amber-500/15">
                <span className="font-mono font-bold text-amber-400 shrink-0">{ev.time}</span>
                <div>
                  <div className="font-bold text-[#FFF7ED]">{ev.title}</div>
                  <div className="text-[#FED7AA]/70 mt-0.5">{ev.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#190B05] border border-amber-500/15">
              <div className="font-bold text-amber-300">Can solo founders participate?</div>
              <p className="text-[#FED7AA]/70 mt-1">
                Yes! While squads of 3-5 are recommended, solo founders can create a team and compete under the same rulebook.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#190B05] border border-amber-500/15">
              <div className="font-bold text-amber-300">What deliverables are required?</div>
              <p className="text-[#FED7AA]/70 mt-1">
                Depending on the level, teams submit Figma links, live deployed web applications, GitHub repos, or PDF pitch decks.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#190B05] border border-amber-500/15">
              <div className="font-bold text-amber-300">How is the leaderboard scored?</div>
              <p className="text-[#FED7AA]/70 mt-1">
                XP is awarded for completing objectives, bonus points for early submission, and evaluation scores from the VC judging rounds.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button onClick={onClose} className={zoStyles.btnPrimary}>
            Understood • Ready to Play
          </button>
        </div>
      </motion.div>
    </div>
  );
};
