import React, { useState } from 'react';
import { useSimulation } from '../services/simulationContext';
import { Package, Receipt, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InventoryTransactionsPageProps {
  initialTab?: 'INVENTORY' | 'TRANSACTIONS';
  onNavigate: (view: string) => void;
}

export const InventoryTransactionsPage: React.FC<InventoryTransactionsPageProps> = ({
  initialTab = 'INVENTORY',
  onNavigate,
}) => {
  const { inventory, ledger, getBalance, reversePurchase, eventConfig } = useSimulation();
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'TRANSACTIONS'>(initialTab);
  const [feedback, setFeedback] = useState<string | null>(null);

  const balance = getBalance();

  const handleReverse = (entryId: string) => {
    const res = reversePurchase(entryId);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 py-8 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h1 className="text-3xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
              {activeTab === 'INVENTORY' ? 'Team Inventory' : 'Append-Only Ledger'}
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Available Capital Balance: ₹{balance.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-full border border-stone-200 dark:border-stone-800 text-xs">
              <button
                onClick={() => setActiveTab('INVENTORY')}
                className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                  activeTab === 'INVENTORY'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Inventory ({inventory.length})
              </button>
              <button
                onClick={() => setActiveTab('TRANSACTIONS')}
                className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                  activeTab === 'TRANSACTIONS'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Ledger ({ledger.length})
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

        {/* Tab 1: Inventory List */}
        {activeTab === 'INVENTORY' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.length === 0 ? (
              <div className="col-span-full card p-12 text-center text-stone-400 text-sm">
                No items in inventory. Visit the Digital Market to purchase resources.
              </div>
            ) : (
              inventory.map((item) => (
                <div key={item.id} className="card p-5 space-y-2 border hover:border-orange-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-amber text-[10px]">
                      {item.category}
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-500">
                      Qty: {item.qty}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-stone-900 dark:text-stone-100">
                    {item.name}
                  </h3>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-xs flex justify-between items-center text-stone-500">
                    <span>Acquired in {item.round}</span>
                    <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                      ₹{item.acquiredPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Tab 2: Append-Only Financial Ledger */
          <div className="card overflow-hidden shadow-lg border border-stone-200 dark:border-stone-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 uppercase tracking-wider font-bold text-stone-500">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Reason Tag</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
                  {ledger.map((entry) => {
                    const isDebit = entry.type === 'DEBIT';
                    const elapsedSecs = (Date.now() - new Date(entry.createdAt).getTime()) / 1000;
                    const canUndo = isDebit && elapsedSecs <= eventConfig.undoWindowSeconds;

                    return (
                      <tr key={entry.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/30">
                        <td className="py-3 px-4 text-stone-400">
                          {new Date(entry.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              !isDebit
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                            }`}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans font-semibold text-stone-800 dark:text-stone-200">
                          {entry.description}
                        </td>
                        <td className="py-3 px-4 text-stone-500">
                          {entry.reasonTag}
                        </td>
                        <td className="py-3 px-4 text-stone-500">
                          {entry.actorRole}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold text-sm ${
                            !isDebit ? 'text-emerald-600' : 'text-stone-900 dark:text-stone-100'
                          }`}
                        >
                          {!isDebit ? '+' : '-'}₹ {entry.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {canUndo ? (
                            <button
                              onClick={() => handleReverse(entry.id)}
                              className="px-2.5 py-1 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-orange-500 hover:text-white font-sans text-[11px] font-bold transition-colors flex items-center gap-1 mx-auto"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Undo
                            </button>
                          ) : (
                            <span className="text-stone-300 dark:text-stone-700 text-[10px]">
                              Committed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
