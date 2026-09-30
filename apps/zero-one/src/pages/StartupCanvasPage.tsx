import React from 'react';
import { useSimulation } from '../services/simulationContext';
import { FileText, Save, CheckCircle2, History, Sparkles } from 'lucide-react';
import { StartupCanvas } from '../types';

interface StartupCanvasPageProps {
  onNavigate: (view: string) => void;
}

export const StartupCanvasPage: React.FC<StartupCanvasPageProps> = ({ onNavigate }) => {
  const { canvas, updateCanvasField, currentTeam } = useSimulation();

  const sections: { key: keyof Omit<StartupCanvas, 'teamId' | 'lastSavedAt' | 'lastSavedBy' | 'version'>; title: string; placeholder: string; helper: string }[] = [
    {
      key: 'problem',
      title: '1. Problem Statement',
      placeholder: 'What critical pain point does your customer experience daily?',
      helper: 'Quantify frequency, frustration, and current inadequate hacks.',
    },
    {
      key: 'customer',
      title: '2. Target Customer Persona',
      placeholder: 'Who is the early adopter with the highest willingness to pay?',
      helper: 'Specific demographic, behavioral habits, and spending budget.',
    },
    {
      key: 'solution',
      title: '3. Solution & Core Value',
      placeholder: 'How does your product solve this problem 10x better?',
      helper: 'Focus on simplicity, speed, and tangible output.',
    },
    {
      key: 'usp',
      title: '4. Unique Selling Proposition (USP)',
      placeholder: 'What is your unfair competitive moat?',
      helper: 'IP, network effects, distribution advantage, or unique dataset.',
    },
    {
      key: 'revenueModel',
      title: '5. Revenue Model & Monetization',
      placeholder: 'How do you charge? (e.g. 12% escrow commission, SaaS fee)',
      helper: 'Average order value, margins, and recurring mechanism.',
    },
    {
      key: 'costStructure',
      title: '6. Cost Structure & Burn',
      placeholder: 'What are the major operational expenses?',
      helper: 'Hosting, gateway fees, talent honorariums, CAC.',
    },
    {
      key: 'marketingStrategy',
      title: '7. Marketing & Go-To-Market',
      placeholder: 'How do you acquire the first 1,000 users without ads?',
      helper: 'Campus clubs, organic loops, ambassador programs.',
    },
    {
      key: 'competitors',
      title: '8. Competitor Intelligence',
      placeholder: 'Who else plays here, and why do they fall short?',
      helper: 'Direct rivals, indirect alternatives, inertia.',
    },
    {
      key: 'traction',
      title: '9. Traction & Milestones',
      placeholder: 'Real metrics achieved during the simulation.',
      helper: 'Pre-signups, pilot contracts, waitlist count.',
    },
    {
      key: 'businessAssumptions',
      title: '10. Riskiest Business Assumptions',
      placeholder: 'What assumption could kill your startup if proven wrong?',
      helper: 'Trust barrier, willingness to pay, supplier churn.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header with Autosave status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
                Startup Canvas
              </h1>
              <span className="badge badge-amber text-xs font-mono">
                v{canvas.version}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Team {currentTeam.name} • Continuous Background Synchronization
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Autosaved at {new Date(canvas.lastSavedAt).toLocaleTimeString()}</span>
            </span>

            <button
              onClick={() => onNavigate('team-dashboard')}
              className="btn-secondary py-1.5 px-4 text-xs font-bold"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* 10 Canvas Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((sec) => (
            <div key={sec.key} className="card p-5 space-y-2 hover:border-orange-400 transition-colors">
              <div className="flex items-center justify-between">
                <label className="font-heading font-extrabold text-sm text-stone-900 dark:text-stone-100">
                  {sec.title}
                </label>
                <span className="text-[10px] text-stone-400 font-mono">
                  {canvas[sec.key]?.length || 0} chars
                </span>
              </div>

              <textarea
                rows={3}
                value={canvas[sec.key] || ''}
                onChange={(e) => updateCanvasField(sec.key, e.target.value)}
                placeholder={sec.placeholder}
                className="w-full text-xs leading-relaxed resize-none p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 focus:bg-white dark:focus:bg-[#12141C]"
              />

              <p className="text-[11px] text-stone-400 italic">
                {sec.helper}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
