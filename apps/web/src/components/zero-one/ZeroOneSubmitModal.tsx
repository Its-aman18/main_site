import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Link2, FileCode, AlertCircle, X } from 'lucide-react';

interface ZeroOneSubmitModalProps {
  levelNumber: number;
  levelTitle: string;
  roundId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (submissionPayload: {
    prototypeUrl: string;
    repoUrl: string;
    deckUrl: string;
    summary: string;
  }) => Promise<void>;
}

export const ZeroOneSubmitModal: React.FC<ZeroOneSubmitModalProps> = ({
  levelNumber,
  levelTitle,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [prototypeUrl, setPrototypeUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [deckUrl, setDeckUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prototypeUrl.trim() && !summary.trim() && !repoUrl.trim()) {
      setError('Please provide at least a prototype link, repository URL, or summary of deliverables.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        prototypeUrl,
        repoUrl,
        deckUrl,
        summary,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Submission failed. Please check network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#220F06] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between border-b border-amber-500/15 pb-4">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
              DELIVERABLE SUBMISSION
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-[#FFF7ED]">
              Complete Mission 0{levelNumber}: {levelTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#180B04] border border-amber-500/20 text-stone-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-amber-300 mb-1 font-bold">
              Clickable Prototype / Live Demo Link (Figma, Vercel, Live App)
            </label>
            <div className="relative">
              <input
                type="url"
                value={prototypeUrl}
                onChange={(e) => setPrototypeUrl(e.target.value)}
                placeholder="https://my-startup.vercel.app or figma.com/proto/..."
                className="w-full bg-[#180B04] border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-sm text-[#FFF7ED] focus:border-amber-400 focus:outline-none"
              />
              <Link2 className="w-4 h-4 text-stone-500 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-amber-300 mb-1 font-bold">
              Code Repository / Technical Artifacts (GitHub / GitLab)
            </label>
            <div className="relative">
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/my-team/zero-to-one-project"
                className="w-full bg-[#180B04] border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-sm text-[#FFF7ED] focus:border-amber-400 focus:outline-none"
              />
              <FileCode className="w-4 h-4 text-stone-500 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-amber-300 mb-1 font-bold">
              Pitch Deck or Startup Canvas PDF Link (Optional)
            </label>
            <input
              type="url"
              value={deckUrl}
              onChange={(e) => setDeckUrl(e.target.value)}
              placeholder="https://drive.google.com/... or canva.com/..."
              className="w-full bg-[#180B04] border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-sm text-[#FFF7ED] focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-amber-300 mb-1 font-bold">
              Executive Problem & Solution Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Briefly summarize your key features, target market, and validation findings..."
              className="w-full bg-[#180B04] border border-amber-500/30 rounded-xl px-3.5 py-2.5 text-sm text-[#FFF7ED] focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-amber-500/15">
            <span className="text-[11px] text-[#FED7AA]/60">
              Writes immutably to your squad competition record.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold shadow-md shadow-amber-500/30 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting…' : 'Complete Mission'}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
