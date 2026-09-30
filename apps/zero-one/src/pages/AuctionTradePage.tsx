import React, { useState } from 'react';
import { useSimulation } from '../services/simulationContext';
import { Gavel, ArrowLeftRight, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AuctionTradePageProps {
  onNavigate: (view: string) => void;
}

export const AuctionTradePage: React.FC<AuctionTradePageProps> = ({ onNavigate }) => {
  const {
    activeAuction,
    placeAuctionBid,
    teams,
    currentTeam,
    inventory,
    trades,
    proposeTrade,
    acceptTrade,
    getBalance,
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<'AUCTION' | 'TRADE'>('AUCTION');
  const [bidAmount, setBidAmount] = useState<number>(180000);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Trade form state
  const [targetTeamId, setTargetTeamId] = useState<string>(teams[1]?.id || 'team-01');
  const [selectedSku, setSelectedSku] = useState<string>(inventory[0]?.sku || 'DEVELOPER-HIRE');
  const [requestedCash, setRequestedCash] = useState<number>(75000);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAuction) return;
    const res = placeAuctionBid(activeAuction.id, bidAmount);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = proposeTrade(targetTeamId, selectedSku, requestedCash);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h1 className="text-3xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
              Auction & Trade Desk
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Available Capital: ₹{getBalance().toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-full border border-stone-200 dark:border-stone-800 text-xs">
              <button
                onClick={() => setActiveTab('AUCTION')}
                className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                  activeTab === 'AUCTION'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Sealed Auction
              </button>
              <button
                onClick={() => setActiveTab('TRADE')}
                className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                  activeTab === 'TRADE'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Peer Trading
              </button>
            </div>

            <button
              onClick={() => onNavigate('team-dashboard')}
              className="btn-secondary py-1.5 px-4 text-xs font-bold"
            >
              Dashboard
            </button>
          </div>
        </div>

        {feedback && (
          <div className="p-4 rounded-2xl bg-stone-900 text-white text-xs font-bold flex items-center gap-2 shadow-xl animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Tab 1: Sealed-Bid Auction (Rule 33) */}
        {activeTab === 'AUCTION' ? (
          <div className="space-y-6">
            {activeAuction ? (
              <div className="card p-6 sm:p-8 space-y-5 border-2 border-orange-500/30">
                <div className="flex items-center justify-between">
                  <span className="badge badge-orange text-xs font-bold">
                    Sealed-Bid Active
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-stone-500">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span>Closes in 09:42</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-heading font-black text-2xl text-stone-900 dark:text-stone-100">
                    {activeAuction.title}
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {activeAuction.description}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 text-xs text-stone-500 space-y-1">
                  <div>
                    Minimum Reserve Bid:{' '}
                    <strong className="text-stone-900 dark:text-stone-100 font-mono">
                      ₹{activeAuction.minimumBid.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    Bids remain confidential until closing. Winner revealed on auditorium projector screen.
                  </div>
                </div>

                <form onSubmit={handlePlaceBid} className="space-y-3 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                    Your Team Sealed Bid (₹):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={activeAuction.minimumBid}
                      step={5000}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="w-full text-base font-mono font-bold"
                      required
                    />
                    <button
                      type="submit"
                      className="btn-primary py-2.5 px-7 text-xs font-bold whitespace-nowrap shadow-md shadow-orange-500/25"
                    >
                      Place Sealed Bid
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="card p-12 text-center text-stone-400 text-sm">
                No sealed auction currently open.
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: Peer-to-Peer Trading Desk (Rule 34) */
          <div className="space-y-6">
            <form onSubmit={handleTradeSubmit} className="card p-6 space-y-4">
              <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                Propose Resource Swap
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Target Squad:</label>
                  <select
                    value={targetTeamId}
                    onChange={(e) => setTargetTeamId(e.target.value)}
                    className="w-full text-xs"
                  >
                    {teams
                      .filter((t) => t.id !== currentTeam.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.teamCode} ({t.name})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Offered Item:</label>
                  <select
                    value={selectedSku}
                    onChange={(e) => setSelectedSku(e.target.value)}
                    className="w-full text-xs"
                  >
                    {inventory.map((inv) => (
                      <option key={inv.sku} value={inv.sku}>
                        {inv.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Requested Cash (₹):</label>
                  <input
                    type="number"
                    step={5000}
                    value={requestedCash}
                    onChange={(e) => setRequestedCash(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold"
                    required
                  />
                </div>

                <div className="sm:col-span-3 pt-2">
                  <button
                    type="submit"
                    className="btn-primary py-2 px-6 text-xs font-bold"
                  >
                    Dispatch Trade Offer →
                  </button>
                </div>
              </div>
            </form>

            {/* Active Trade Offers */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">
                Active Trade Proposals
              </h4>

              {trades.length === 0 ? (
                <div className="card p-6 text-center text-xs text-stone-400">
                  No active trade offers pending. Max 1 trade per team per round safety rule applies.
                </div>
              ) : (
                trades.map((trade) => (
                  <div
                    key={trade.id}
                    className="card p-4 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        {trade.fromTeamName} → {trade.toTeamName}
                      </div>
                      <div className="text-stone-500">
                        Offering {trade.offeredItemName} for ₹{trade.requestedCashAmount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="badge badge-amber text-[10px]">
                        {trade.status}
                      </span>
                      {trade.status === 'PROPOSED' && trade.toTeamId === currentTeam.id && (
                        <button
                          onClick={() => acceptTrade(trade.id)}
                          className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px]"
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
