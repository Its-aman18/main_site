import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Award, CheckCircle2 } from 'lucide-react';
import { zoStyles } from './zeroOneTheme';

interface ZeroOneHeroProps {
  onStartMission: () => void;
  onViewMap: () => void;
  isRegistered: boolean;
  participantCount?: number;
  teamCount?: number;
}

export const ZeroOneHero: React.FC<ZeroOneHeroProps> = ({
  onStartMission,
  onViewMap,
  isRegistered,
  participantCount = 250,
  teamCount = 60,
}) => {
  return (
    <div className="relative overflow-hidden bg-[#140904] text-[#FFF7ED] py-8 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-amber-500/15">
      {/* Background radial gradients for warm cosmic glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-600/15 via-orange-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[450px] h-[450px] bg-gradient-to-t from-orange-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            {/* Title Section matching Reference Image Panel 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-2"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-[#FFF7ED] leading-none drop-shadow-sm">
                ZERO <span className="text-amber-400 font-sans">→</span> ONE
              </h1>
              <div className="text-2xl sm:text-3xl font-display font-extrabold tracking-widest text-amber-400 uppercase">
                STARTUP SIMULATION
              </div>
            </motion.div>

            {/* Stage Progression Flow Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-300/80 bg-[#241006] px-4 py-2 rounded-xl border border-amber-500/25"
            >
              <span className="text-amber-400 font-bold">IDEA</span>
              <span className="text-amber-500/50">→</span>
              <span className="text-amber-400 font-bold">BUILD</span>
              <span className="text-amber-500/50">→</span>
              <span className="text-amber-400 font-bold">VALIDATE</span>
              <span className="text-amber-500/50">→</span>
              <span className="text-amber-400 font-bold">GROW</span>
              <span className="text-amber-500/50">→</span>
              <span className="text-amber-400 font-bold">SCALE</span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-[#FED7AA]/90 max-w-xl leading-relaxed"
            >
              A hands-on startup simulation event to turn your ideas into real-world solutions. Assemble your founder squad, tackle live game levels, defend against market crises, and scale from ZERO to ONE.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <button
                onClick={onStartMission}
                className={zoStyles.btnPrimary}
              >
                <span>{isRegistered ? 'Continue Mission' : 'Start Mission'}</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>

              <button
                onClick={onViewMap}
                className={zoStyles.btnSecondary}
              >
                <Compass className="mr-2 w-4 h-4 text-amber-400" />
                <span>View Mission Map</span>
              </button>
            </motion.div>
          </div>

          {/* Right Column: Hero Visual + Mission Status Box */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Top Status Card matching Panel 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="self-end w-full max-w-xs bg-[#241006]/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md"
            >
              <div className="text-[10px] uppercase font-mono tracking-wider text-amber-400/80 mb-0.5">
                MISSION STATUS
              </div>
              <div className="text-xl font-display font-black text-amber-400 mb-3 flex items-center justify-between">
                <span>READY</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#FED7AA]/80 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>System Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Event: Live Soon</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Teams: {teamCount}/60 Cap</span>
                </div>
              </div>
            </motion.div>

            {/* Robot Illustration Frame */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-[#1B0C05] group"
            >
              <img
                src="/zero-one/hero-robot.jpg"
                alt="ZERO → ONE Robotics Assistant"
                className="w-full h-[260px] sm:h-[300px] object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#140904] via-transparent to-transparent opacity-80" />
              
              {/* Bottom Quote Card inside visual container */}
              <div className="absolute bottom-3 left-3 right-3 bg-[#241006]/90 backdrop-blur-md p-3.5 rounded-xl border border-amber-500/25">
                <div className="font-display font-bold text-amber-300 text-sm">
                  From Ideas to Impact
                </div>
                <div className="text-xs text-[#FED7AA]/70">
                  A journey of innovation, teamwork and execution.
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Metrics Bar matching Panel 1 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-amber-500/15"
        >
          <div className="flex flex-col items-center sm:items-start p-3 bg-[#241006]/50 rounded-xl border border-amber-500/10">
            <div className="text-2xl sm:text-3xl font-display font-black text-amber-400">
              {participantCount}+
            </div>
            <div className="text-xs text-[#FED7AA]/70 uppercase tracking-wider font-mono">
              Participants
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start p-3 bg-[#241006]/50 rounded-xl border border-amber-500/10">
            <div className="text-2xl sm:text-3xl font-display font-black text-amber-400">
              {teamCount}+
            </div>
            <div className="text-xs text-[#FED7AA]/70 uppercase tracking-wider font-mono">
              Teams
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start p-3 bg-[#241006]/50 rounded-xl border border-amber-500/10">
            <div className="text-2xl sm:text-3xl font-display font-black text-amber-400">
              5
            </div>
            <div className="text-xs text-[#FED7AA]/70 uppercase tracking-wider font-mono">
              Game Levels
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start p-3 bg-[#241006]/50 rounded-xl border border-amber-500/10">
            <div className="text-2xl sm:text-3xl font-display font-black text-orange-400 flex items-center gap-1.5">
              <span>1</span>
              <Award className="w-5 h-5 text-yellow-400 inline" />
            </div>
            <div className="text-xs text-[#FED7AA]/70 uppercase tracking-wider font-mono">
              Ultimate Mission
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
