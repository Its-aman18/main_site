import React, { useState } from 'react';
import { useSimulation } from '../services/simulationContext';
import { MarketItem, PurchaseProposal } from '../types';
import { ShoppingBag, ArrowRight, ShieldCheck, XCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PurchaseProposalModalProps {
  item: MarketItem;
  onClose: () => void;
}

export const PurchaseProposalModal: React.FC<PurchaseProposalModalProps> = ({ item, onClose }) => {
  const {
    currentRole,
    getBalance,
    getRunwayMonths,
    proposePurchase,
    eventConfig,
  } = useSimulation();

  const balanceBefore = getBalance();
  const balanceAfter = balanceBefore - item.currentPrice;
  const currentRunway = getRunwayMonths();
  const projectedRunway = Math.max(0, Number((balanceAfter / 120000).toFixed(1)));

  const isAboveThreshold = item.currentPrice >= eventConfig.twoKeyApprovalThreshold;

  const [selectedReason, setSelectedReason] = useState<PurchaseProposal['reasonCategory']>('Marketing');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProposeOrBuy = () => {
    const res = proposePurchase(item.sku, selectedReason);
    if (res.success) {
      setFeedbackMessage({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setFeedbackMessage({ type: 'error', text: res.message });
    }
  };

  const reasonChips: PurchaseProposal['reasonCategory'][] = [
    'Product',
    'Marketing',
    'Hiring',
    'Operations',
    'Defensive',
    'Growth',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="card w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-[#12141C] shadow-2xl rounded-3xl border border-stone-200 dark:border-stone-800 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-stone-900 dark:text-stone-100">
                {isAboveThreshold ? 'Propose Purchase' : 'Confirm Purchase'}
              </h3>
              <p className="text-xs text-stone-500">
                {isAboveThreshold ? 'Requires CEO Two-Key Approval' : 'Direct Role Commitment'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {feedbackMessage ? (
          <div
            className={`p-6 rounded-2xl text-center mb-4 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            )}
            <p className="font-semibold text-sm">{feedbackMessage.text}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Item Card Overview */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  {item.category}
                </span>
                <div className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                  {item.name}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Stock remaining: {item.stockRemaining} units
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-stone-900 dark:text-stone-100 font-mono">
                  ₹ {item.currentPrice.toLocaleString('en-IN')}
                </div>
                {item.priceChangePct !== 0 && (
                  <span
                    className={`text-[11px] font-bold font-mono ${
                      item.priceChangePct > 0 ? 'text-red-500' : 'text-emerald-500'
                    }`}
                  >
                    {item.priceChangePct > 0 ? `▲ +${item.priceChangePct}%` : `▼ ${item.priceChangePct}%`}
                  </span>
                )}
              </div>
            </div>

            {/* Runway and Capital Delta */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60">
                <span className="text-stone-400 block mb-0.5 font-medium">Available Capital</span>
                <div className="flex items-center gap-1.5 font-mono font-bold">
                  <span className="text-stone-500 line-through">₹{balanceBefore.toLocaleString('en-IN')}</span>
                  <ArrowRight className="w-3 h-3 text-orange-500" />
                  <span className={balanceAfter < 0 ? 'text-red-500' : 'text-stone-900 dark:text-stone-100'}>
                    ₹{balanceAfter.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60">
                <span className="text-stone-400 block mb-0.5 font-medium">Runway Health</span>
                <div className="flex items-center gap-1.5 font-mono font-bold">
                  <span className="text-stone-500">{currentRunway} mo</span>
                  <ArrowRight className="w-3 h-3 text-orange-500" />
                  <span className={projectedRunway < 2 ? 'text-red-500' : 'text-emerald-500'}>
                    {projectedRunway} mo
                  </span>
                </div>
              </div>
            </div>

            {/* Reason Chips (No long typing under pressure!) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
                Strategic Allocation Reason:
              </label>
              <div className="flex flex-wrap gap-2">
                {reasonChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setSelectedReason(chip)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedReason === chip
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-500/30'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {isAboveThreshold && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Two-Key Security:</strong> Purchases over ₹{eventConfig.twoKeyApprovalThreshold.toLocaleString('en-IN')} require CEO validation before funds are committed to the ledger.
                </span>
              </div>
            )}

            {/* Action Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary w-1/3 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProposeOrBuy}
                disabled={balanceAfter < 0}
                className="btn-primary w-2/3 py-2.5 text-sm font-bold shadow-lg shadow-orange-500/25"
              >
                {isAboveThreshold ? 'Propose to CEO →' : 'Confirm Purchase (₹' + item.currentPrice.toLocaleString('en-IN') + ')'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
