import React, { useState } from 'react';
import { useSimulation } from '../services/simulationContext';
import { MarketItem, ItemCategory } from '../types';
import {
  Cloud,
  Send,
  TrendingUp,
  Scale,
  Palette,
  FileCode,
  Search,
  Building2,
  Code2,
  GraduationCap,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { PurchaseProposalModal } from '../components/PurchaseProposalModal';

interface DigitalMarketPageProps {
  onNavigate: (view: string) => void;
}

export const DigitalMarketPage: React.FC<DigitalMarketPageProps> = ({ onNavigate }) => {
  const {
    marketItems,
    currentRole,
    purchaseProposals,
    approveProposal,
    rejectProposal,
    getBalance,
  } = useSimulation();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState<MarketItem | null>(null);

  const categories = [
    'All',
    'Technology',
    'Marketing',
    'Human Resources',
    'Operations',
    'Infrastructure',
  ];

  const filteredItems = marketItems.filter((item) => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  // Map icon strings to Lucide components
  const renderItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cloud':
        return <Cloud className="w-5 h-5 text-blue-500" />;
      case 'Send':
        return <Send className="w-5 h-5 text-orange-500" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-blue-400" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-pink-500" />;
      case 'FileCode':
        return <FileCode className="w-5 h-5 text-blue-600" />;
      case 'Search':
        return <Search className="w-5 h-5 text-teal-500" />;
      case 'Building2':
        return <Building2 className="w-5 h-5 text-emerald-500" />;
      case 'Code2':
        return <Code2 className="w-5 h-5 text-indigo-500" />;
      default:
        return <GraduationCap className="w-5 h-5 text-amber-500" />;
    }
  };

  const pendingProposals = purchaseProposals.filter((p) => p.status === 'PENDING_CEO_APPROVAL');

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Market Title Header matching Screenshot 4 */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
            Digital Market
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Purchase resources to grow your startup. Prices may change based on demand.
          </p>
        </div>

        {/* CEO Approvals Banner if pending */}
        {pendingProposals.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Two-Key Purchase Proposals Requiring CEO Approval ({pendingProposals.length})</span>
            </div>

            <div className="space-y-2">
              {pendingProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#12141C] border border-amber-200 dark:border-amber-800/80 gap-3"
                >
                  <div>
                    <div className="text-sm font-extrabold text-stone-900 dark:text-stone-100">
                      {proposal.itemName} • ₹{proposal.price.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-stone-500">
                      Proposed by {proposal.proposedByRole} for strategic {proposal.reasonCategory} allocation.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentRole === 'CEO' || currentRole === 'ADMIN' ? (
                      <>
                        <button
                          onClick={() => approveProposal(proposal.id)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 hover:bg-emerald-700 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve Spend
                        </button>
                        <button
                          onClick={() => rejectProposal(proposal.id)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600">
                        Awaiting CEO sign-off
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Pills matching Screenshot 4 */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-white dark:bg-[#12141C] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-orange-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 8 Item Cards Grid matching Screenshot 4 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.sku}
              className="card p-5 flex flex-col justify-between space-y-4 hover:border-orange-400 dark:hover:border-orange-500 transition-all group"
            >
              <div>
                {/* Top icon and category */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {renderItemIcon(item.icon || '')}
                  </div>

                  <span className="text-[11px] font-semibold text-stone-400">
                    {item.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
                  {item.name}
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                  {item.unlocksDescription}
                </p>
              </div>

              {/* Price, Stock, and Buy Button */}
              <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-black text-stone-900 dark:text-stone-100 font-mono">
                    ₹ {item.currentPrice.toLocaleString('en-IN')}
                  </div>

                  {item.priceChangePct !== 0 && (
                    <span
                      className={`text-[11px] font-bold font-mono ${
                        item.priceChangePct > 0 ? 'text-red-500' : 'text-emerald-500'
                      }`}
                    >
                      {item.priceChangePct > 0 ? `▲ ${item.priceChangePct}%` : `▼ ${Math.abs(item.priceChangePct)}%`}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-stone-400 font-medium">
                  Stock: {item.stockRemaining} left
                </div>

                <button
                  onClick={() => setSelectedItemForPurchase(item)}
                  disabled={item.stockRemaining <= 0}
                  className="btn-primary w-full py-2 text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  {item.stockRemaining <= 0 ? 'Sold Out' : 'Buy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for purchase */}
      {selectedItemForPurchase && (
        <PurchaseProposalModal
          item={selectedItemForPurchase}
          onClose={() => setSelectedItemForPurchase(null)}
        />
      )}
    </div>
  );
};
