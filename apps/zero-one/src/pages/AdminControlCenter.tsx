import React, { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../services/simulationContext';
import {
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Clock,
  Ban,
  Check,
  XOctagon,
  Key,
  Download,
  Upload,
  RefreshCw,
  Users,
  ShoppingCart,
  AlertTriangle,
  Gavel,
  Sliders,
  Tv,
  Bell,
  FileCheck,
  CheckCircle,
  FileText,
  DollarSign,
  Radio,
  Lock,
  Plus,
  Trash2,
  Edit,
  ArrowRight,
  TrendingUp,
  Search,
  ExternalLink,
  ChevronRight,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import {
  EventStatus,
  SimulationRole,
  MarketItem,
  CrisisCard,
  AdminPermissionRole,
  AdminAuditLogEntry,
  Announcement,
  ArtifactSubmission,
  StartupCanvas,
} from '../types';
import { BOOTSTRAP_ADMIN_EMAIL } from '../services/adminAuthService';

interface AdminControlCenterProps {
  onNavigate: (view: string) => void;
  initialTab?: string;
}

export const AdminControlCenter: React.FC<AdminControlCenterProps> = ({
  onNavigate,
  initialTab,
}) => {
  const {
    currentUser,
    eventStatus,
    setEventStatus,
    eventConfig,
    updateEventConfig,
    serverTimeRemainingSeconds,
    isClockRunning,
    toggleClock,
    resetClock,
    triggerLockdown,
    revealResults,
    teams,
    updateTeam,
    reissueRoleToDevice,
    ledger,
    getBalance,
    manualLedgerAdjustment,
    grantLoan,
    marketItems,
    addMarketItem,
    updateMarketItem,
    adjustStock,
    crisisCards,
    activeCrisis,
    addCrisisCard,
    dispatchCrisisToTeam,
    extendCrisisTimer,
    resolveCrisisManually,
    canvas,
    canvasStore,
    updateCanvasField,
    artifacts,
    submitArtifact,
    activeAuction,
    auctionBids,
    openAuction,
    closeAuction,
    judgingCriteria,
    updateJudgingCriterion,
    judgeScores,
    floorScores,
    recalculateFloorScores,
    liveScreenConfig,
    updateLiveScreenConfig,
    announcements,
    addAnnouncement,
    auditLogs,
    resetAndReseedSimulation,
    createSnapshot,
    restoreSnapshot,
    // Admin Verification System (Super Admin Controlled)
    adminAuthorizations,
    adminAuditLogs,
    getAdminStatus,
    isAdminVerified,
    isSuperAdmin,
    searchUserByEmail,
    verifyAdminByEmail,
    suspendAdmin,
    revokeAdmin,
    reactivateAdmin,
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<string>(initialTab || 'OVERVIEW');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync tab if initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Super Admin Verification State
  const [searchEmailInput, setSearchEmailInput] = useState('');
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [searchedUser, setSearchedUser] = useState<{
    id: string;
    name: string;
    email: string;
    accountStatus?: string;
    role: string;
    adminStatus: string;
    adminRole?: string | null;
  } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedVerifyRole, setSelectedVerifyRole] = useState<AdminPermissionRole>('ADMIN');
  const [actionLoadingEmail, setActionLoadingEmail] = useState<string | null>(null);

  // Form states
  const [manualTeamId, setManualTeamId] = useState<string>(teams[0]?.id || 'team-07');
  const [manualAdjType, setManualAdjType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [manualAmount, setManualAmount] = useState<number>(50000);
  const [manualReason, setManualReason] = useState<string>('Marshal emergency correction');

  const [loanTeamId, setLoanTeamId] = useState<string>(teams[0]?.id || 'team-07');
  const [loanAmount, setLoanAmount] = useState<number>(200000);
  const [loanInterest, setLoanInterest] = useState<number>(10);

  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');

  const [reissueTeamId, setReissueTeamId] = useState<string>('team-07');
  const [reissueRole, setReissueRole] = useState<SimulationRole>('CFO');
  const [reissueName, setReissueName] = useState<string>('');

  // Crisis Target Team State (Rule 72 & targeted crisis engine)
  const [selectedCrisisTeamId, setSelectedCrisisTeamId] = useState<string>(teams[0]?.id || 'team-07');

  // Custom Event Duration State
  const [customClockMinutes, setCustomClockMinutes] = useState<number>(25);

  // Market Item Creation State
  const [showAddMarketItem, setShowAddMarketItem] = useState<boolean>(false);
  const [newItemSku, setNewItemSku] = useState<string>('');
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<string>('TECH');
  const [newItemPrice, setNewItemPrice] = useState<number>(25000);
  const [newItemStock, setNewItemStock] = useState<number>(10);

  // Auction desk (open form)
  const [showOpenAuction, setShowOpenAuction] = useState<boolean>(false);
  const [newAucTitle, setNewAucTitle] = useState<string>('');
  const [newAucDesc, setNewAucDesc] = useState<string>('');
  const [newAucSku, setNewAucSku] = useState<string>('');
  const [newAucMinBid, setNewAucMinBid] = useState<number>(100000);
  const [newAucMinutes, setNewAucMinutes] = useState<number>(10);

  // Crisis card authoring
  const [showAddCrisis, setShowAddCrisis] = useState<boolean>(false);
  const [newCrisisTitle, setNewCrisisTitle] = useState<string>('');
  const [newCrisisDesc, setNewCrisisDesc] = useState<string>('');
  const [newCrisisCategory, setNewCrisisCategory] = useState<string>('Market');
  const [newCrisisSeverity, setNewCrisisSeverity] = useState<string>('HIGH');
  const [newCrisisTimer, setNewCrisisTimer] = useState<number>(360);

  const [restoreJsonInput, setRestoreJsonInput] = useState<string>('');
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);

  const [auditSearch, setAuditSearch] = useState<string>('');

  // Announcements & Live Screen States
  const [newAnnType, setNewAnnType] = useState<Announcement['type']>('ALERT');
  const [liveTickerInput, setLiveTickerInput] = useState<string>(liveScreenConfig?.announcementTickerText || '');
  // Resync the ticker draft when the config changes elsewhere (e.g. another
  // operator's console), without clobbering in-progress typing.
  const lastTickerSync = useRef<string>(liveScreenConfig?.announcementTickerText || '');
  useEffect(() => {
    const current = liveScreenConfig?.announcementTickerText || '';
    if (current !== lastTickerSync.current) {
      lastTickerSync.current = current;
      setLiveTickerInput(current);
    }
  }, [liveScreenConfig?.announcementTickerText]);

  // Canvas View States
  const [selectedCanvasTeamId, setSelectedCanvasTeamId] = useState<string>(teams[0]?.id || 'team-07');

  // Artifact Deliverables States
  const [artifactKindFilter, setArtifactKindFilter] = useState<string>('ALL');
  const [artifactTeamFilter, setArtifactTeamFilter] = useState<string>('ALL');
  const [showAddArtifactModal, setShowAddArtifactModal] = useState<boolean>(false);
  const [newArtTeamId, setNewArtTeamId] = useState<string>(teams[0]?.id || 'team-07');
  const [newArtKind, setNewArtKind] = useState<ArtifactSubmission['kind']>('PROTOTYPE');
  const [newArtTitle, setNewArtTitle] = useState<string>('');
  const [newArtUrl, setNewArtUrl] = useState<string>('');
  const [newArtDesc, setNewArtDesc] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSearchUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchEmailInput.trim()) {
      setSearchError('Please enter an email address');
      return;
    }
    setSearchError(null);
    setIsSearchingUser(true);
    try {
      const res = await searchUserByEmail(searchEmailInput.trim());
      if (res.found && res.user) {
        setSearchedUser(res.user);
      } else {
        setSearchedUser(null);
        setSearchError(res.error || 'User not found in Code.SCRIET user registry.');
      }
    } catch (err: any) {
      setSearchedUser(null);
      setSearchError(err.message || 'Failed to search user');
    } finally {
      setIsSearchingUser(false);
    }
  };

  const handleVerify = async (email: string) => {
    setActionLoadingEmail(email);
    const res = await verifyAdminByEmail(email, selectedVerifyRole);
    setActionLoadingEmail(null);
    if (res.success) {
      showToast(res.message);
      if (searchedUser && searchedUser.email.toLowerCase() === email.toLowerCase()) {
        setSearchedUser({
          ...searchedUser,
          adminStatus: 'ACTIVE',
          adminRole: selectedVerifyRole,
        });
      }
    } else {
      alert(res.message);
    }
  };

  const handleSuspend = async (email: string) => {
    if (email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      alert('Permanent Super Admin cannot be suspended.');
      return;
    }
    const reason = prompt(`Reason for suspending administrator access for ${email}:`, 'Routine operational audit suspension');
    if (reason === null) return;
    setActionLoadingEmail(email);
    const res = await suspendAdmin(email, reason);
    setActionLoadingEmail(null);
    if (res.success) {
      showToast(res.message);
      if (searchedUser && searchedUser.email.toLowerCase() === email.toLowerCase()) {
        setSearchedUser({ ...searchedUser, adminStatus: 'SUSPENDED' });
      }
    } else {
      alert(res.message);
    }
  };

  const handleRevoke = async (email: string) => {
    if (email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      alert('Permanent Super Admin cannot be revoked.');
      return;
    }
    const confirm = window.confirm(`Are you sure you want to REVOKE administrator access for ${email}?`);
    if (!confirm) return;
    const reason = prompt(`Reason for revoking admin access for ${email}:`, 'Role decommission / competition conflict');
    if (reason === null) return;
    setActionLoadingEmail(email);
    const res = await revokeAdmin(email, reason);
    setActionLoadingEmail(null);
    if (res.success) {
      showToast(res.message);
      if (searchedUser && searchedUser.email.toLowerCase() === email.toLowerCase()) {
        setSearchedUser({ ...searchedUser, adminStatus: 'REVOKED' });
      }
    } else {
      alert(res.message);
    }
  };

  const handleReactivate = async (email: string) => {
    const reason = prompt(`Reason for reactivating administrator access for ${email}:`, 'Privileges reinstated by Super Admin');
    if (reason === null) return;
    setActionLoadingEmail(email);
    const res = await reactivateAdmin(email, reason);
    setActionLoadingEmail(null);
    if (res.success) {
      showToast(res.message);
      if (searchedUser && searchedUser.email.toLowerCase() === email.toLowerCase()) {
        setSearchedUser({ ...searchedUser, adminStatus: 'ACTIVE' });
      }
    } else {
      alert(res.message);
    }
  };

  const handleStateAdvance = (next: EventStatus) => {
    // REVEAL goes through the authoritative reveal (leaderboard broadcast),
    // not just the status label.
    if (next === 'REVEAL') {
      revealResults();
      showToast('Results revealed room-wide with final leaderboard!');
      return;
    }
    setEventStatus(next);
    showToast(`Event status updated to: ${next}`);
  };

  const handleExportJSON = () => {
    const data = createSnapshot();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zero-one-snapshot-${new Date().toISOString()}.json`;
    a.click();
    showToast('Authoritative JSON snapshot downloaded.');
  };

  const handleExportCSV = () => {
    let csv = 'TeamCode,TeamName,Capital,HealthScore,CurrentRound,Status\n';
    teams.forEach((t) => {
      csv += `"${t.teamCode}","${t.name}",${getBalance(t.id)},${t.healthScore},"${t.currentRound}","${t.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zero-one-teams-summary-${new Date().toISOString()}.csv`;
    a.click();
    showToast('Teams CSV exported successfully.');
  };

  const handleManualAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    manualLedgerAdjustment(manualTeamId, manualAdjType, manualAmount, manualReason);
    showToast(`Applied ${manualAdjType} of ₹${manualAmount.toLocaleString('en-IN')} to ${manualTeamId}`);
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    grantLoan(loanTeamId, loanAmount, loanInterest);
    showToast(`Disbursed ₹${loanAmount.toLocaleString('en-IN')} loan to ${loanTeamId}`);
  };

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle) return;
    addAnnouncement(newAnnTitle, newAnnContent, newAnnType);
    setNewAnnTitle('');
    setNewAnnContent('');
    showToast('Announcement broadcasted room-wide!');
  };

  const handleReissueRole = (e: React.FormEvent) => {
    e.preventDefault();
    reissueRoleToDevice(reissueTeamId, reissueRole, reissueName);
    showToast(`Role ${reissueRole} reissued to ${reissueName} for ${reissueTeamId}`);
  };

  const handleRestoreSubmit = () => {
    if (!restoreJsonInput) return;
    const ok = restoreSnapshot(restoreJsonInput);
    if (ok) {
      showToast('Event snapshot restored successfully!');
      setShowRestoreModal(false);
      setRestoreJsonInput('');
    } else {
      showToast('Failed to parse snapshot JSON.');
    }
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.target.toLowerCase().includes(auditSearch.toLowerCase())
  );

  // Canvas shown in the CANVAS tab: the selected squad's replica when synced,
  // the live global canvas when it belongs to that squad, else an empty
  // placeholder (previously the switcher only renamed the export file).
  const shownCanvas: StartupCanvas =
    canvasStore[selectedCanvasTeamId] ||
    (canvas.teamId === selectedCanvasTeamId
      ? canvas
      : {
          teamId: selectedCanvasTeamId,
          problem: '',
          customer: '',
          solution: '',
          usp: '',
          revenueModel: '',
          costStructure: '',
          marketingStrategy: '',
          competitors: '',
          traction: '',
          businessAssumptions: '',
          lastSavedAt: '',
          lastSavedBy: '',
          version: 0,
        });

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#07080B] text-stone-900 dark:text-stone-100 flex transition-colors">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-stone-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Admin Navigation Sidebar matching Screenshot 7 */}
      <aside className="w-64 border-r border-[#EFE8DD] dark:border-[#202432] bg-[#FAF8F5] dark:bg-[#0A0C14] hidden md:flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-1">
          {/* Main Dashboard Link */}
          <button
            onClick={() => onNavigate('team-dashboard')}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          {/* Active ZERO -> ONE Header Bar matching Screenshot 7 */}
          <div className="pt-2 pb-1">
            <div className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-orange-500 text-white shadow-sm flex items-center justify-between">
              <span>ZERO → ONE</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>
            </div>
          </div>

          {/* Submenu Links matching Screenshot 7 */}
          <div className="space-y-0.5 pt-1 text-xs font-medium text-stone-600 dark:text-stone-400">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'OVERVIEW' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-stone-400" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('EVENT_CONTROL')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'EVENT_CONTROL' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-stone-400" />
              <span>Event Control</span>
            </button>

            <button
              onClick={() => setActiveTab('TEAMS')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'TEAMS' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span>Teams & Roles</span>
            </button>

            <button
              onClick={() => setActiveTab('FINANCE')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'FINANCE' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-stone-400" />
              <span>Virtual Finance & Loans</span>
            </button>

            <button
              onClick={() => setActiveTab('MARKET')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'MARKET' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 text-stone-400" />
              <span>Market Management</span>
            </button>

            <button
              onClick={() => setActiveTab('CRISIS')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'CRISIS' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-stone-400" />
              <span>Crisis Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('AUCTION')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'AUCTION' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Gavel className="w-3.5 h-3.5 text-stone-400" />
              <span>Auction & Trading</span>
            </button>

            <button
              onClick={() => setActiveTab('CANVAS')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'CANVAS' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>Canvas Submissions</span>
            </button>

            <button
              onClick={() => setActiveTab('ARTIFACTS')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'ARTIFACTS' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>Prototypes & Decks</span>
            </button>

            <button
              onClick={() => setActiveTab('JUDGES')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'JUDGES' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Gavel className="w-3.5 h-3.5 text-stone-400" />
              <span>Judges & Scoring</span>
            </button>

            <button
              onClick={() => setActiveTab('LIVE_SCREEN')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'LIVE_SCREEN' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-stone-400" />
              <span>Live Screen Control</span>
            </button>

            <button
              onClick={() => setActiveTab('ANNOUNCEMENTS')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'ANNOUNCEMENTS' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-stone-400" />
              <span>Announcements</span>
            </button>

            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'AUDIT' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>Audit Logs</span>
            </button>

            {isSuperAdmin() && (
              <button
                id="sidebar-admin-verification-tab"
                onClick={() => setActiveTab('ADMIN_VERIFICATION')}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'ADMIN_VERIFICATION' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                  <span>Admin Verification</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-500/20 text-orange-400 font-mono">
                  SUPER
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('BACKUP')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'BACKUP' ? 'bg-orange-500/10 text-orange-600 font-bold' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-stone-400" />
              <span>Export & Backup</span>
            </button>
          </div>
        </div>

        {/* Emergency Rehearsal Reset Button at bottom */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset & Reseed Simulation</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Title Header matching Screenshot 7 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black font-heading tracking-tight text-stone-900 dark:text-stone-100">
                ZERO → ONE Control Center
              </h1>
              <span className="badge badge-orange text-[10px]">Real-time Engine</span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Authoritative Master Event Operations • Code.SCRIET Central Ecosystem
            </p>
          </div>

          {/* Official Clock and Action Bar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>State: {eventStatus}</span>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 font-mono font-bold text-xs">
              {Math.floor(serverTimeRemainingSeconds / 60)}:{(serverTimeRemainingSeconds % 60).toString().padStart(2, '0')}
            </div>

            <button
              onClick={toggleClock}
              title={isClockRunning ? 'Pause official clock' : 'Resume official clock'}
              className={`p-2 rounded-full border ${
                isClockRunning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isClockRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB: OVERVIEW (Tiles matching Screenshot 7) */}
        {/* ========================================================================= */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* 6 Large Control Center Tiles matching Screenshot 7 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tile 1: Event Control */}
              <div
                onClick={() => setActiveTab('EVENT_CONTROL')}
                className="card card-interactive p-6 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play className="w-6 h-6 fill-current" />
                </div>
                <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                  Event Control
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Manage event state & rounds
                </p>
              </div>

              {/* Tile 2: Teams & Roles */}
              <div
                onClick={() => setActiveTab('TEAMS')}
                className="card card-interactive p-6 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                  Teams & Roles
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  View and manage teams
                </p>
              </div>

              {/* Tile 3: Market Management */}
              <div
                onClick={() => setActiveTab('MARKET')}
                className="card card-interactive p-6 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                  Market Management
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Items, pricing and stock
                </p>
              </div>

              {/* Tile 4: Crisis Engine */}
              <div
                onClick={() => setActiveTab('CRISIS')}
                className="card card-interactive p-6 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                  Crisis Engine
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Create and dispatch crises
                </p>
              </div>

              {/* Tile 5: Auction & Trading */}
              <div
                onClick={() => setActiveTab('AUCTION')}
                className="card card-interactive p-6 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Gavel className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                  Auction & Trading
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Manage auctions and trades
                </p>
              </div>

              {/* Tile 6: Judging & Scoring */}
              <div
                onClick={() => setActiveTab('JUDGES')}
                className="card card-interactive p-6 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                  Judging & Scoring
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Manage judges and scores
                </p>
              </div>

              {/* Tile 7: Live Screen */}
              <div
                onClick={() => onNavigate('live-screen')}
                className="card card-interactive p-6 space-y-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Tv className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                  Live Screen
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Control what participants see
                </p>
              </div>

              {/* Tile 8: Admin Verification (Super Admin Only) */}
              {isSuperAdmin() && (
                <div
                  id="tile-admin-verification"
                  onClick={() => setActiveTab('ADMIN_VERIFICATION')}
                  className="card card-interactive p-6 space-y-3 group border border-orange-500/30 hover:border-orange-500 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                      Admin Verification
                    </h3>
                    <span className="badge badge-orange text-[10px]">
                      SUPER ADMIN
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Verify administrators by Code.SCRIET email ID and manage authorization
                  </p>
                </div>
              )}
            </div>

            {/* Quick Live Telemetry Strip */}
            <div className="card p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase">Teams Competing</span>
                <div className="text-xl font-black font-mono mt-0.5">{teams.length} Squads</div>
              </div>
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase">Total Capital in Play</span>
                <div className="text-xl font-black font-mono text-emerald-600 mt-0.5">
                  ₹{teams.reduce((acc, t) => acc + getBalance(t.id), 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase">Market Scarcity Stock</span>
                <div className="text-xl font-black font-mono text-orange-600 mt-0.5">
                  {marketItems.reduce((acc, i) => acc + i.stockRemaining, 0)} Units Left
                </div>
              </div>
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase">Audit Mutations</span>
                <div className="text-xl font-black font-mono mt-0.5">{auditLogs.length} Events</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: EVENT CONTROL */}
        {/* ========================================================================= */}
        {activeTab === 'EVENT_CONTROL' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="card p-6 space-y-4">
              <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                Authoritative State Machine & Progression
              </h3>
              <p className="text-xs text-stone-500">
                The server authoritatively broadcasts state changes to all connected devices.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  'SETUP',
                  'LOBBY',
                  'ONBOARDING',
                  'BRIEF',
                  'ROUND_1',
                  'MARKET_SHOCK',
                  'ROUND_2',
                  'FIRESIDE',
                  'AUCTION',
                  'ROUND_3',
                  'LOCKDOWN',
                  'QUALIFIERS',
                  'DELIBERATION',
                  'FINALS',
                  'REVEAL',
                  'ARCHIVED',
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStateAdvance(st as EventStatus)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      eventStatus === st
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-3">
                <button
                  onClick={toggleClock}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                    isClockRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isClockRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isClockRunning ? 'Pause Clock' : 'Start Clock'}
                </button>
                <button
                  onClick={() => {
                    resetClock(25);
                    showToast('Clock reset to 25 minutes');
                  }}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset 25 Min
                </button>
                <button
                  onClick={() => {
                    resetClock(10);
                    showToast('Clock reset to 10 minutes');
                  }}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Set 10 Min Warning
                </button>
                <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800/80 p-1 rounded-xl">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customClockMinutes}
                    onChange={(e) => setCustomClockMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-xs py-1 px-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono text-center"
                    placeholder="Mins"
                  />
                  <button
                    onClick={() => {
                      resetClock(customClockMinutes);
                      showToast(`Clock reset to ${customClockMinutes} minutes`);
                    }}
                    className="btn-secondary py-1 px-3 text-xs font-bold"
                  >
                    Set Duration
                  </button>
                </div>
                <button
                  onClick={triggerLockdown}
                  className="btn-danger py-2 px-4 text-xs font-bold ml-auto"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Trigger 60s Room Lockdown
                </button>
              </div>
            </div>

            {/* Broadcast Announcement Bar */}
            <div className="card p-6 space-y-4">
              <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                Broadcast Live Announcement
              </h3>
              <form onSubmit={handleAnnouncementSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Announcement Title (e.g. Market Restock Active)"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full text-xs"
                  required
                />
                <textarea
                  rows={2}
                  placeholder="Content details broadcasted immediately to all participant devices and live screen..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full text-xs resize-none"
                />
                <button type="submit" className="btn-primary py-2 px-6 text-xs font-bold">
                  Broadcast to All Teams
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: TEAMS & ROLES */}
        {/* ========================================================================= */}
        {activeTab === 'TEAMS' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Hardware Role Reissue Recovery Panel (Rule 14 & Rule 54) */}
            <div className="card p-6 space-y-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-500" />
                <h3 className="font-heading font-bold text-sm text-stone-900 dark:text-stone-100">
                  Administrative Device Role Reissuance
                </h3>
              </div>
              <p className="text-xs text-stone-500">
                In case of lost phone, dead battery, or device swap, revoke old token and bind role to new device.
              </p>
              <form onSubmit={handleReissueRole} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <select
                  value={reissueTeamId}
                  onChange={(e) => setReissueTeamId(e.target.value)}
                  className="text-xs"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teamCode} ({t.name})
                    </option>
                  ))}
                </select>
                <select
                  value={reissueRole}
                  onChange={(e) => setReissueRole(e.target.value as SimulationRole)}
                  className="text-xs"
                >
                  <option value="CEO">CEO</option>
                  <option value="CFO">CFO</option>
                  <option value="CTO">CTO</option>
                  <option value="CMO">CMO</option>
                </select>
                <input
                  type="text"
                  placeholder="Student Name"
                  value={reissueName}
                  onChange={(e) => setReissueName(e.target.value)}
                  className="text-xs"
                  required
                />
                <button type="submit" className="btn-primary py-2 px-4 text-xs font-bold">
                  Reissue & Revoke Old
                </button>
              </form>
            </div>

            {/* Teams Roster */}
            <div className="card p-6 space-y-4">
              <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                Team Rosters & Health Status ({teams.length} Registered)
              </h3>
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {teams.map((t) => (
                  <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {t.name}
                        </span>
                        <span className="badge badge-amber text-[10px] font-mono">
                          {t.teamCode}
                        </span>
                        <span
                          className={`badge text-[10px] ${
                            t.status === 'ACTIVE' ? 'badge-green' : 'badge-red'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="text-xs text-stone-400">
                        Capital: ₹{getBalance(t.id).toLocaleString('en-IN')} • Health: {t.healthScore}% • Problem: {t.problemStatement}
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-[11px] pt-1">
                        {t.members.map((m) => (
                          <span
                            key={m.id}
                            className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono"
                          >
                            {m.role}: {m.displayName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const val = prompt(`Set Health Score (0-100) for ${t.name} (Current: ${t.healthScore}%):`, t.healthScore.toString());
                          if (val !== null) {
                            const nh = Math.min(100, Math.max(0, parseInt(val) || 0));
                            updateTeam(t.id, { healthScore: nh });
                            showToast(`Updated ${t.name} health to ${nh}%`);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 hover:border-orange-500 text-stone-700 dark:text-stone-300"
                      >
                        Set Health
                      </button>
                      <button
                        onClick={() => {
                          const nextStatus = t.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
                          updateTeam(t.id, { status: nextStatus });
                          showToast(`Team ${t.name} status updated to: ${nextStatus}`);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 hover:border-orange-500"
                      >
                        {t.status === 'ACTIVE' ? 'Freeze Squad' : 'Unfreeze'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: VIRTUAL FINANCE & LOANS */}
        {/* ========================================================================= */}
        {activeTab === 'FINANCE' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Manual Emergency Ledger Adjustment (Rule 83) */}
            <div className="card p-6 space-y-4 border-2 border-amber-500/20">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" />
                <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                  Emergency Administrative Ledger Mutation
                </h3>
              </div>
              <p className="text-xs text-stone-500">
                Rule 83: All emergency adjustments require an explicit reason and are permanently committed to the append-only ledger and audit log.
              </p>

              <form onSubmit={handleManualAdjustmentSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select
                  value={manualTeamId}
                  onChange={(e) => setManualTeamId(e.target.value)}
                  className="text-xs"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teamCode} ({t.name})
                    </option>
                  ))}
                </select>

                <select
                  value={manualAdjType}
                  onChange={(e) => setManualAdjType(e.target.value as 'CREDIT' | 'DEBIT')}
                  className="text-xs font-bold"
                >
                  <option value="CREDIT">CREDIT (+)</option>
                  <option value="DEBIT">DEBIT (-)</option>
                </select>

                <input
                  type="number"
                  step={5000}
                  value={manualAmount}
                  onChange={(e) => setManualAmount(Number(e.target.value))}
                  placeholder="Amount (₹)"
                  className="text-xs font-mono font-bold"
                  required
                />

                <input
                  type="text"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Mandatory Audit Reason"
                  className="text-xs"
                  required
                />

                <div className="sm:col-span-4 pt-1">
                  <button type="submit" className="btn-primary py-2 px-6 text-xs font-bold">
                    Commit Ledger Adjustment
                  </button>
                </div>
              </form>
            </div>

            {/* Grant Bridge Loan (Rule 32) */}
            <div className="card p-6 space-y-4">
              <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                Disburse Founder Bridge Loan
              </h3>
              <p className="text-xs text-stone-500">
                Configures operational credit infusions with interest penalties.
              </p>

              <form onSubmit={handleLoanSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={loanTeamId}
                  onChange={(e) => setLoanTeamId(e.target.value)}
                  className="text-xs"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teamCode} ({t.name})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  step={10000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  placeholder="Loan Principal (₹)"
                  className="text-xs font-mono font-bold"
                  required
                />

                <input
                  type="number"
                  value={loanInterest}
                  onChange={(e) => setLoanInterest(Number(e.target.value))}
                  placeholder="Interest Rate (%)"
                  className="text-xs font-mono font-bold"
                  required
                />

                <div className="sm:col-span-3 pt-1">
                  <button type="submit" className="btn-primary py-2 px-6 text-xs font-bold">
                    Disburse Loan to Squad
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: MARKET MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'MARKET' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Dynamic Pricing Toggle & Demand Algorithm Controls */}
            <div className="card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                    Dynamic Pricing & Global Scarcity Engine
                  </h3>
                  <p className="text-xs text-stone-500">
                    Prices automatically fluctuate based on aggregate room purchase volume.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const next = !eventConfig.dynamicPricingEnabled;
                    updateEventConfig({ dynamicPricingEnabled: next });
                    showToast(`Dynamic pricing ${next ? 'enabled' : 'disabled'}`);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold ${
                    eventConfig.dynamicPricingEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-600'
                  }`}
                >
                  Dynamic Pricing: {eventConfig.dynamicPricingEnabled ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Items Registry Table with in-place stock and price controls */}
            <div className="card overflow-hidden shadow-lg border border-stone-200 dark:border-stone-800">
              <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <h4 className="font-heading font-extrabold text-sm">
                  Active Market Registry ({marketItems.length} SKUs)
                </h4>
                <button
                  onClick={() => setShowAddMarketItem(!showAddMarketItem)}
                  className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddMarketItem ? 'Cancel' : 'Add New Item / SKU'}
                </button>
              </div>

              {/* Add New Market Item Inline Form */}
              {showAddMarketItem && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newItemSku.trim() || !newItemName.trim()) return;
                    const sku = newItemSku.trim().toUpperCase();
                    if (marketItems.some((i) => i.sku.toUpperCase() === sku)) {
                      showToast(`SKU ${sku} already exists — pick a unique code.`);
                      return;
                    }
                    addMarketItem({
                      sku: newItemSku.trim().toUpperCase(),
                      name: newItemName.trim(),
                      category: newItemCategory as any,
                      basePrice: newItemPrice,
                      currentPrice: newItemPrice,
                      priceChangePct: 0,
                      stockTotal: newItemStock,
                      stockRemaining: newItemStock,
                      unlocksDescription: `Administrative market release: ${newItemName}`,
                      effectSpec: {
                        boostType: 'MARKET',
                        value: 10,
                      },
                      visibleFromState: 'SETUP',
                      status: newItemStock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
                      icon: 'Zap',
                    });
                    showToast(`Added market item ${newItemName} (${newItemSku.toUpperCase()})`);
                    setNewItemSku('');
                    setNewItemName('');
                    setShowAddMarketItem(false);
                  }}
                  className="p-4 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-5 gap-3"
                >
                  <input
                    type="text"
                    placeholder="SKU (e.g. GPU-H100)"
                    value={newItemSku}
                    onChange={(e) => setNewItemSku(e.target.value)}
                    className="text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="text-xs"
                    required
                  />
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="text-xs"
                  >
                    <option value="TECH">TECH</option>
                    <option value="TALENT">TALENT</option>
                    <option value="MARKETING">MARKETING</option>
                    <option value="OPERATIONS">OPERATIONS</option>
                    <option value="LEGAL">LEGAL</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="text-xs font-mono"
                    required
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Stock"
                      value={newItemStock}
                      onChange={(e) => setNewItemStock(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 text-xs font-mono"
                      required
                    />
                    <button type="submit" className="btn-primary py-1 px-3 text-xs font-bold flex-1">
                      Save SKU
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 font-bold uppercase text-stone-500">
                      <th className="py-3 px-4">Item SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Current Price</th>
                      <th className="py-3 px-4">Stock Left</th>
                      <th className="py-3 px-4 text-center">Quick Stock Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {marketItems.map((item) => (
                      <tr key={item.sku} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/40">
                        <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                          {item.name}
                          <span className="block text-[10px] text-stone-400 font-mono">{item.sku}</span>
                        </td>
                        <td className="py-3 px-4 text-stone-500">{item.category}</td>
                        <td className="py-3 px-4 font-mono font-bold text-stone-800 dark:text-stone-200">
                          <div className="flex items-center gap-1.5">
                            <span>₹{item.currentPrice.toLocaleString('en-IN')}</span>
                            <button
                              onClick={() => {
                                const val = prompt(`Edit price for ${item.name} (Current: ₹${item.currentPrice}):`, item.currentPrice.toString());
                                if (val !== null) {
                                  const np = Math.max(0, parseInt(val) || 0);
                                  updateMarketItem(item.sku, { currentPrice: np });
                                  showToast(`Updated ${item.name} price to ₹${np.toLocaleString('en-IN')}`);
                                }
                              }}
                              className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                              title="Edit Price"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <div className="flex items-center gap-1.5">
                            <span className={item.stockRemaining <= 2 ? 'text-red-500' : 'text-stone-800 dark:text-stone-200'}>
                              {item.stockRemaining} / {item.stockTotal}
                            </span>
                            <button
                              onClick={() => {
                                const val = prompt(`Set exact stock for ${item.name} (Current: ${item.stockRemaining}):`, item.stockRemaining.toString());
                                if (val !== null) {
                                  const ns = Math.max(0, parseInt(val) || 0);
                                  // Server-authoritative: exact set = delta from
                                  // current remaining (ADJUST_STOCK). stockTotal
                                  // is display capacity, kept in sync locally.
                                  adjustStock(item.sku, ns - item.stockRemaining);
                                  updateMarketItem(item.sku, { stockTotal: Math.max(ns, item.stockTotal) });
                                  showToast(`Updated ${item.name} stock to ${ns}`);
                                }
                              }}
                              className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                              title="Set Exact Stock"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => adjustStock(item.sku, 1)}
                              className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-emerald-600 hover:text-white font-bold"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => adjustStock(item.sku, 5)}
                              className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-emerald-600 hover:text-white font-bold"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => adjustStock(item.sku, -1)}
                              className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-red-600 hover:text-white font-bold"
                            >
                              -1
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: CRISIS ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'CRISIS' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Active Crisis Dispatch Control */}
            <div className="card p-6 space-y-4">
              <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                Dispatch Market Shock to Teams
              </h3>
              <p className="text-xs text-stone-500">
                Immediately launches high-attention crisis modal and synchronized countdown timer on targeted devices.
              </p>

              {/* Target Squad Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-100 dark:bg-stone-800/80 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Select Target Squad / Team:
                  </span>
                </div>
                <select
                  value={selectedCrisisTeamId}
                  onChange={(e) => setSelectedCrisisTeamId(e.target.value)}
                  className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teamCode} — {t.name} (Health: {t.healthScore}%, Capital: ₹{getBalance(t.id).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {crisisCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="badge badge-red text-[10px]">{card.severity}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{card.category}</span>
                      </div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{card.title}</h4>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">{card.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        const targetTeam = teams.find((t) => t.id === selectedCrisisTeamId) || teams[0];
                        dispatchCrisisToTeam(selectedCrisisTeamId, card.id);
                        showToast(`Dispatched ${card.title} to ${targetTeam ? targetTeam.name : selectedCrisisTeamId}`);
                      }}
                      className="btn-danger w-full py-2 text-xs font-bold mt-3"
                    >
                      Dispatch Shock to {teams.find((t) => t.id === selectedCrisisTeamId)?.name || 'Squad'} →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Author a new crisis card (synced server-side, dispatchable immediately) */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-black text-sm text-stone-900 dark:text-stone-100">
                  Author New Crisis Card
                </h4>
                <button
                  onClick={() => setShowAddCrisis((v) => !v)}
                  className="btn-secondary py-1.5 px-4 text-xs font-bold"
                >
                  {showAddCrisis ? 'Cancel' : '+ New Card'}
                </button>
              </div>
              {showAddCrisis && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={newCrisisTitle}
                    onChange={(e) => setNewCrisisTitle(e.target.value)}
                    placeholder="Card title (e.g. Server Outage at Demo Hour)"
                    className="input-text sm:col-span-2"
                  />
                  <input
                    value={newCrisisDesc}
                    onChange={(e) => setNewCrisisDesc(e.target.value)}
                    placeholder="Situation description"
                    className="input-text sm:col-span-2"
                  />
                  <select
                    value={newCrisisCategory}
                    onChange={(e) => setNewCrisisCategory(e.target.value)}
                    className="input-text"
                  >
                    {['Market', 'Technical', 'Financial', 'Team', 'Legal'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={newCrisisSeverity}
                    onChange={(e) => setNewCrisisSeverity(e.target.value)}
                    className="input-text"
                  >
                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-bold">Timer (sec)</span>
                    <input
                      type="number"
                      value={newCrisisTimer}
                      onChange={(e) => setNewCrisisTimer(Math.max(30, Math.min(3600, parseInt(e.target.value) || 360)))}
                      className="input-text font-mono"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newCrisisTitle.trim()) {
                        showToast('Give the crisis card a title first.');
                        return;
                      }
                      addCrisisCard({
                        id: 'CRISIS-' + Date.now().toString(36).toUpperCase(),
                        title: newCrisisTitle.trim(),
                        category: newCrisisCategory as CrisisCard['category'],
                        severity: newCrisisSeverity as CrisisCard['severity'],
                        description: newCrisisDesc.trim() || 'Operator-authored shock event.',
                        timerSeconds: newCrisisTimer,
                        options: [
                          {
                            id: 'OPT-A',
                            label: 'Spend to Contain',
                            cost: 50000,
                            description: 'Deploy reserves immediately to contain fallout.',
                            effectDescription: 'Stabilizes the situation at a known cost.',
                            healthDelta: 5,
                            requiresRoles: ['CEO', 'CFO'],
                          },
                          {
                            id: 'OPT-B',
                            label: 'Ride It Out',
                            cost: 0,
                            description: 'Preserve capital and absorb the impact.',
                            effectDescription: 'No spend, minor health impact.',
                            healthDelta: -3,
                            requiresRoles: ['CEO', 'CFO', 'CTO', 'CMO'],
                          },
                        ],
                      });
                      setShowAddCrisis(false);
                      setNewCrisisTitle('');
                      setNewCrisisDesc('');
                      showToast('Crisis card authored and synced — dispatch it above!');
                    }}
                    className="btn-primary py-2 px-4 text-xs font-bold sm:col-span-2"
                  >
                    Save & Sync Card
                  </button>
                </div>
              )}
            </div>

            {/* Active Crisis Monitor */}
            {activeCrisis && (
              <div className="card p-6 space-y-3 border-2 border-red-500/30">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-red-600 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Active Crisis on {activeCrisis.teamId}: {activeCrisis.crisis.title}
                  </h4>
                  <span className="text-xs font-bold text-stone-400">
                    Status: {activeCrisis.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      extendCrisisTimer(120);
                      showToast('Extended crisis timer by 2 minutes');
                    }}
                    className="btn-secondary py-1.5 px-4 text-xs font-bold"
                  >
                    +2 Min Timer Extension
                  </button>
                  <button
                    onClick={() => {
                      resolveCrisisManually(activeCrisis.teamId, 'Approved by Event Operator');
                      showToast('Crisis marked resolved');
                    }}
                    className="btn-primary py-1.5 px-4 text-xs font-bold"
                  >
                    Mark Manually Resolved
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: AUCTION & TRADING */}
        {/* ========================================================================= */}
        {activeTab === 'AUCTION' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="card p-6 space-y-4">
              <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                Sealed-Bid Auction Desk
              </h3>
              <p className="text-xs text-stone-500">
                Teams submit private sealed bids. The highest bid atomically wins and is debited upon closing.
              </p>

              {!activeAuction && (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowOpenAuction((v) => !v)}
                    className="btn-secondary py-2 px-4 text-xs font-bold"
                  >
                    {showOpenAuction ? 'Cancel' : '+ Open New Auction'}
                  </button>
                  {showOpenAuction && (
                    <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={newAucTitle}
                        onChange={(e) => setNewAucTitle(e.target.value)}
                        placeholder="Auction title (e.g. Prime Keynote Slot)"
                        className="input-text sm:col-span-2"
                      />
                      <input
                        value={newAucDesc}
                        onChange={(e) => setNewAucDesc(e.target.value)}
                        placeholder="Description"
                        className="input-text sm:col-span-2"
                      />
                      <input
                        value={newAucSku}
                        onChange={(e) => setNewAucSku(e.target.value)}
                        placeholder="Item SKU (optional)"
                        className="input-text font-mono"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={newAucMinBid}
                          onChange={(e) => setNewAucMinBid(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="Min bid ₹"
                          className="input-text font-mono"
                        />
                        <input
                          type="number"
                          value={newAucMinutes}
                          onChange={(e) => setNewAucMinutes(Math.max(1, Math.min(120, parseInt(e.target.value) || 10)))}
                          placeholder="Mins"
                          className="input-text font-mono"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!newAucTitle.trim()) {
                            showToast('Give the auction a title first.');
                            return;
                          }
                          openAuction(newAucTitle.trim(), newAucDesc.trim() || 'Sealed-bid asset auction', newAucSku.trim() || 'AUCTION-ASSET', newAucMinBid, newAucMinutes);
                          setShowOpenAuction(false);
                          setNewAucTitle('');
                          setNewAucDesc('');
                          setNewAucSku('');
                          showToast(`Auction "${newAucTitle.trim()}" is now OPEN room-wide!`);
                        }}
                        className="btn-primary py-2 px-4 text-xs font-bold sm:col-span-2"
                      >
                        Launch Auction
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeAuction ? (
                <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {activeAuction.title}
                    </span>
                    <span className="badge badge-amber text-[10px]">
                      {activeAuction.status}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500">
                    Min Reserve: ₹{activeAuction.minimumBid.toLocaleString('en-IN')} • Submitted Bids: {auctionBids.length}
                  </div>

                  {/* Bids inspector */}
                  <div className="space-y-1.5 pt-2">
                    <div className="text-xs font-bold uppercase text-stone-400">Received Sealed Bids:</div>
                    {auctionBids.map((b) => (
                      <div key={b.id} className="text-xs font-mono flex justify-between bg-white dark:bg-[#12141C] p-2 rounded-xl">
                        <span>{b.teamName} ({b.teamId})</span>
                        <span className="font-bold text-orange-600">₹{b.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {activeAuction.status === 'OPEN' && (
                    <button
                      onClick={() => {
                        const res = closeAuction();
                        showToast(`Auction closed! Winner: ${res.winnerTeamName || 'None'} @ ₹${res.winningBid || 0}`);
                      }}
                      className="btn-primary py-2 px-6 text-xs font-bold"
                    >
                      Close Auction & Commit Winner
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-stone-400">No active auction.</div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: CANVAS SUBMISSIONS */}
        {/* ========================================================================= */}
        {activeTab === 'CANVAS' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header with Team Switcher */}
            <div className="card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                      LEAN STARTUP CANVAS SUBMISSIONS
                    </h3>
                    <span className="badge badge-orange text-[10px] font-mono">
                      ROUND 1 & 2 DELIVERABLE
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Inspect structured venture architecture, validation hypotheses, and cost models across competing squads.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-stone-500">Squad:</span>
                    <select
                      value={selectedCanvasTeamId}
                      onChange={(e) => setSelectedCanvasTeamId(e.target.value)}
                      className="text-xs py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 font-bold focus:outline-none focus:border-orange-500"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.teamCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(shownCanvas, null, 2));
                      const a = document.createElement('a');
                      a.setAttribute('href', dataStr);
                      a.setAttribute('download', `canvas-${selectedCanvasTeamId}-v${shownCanvas.version || 1}.json`);
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      showToast('Canvas exported to JSON successfully!');
                    }}
                    className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-stone-700 dark:text-stone-300">
                    Active Version: <strong className="text-orange-600">v{shownCanvas.version || 1}</strong>
                  </span>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-500">
                    Last Saved: {shownCanvas.lastSavedAt ? new Date(canvas.lastSavedAt).toLocaleTimeString() : 'Initial'}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 font-mono">
                  Sign-off Author: <span className="text-stone-700 dark:text-stone-300 font-bold">{shownCanvas.lastSavedBy || 'Team CEO'}</span>
                </div>
              </div>
            </div>

            {/* 10 Lean Startup Canvas Building Blocks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Problem */}
              <div className="card p-5 space-y-2 border-l-4 border-l-red-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                    1. Problem Statement
                  </span>
                  <AlertTriangle className="w-4 h-4 text-red-500/60" />
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans min-h-[60px]">
                  {shownCanvas.problem || 'No problem statement submitted yet.'}
                </p>
              </div>

              {/* 2. Customer */}
              <div className="card p-5 space-y-2 border-l-4 border-l-blue-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    2. Target Customer Segment
                  </span>
                  <Users className="w-4 h-4 text-blue-500/60" />
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans min-h-[60px]">
                  {shownCanvas.customer || 'No customer profile specified yet.'}
                </p>
              </div>

              {/* 3. Solution */}
              <div className="card p-5 space-y-2 border-l-4 border-l-emerald-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    3. Solution Architecture
                  </span>
                  <CheckCircle className="w-4 h-4 text-emerald-500/60" />
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans min-h-[60px]">
                  {shownCanvas.solution || 'No solution architecture documented.'}
                </p>
              </div>

              {/* 4. USP */}
              <div className="card p-5 space-y-2 border-l-4 border-l-amber-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    4. Unique Value Proposition
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-500/60" />
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans min-h-[60px]">
                  {shownCanvas.usp || 'No unique value proposition defined.'}
                </p>
              </div>

              {/* 5. Revenue Model */}
              <div className="card p-5 space-y-2 border-l-4 border-l-green-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-green-600 dark:text-green-400">
                    5. Revenue Model
                  </span>
                  <DollarSign className="w-4 h-4 text-green-500/60" />
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans min-h-[60px]">
                  {shownCanvas.revenueModel || 'No monetisation mechanics specified.'}
                </p>
              </div>

              {/* 6. Cost Structure */}
              <div className="card p-5 space-y-2 border-l-4 border-l-rose-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    6. Cost Structure
                  </span>
                  <Sliders className="w-4 h-4 text-rose-500/60" />
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans min-h-[60px]">
                  {shownCanvas.costStructure || 'No breakdown of operational expenses.'}
                </p>
              </div>

              {/* 7. Marketing Strategy */}
              <div className="card p-5 space-y-2 border-l-4 border-l-purple-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    7. Marketing & Acquisition
                  </span>
                  <TrendingUp className="w-4 h-4 text-purple-500/60" />
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans min-h-[60px]">
                  {shownCanvas.marketingStrategy || 'No go-to-market channels listed.'}
                </p>
              </div>

              {/* 8. Competitors */}
              <div className="card p-5 space-y-2 border-l-4 border-l-cyan-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    8. Competitors & Alternatives
                  </span>
                  <ShieldAlert className="w-4 h-4 text-cyan-500/60" />
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans min-h-[60px]">
                  {shownCanvas.competitors || 'No competitive analysis provided.'}
                </p>
              </div>

              {/* 9. Traction */}
              <div className="card p-5 space-y-2 border-l-4 border-l-teal-500">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    9. Early Traction & Evidence
                  </span>
                  <FileCheck className="w-4 h-4 text-teal-500/60" />
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans min-h-[60px]">
                  {shownCanvas.traction || 'No validation metrics documented yet.'}
                </p>
              </div>

              {/* 10. Assumptions */}
              <div className="card p-5 space-y-2 border-l-4 border-l-orange-500 md:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    10. Critical Business Assumptions & Lethal Risks
                  </span>
                  <Lock className="w-4 h-4 text-orange-500/60" />
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
                  {shownCanvas.businessAssumptions || 'No risk assumptions registered.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: PROTOTYPES & DECKS (ARTIFACTS) */}
        {/* ========================================================================= */}
        {activeTab === 'ARTIFACTS' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header & Filter Controls */}
            <div className="card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                      PROTOTYPES, DECKS & DELIVERABLES
                    </h3>
                    <span className="badge badge-emerald text-[10px] font-mono">
                      {artifacts.length} REGISTERED
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Deliverable verification registry for digital prototypes, pitch decks, landing pages, and demo recordings.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowAddArtifactModal(true)}
                    className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Marshal Deliverable</span>
                  </button>
                </div>
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-stone-500">Kind:</span>
                  <select
                    value={artifactKindFilter}
                    onChange={(e) => setArtifactKindFilter(e.target.value)}
                    className="text-xs py-1.5 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="ALL">All Types</option>
                    <option value="PROTOTYPE">Prototypes</option>
                    <option value="PITCH_DECK">Pitch Decks</option>
                    <option value="LANDING_PAGE">Landing Pages</option>
                    <option value="DEMO_VIDEO">Demo Videos</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-stone-500">Squad:</span>
                  <select
                    value={artifactTeamFilter}
                    onChange={(e) => setArtifactTeamFilter(e.target.value)}
                    className="text-xs py-1.5 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="ALL">All Squads</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.teamCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Modal: Record Marshal Deliverable */}
            {showAddArtifactModal && (
              <div className="card p-6 border-orange-500/30 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-black text-sm uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    RECORD EMERGENCY DELIVERABLE FOR SQUAD
                  </h4>
                  <button
                    onClick={() => setShowAddArtifactModal(false)}
                    className="text-xs font-mono text-stone-400 hover:text-stone-200"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-stone-500 block mb-1">Target Squad</label>
                    <select
                      value={newArtTeamId}
                      onChange={(e) => setNewArtTeamId(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 font-bold"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.teamCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-stone-500 block mb-1">Deliverable Kind</label>
                    <select
                      value={newArtKind}
                      onChange={(e) => setNewArtKind(e.target.value as any)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 font-bold"
                    >
                      <option value="PROTOTYPE">Interactive Prototype</option>
                      <option value="PITCH_DECK">Pitch Deck / Presentation</option>
                      <option value="LANDING_PAGE">Landing Page</option>
                      <option value="DEMO_VIDEO">Recorded Demo Video</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-stone-500 block mb-1">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. V1 Production Demo"
                      value={newArtTitle}
                      onChange={(e) => setNewArtTitle(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                    >
                    </input>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-stone-500 block mb-1">URL / Resource Link</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newArtUrl}
                      onChange={(e) => setNewArtUrl(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                    >
                    </input>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-stone-500 block mb-1">Brief Description</label>
                  <input
                    type="text"
                    placeholder="Short description of technical architecture or prototype features"
                    value={newArtDesc}
                    onChange={(e) => setNewArtDesc(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      if (!newArtTitle.trim() || !newArtUrl.trim()) {
                        alert('Please specify both title and URL for the deliverable.');
                        return;
                      }
                      submitArtifact({
                        teamId: newArtTeamId,
                        kind: newArtKind,
                        title: newArtTitle.trim(),
                        url: newArtUrl.trim(),
                        description: newArtDesc.trim() || 'Verified deliverable submitted via Marshal Control.',
                        submittedBy: 'Event Marshal (Admin)',
                      });
                      setNewArtTitle('');
                      setNewArtUrl('');
                      setNewArtDesc('');
                      setShowAddArtifactModal(false);
                      showToast('Deliverable successfully recorded in authoritative registry!');
                    }}
                    className="btn-primary py-2 px-5 text-xs font-bold"
                  >
                    Commit Deliverable
                  </button>
                </div>
              </div>
            )}

            {/* Artifact Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artifacts
                .filter((art) => {
                  const matchesKind = artifactKindFilter === 'ALL' || art.kind === artifactKindFilter;
                  const matchesTeam = artifactTeamFilter === 'ALL' || art.teamId === artifactTeamFilter;
                  return matchesKind && matchesTeam;
                })
                .map((art) => {
                  const squad = teams.find((t) => t.id === art.teamId);
                  const kindBadgeClass =
                    art.kind === 'PROTOTYPE'
                      ? 'badge-emerald'
                      : art.kind === 'PITCH_DECK'
                      ? 'badge-orange'
                      : art.kind === 'LANDING_PAGE'
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      : 'bg-purple-500/10 text-purple-500 border-purple-500/20';

                  return (
                    <div key={art.id} className="card p-5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`badge text-[10px] font-mono border ${kindBadgeClass}`}>
                            {art.kind.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400">
                            {new Date(art.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <h4 className="font-heading font-black text-sm text-stone-900 dark:text-stone-100">
                          {art.title}
                        </h4>
                        <p className="text-xs text-stone-500 leading-relaxed font-sans line-clamp-2">
                          {art.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-stone-500">Squad:</span>
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            {squad ? `${squad.name} (${squad.teamCode})` : art.teamId}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-stone-500">Submitted By:</span>
                          <span className="text-stone-600 dark:text-stone-400 font-medium">
                            {art.submittedBy}
                          </span>
                        </div>
                        <a
                          href={art.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5 font-bold"
                        >
                          <span>Open Deliverable</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              {artifacts.length === 0 && (
                <div className="col-span-full card p-8 text-center text-xs text-stone-400">
                  No deliverables registered yet. Teams can submit deliverables from their squad portals.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: JUDGES & SCORING */}
        {/* ========================================================================= */}
        {activeTab === 'JUDGES' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Criteria weights editor */}
            <div className="card p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                  Official Judging Criteria Weights (Rule 46)
                </h3>
                <button
                  onClick={() => {
                    recalculateFloorScores();
                    showToast('Recalculated objective floor metrics across all squads!');
                  }}
                  className="btn-secondary py-1.5 px-4 text-xs font-bold"
                >
                  Recalculate Automated Floor Scores
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {judgingCriteria.map((crit) => (
                  <div key={crit.id} className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                    <div className="font-bold text-stone-800 dark:text-stone-200">{crit.name}</div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-stone-500 font-semibold">
                        Max
                        <input
                          type="number"
                          value={crit.maxScore}
                          min={1}
                          max={100}
                          onChange={(e) => {
                            const v = Math.max(1, Math.min(100, parseInt(e.target.value) || crit.maxScore));
                            updateJudgingCriterion(crit.id, { maxScore: v });
                          }}
                          className="input-text font-mono w-20 py-1"
                        />
                        pts
                      </label>
                      <label className="flex items-center gap-1.5 text-stone-500 font-semibold">
                        Weight ×
                        <input
                          type="number"
                          value={crit.weight}
                          min={0.1}
                          max={5}
                          step={0.1}
                          onChange={(e) => {
                            const v = Math.max(0.1, Math.min(5, parseFloat(e.target.value) || crit.weight));
                            updateJudgingCriterion(crit.id, { weight: Math.round(v * 10) / 10 });
                          }}
                          className="input-text font-mono w-20 py-1"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Automated floor scores (server-calculated, read-only proof) */}
            <div className="card p-6 space-y-3">
              <h4 className="font-heading font-extrabold text-sm">
                Automated Floor Scores ({floorScores.length} squads)
              </h4>
              {floorScores.length === 0 ? (
                <div className="text-xs text-stone-400">No floor scores yet — hit “Recalculate Automated Floor Scores” above.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase">
                        <th className="py-2 px-3">Squad</th>
                        <th className="py-2 px-3 text-right">Solvency</th>
                        <th className="py-2 px-3 text-right">Reserve</th>
                        <th className="py-2 px-3 text-right">Spread</th>
                        <th className="py-2 px-3 text-right">Response</th>
                        <th className="py-2 px-3 text-right">Tradeoff</th>
                        <th className="py-2 px-3 text-right">Consistency</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
                      {floorScores.map((f) => (
                        <tr key={f.teamId}>
                          <td className="py-2 px-3 font-bold font-sans">{teams.find((t) => t.id === f.teamId)?.name || f.teamId}</td>
                          <td className="py-2 px-3 text-right">{f.solvency}</td>
                          <td className="py-2 px-3 text-right">{f.reserveBand}</td>
                          <td className="py-2 px-3 text-right">{f.allocationSpread}</td>
                          <td className="py-2 px-3 text-right">{f.responseTimeliness}</td>
                          <td className="py-2 px-3 text-right">{f.tradeoffNamed}</td>
                          <td className="py-2 px-3 text-right">{f.decisionConsistency}</td>
                          <td className="py-2 px-3 text-right font-black text-orange-600">{f.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Submitted Judge Scores Table */}
            <div className="card p-6 space-y-3">
              <h4 className="font-heading font-extrabold text-sm">
                Submitted Human Judge Evaluations ({judgeScores.length})
              </h4>
              <div className="space-y-2">
                {judgeScores.map((js) => (
                  <div key={js.id} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{js.judgeName}</span>
                      <span className="text-stone-400 ml-2">evaluated Team {js.teamId}</span>
                      <p className="text-stone-500 italic mt-0.5">"{js.feedback}"</p>
                    </div>
                    <span className="text-lg font-black font-mono text-orange-600">
                      {js.totalScore} / 100
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: LIVE SCREEN CONTROL */}
        {/* ========================================================================= */}
        {activeTab === 'LIVE_SCREEN' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                      LIVE AUDITORIUM SCREEN CONTROLS
                    </h3>
                    <span className="badge badge-orange text-[10px] font-mono">
                      PROJECTOR OUTPUT
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Control what attendees, mentors, and competing founders see on the main auditorium stage display.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="/#live-screen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 font-bold"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Launch Stage Display</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Presentation Mode Selector */}
            <div className="card p-6 space-y-4">
              <h4 className="font-heading font-black text-sm uppercase tracking-wider text-stone-800 dark:text-stone-200">
                1. Stage Presentation Mode
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    mode: 'NORMAL',
                    title: 'Standard Round Mode',
                    desc: 'Live countdown, active economy ticker, and squad telemetry.',
                    color: 'orange',
                  },
                  {
                    mode: 'LOCKDOWN',
                    title: 'Emergency Lockdown',
                    desc: 'Full-screen red alert, frozen market trades, crisis warnings.',
                    color: 'red',
                  },
                  {
                    mode: 'QUALIFIERS',
                    title: 'Finalist Leaderboard',
                    desc: 'Focus on top ranking squads qualifying for final pitch.',
                    color: 'emerald',
                  },
                  {
                    mode: 'REVEAL',
                    title: 'Awards Podium Reveal',
                    desc: 'Dramatic award presentation mode with podium highlights.',
                    color: 'purple',
                  },
                ].map((item) => {
                  const isSelected = (liveScreenConfig?.presentationMode || 'NORMAL') === item.mode;
                  return (
                    <button
                      key={item.mode}
                      onClick={() => {
                        updateLiveScreenConfig({ presentationMode: item.mode as any });
                        showToast(`Switched stage presentation mode to ${item.mode}`);
                      }}
                      className={`p-4 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/10 shadow-md ring-1 ring-orange-500/50'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50 dark:bg-stone-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black font-heading text-stone-900 dark:text-stone-100">
                          {item.title}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-orange-600" />}
                      </div>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-sans">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Overlay Toggles & Ticker */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overlay Visibility Toggles */}
              <div className="card p-6 space-y-4">
                <h4 className="font-heading font-black text-sm uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  2. Dynamic Overlay Toggles
                </h4>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                        Leaderboard Overlay
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Show top squad valuation rankings on the left rail
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const newVal = !liveScreenConfig.showLeaderboard;
                        updateLiveScreenConfig({ showLeaderboard: newVal });
                        showToast(`Leaderboard overlay ${newVal ? 'enabled' : 'hidden'}`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        liveScreenConfig.showLeaderboard
                          ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      {liveScreenConfig.showLeaderboard ? 'VISIBLE' : 'HIDDEN'}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                        Crisis Telemetry Grid
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Display active emergency threats and response countdowns
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const newVal = !liveScreenConfig.showCrisisGrid;
                        updateLiveScreenConfig({ showCrisisGrid: newVal });
                        showToast(`Crisis grid overlay ${newVal ? 'enabled' : 'hidden'}`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        liveScreenConfig.showCrisisGrid
                          ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      {liveScreenConfig.showCrisisGrid ? 'VISIBLE' : 'HIDDEN'}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                        Market Price Ticker
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Display bottom scrolling ticker of cloud and talent prices
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const newVal = !liveScreenConfig.showMarketTicker;
                        updateLiveScreenConfig({ showMarketTicker: newVal });
                        showToast(`Market ticker overlay ${newVal ? 'enabled' : 'hidden'}`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        liveScreenConfig.showMarketTicker
                          ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                      }`}
                    >
                      {liveScreenConfig.showMarketTicker ? 'VISIBLE' : 'HIDDEN'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Ticker Banner Text Editor */}
              <div className="card p-6 space-y-4">
                <h4 className="font-heading font-black text-sm uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  3. Stage Ticker Banner Text
                </h4>
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Enter broadcast message scrolling across bottom of live screen..."
                    value={liveTickerInput}
                    onChange={(e) => setLiveTickerInput(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:border-orange-500 font-mono"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'ROUND 2 ACTIVE • DIGITAL MARKET OPEN',
                        'CRISIS ALERT • CHECK TERMINALS NOW',
                        'FINAL 5 MINUTES • SUBMIT DELIVERABLES',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setLiveTickerInput(preset)}
                          className="px-2 py-1 text-[10px] rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-orange-500 font-mono"
                        >
                          {preset.split('•')[0]}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        updateLiveScreenConfig({ announcementTickerText: liveTickerInput.trim() });
                        showToast('Live stage ticker text updated successfully!');
                      }}
                      className="btn-primary py-2 px-4 text-xs font-bold"
                    >
                      Update Ticker
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: ANNOUNCEMENTS */}
        {/* ========================================================================= */}
        {activeTab === 'ANNOUNCEMENTS' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="card p-6 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                  EVENT ANNOUNCEMENTS & LIVE BROADCAST
                </h3>
                <span className="badge badge-orange text-[10px] font-mono">
                  PUSH TELEMETRY
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Broadcast urgent instructions, market fluctuations, and phase transitions directly to squad heads-up displays.
              </p>
            </div>

            {/* Broadcast Form */}
            <div className="card p-6 space-y-4 border-orange-500/20">
              <h4 className="font-heading font-black text-sm uppercase tracking-wider text-stone-800 dark:text-stone-200">
                Compose New Live Broadcast
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-mono text-stone-500 block mb-1">
                      Announcement Headline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Round 2 Ending in 10 Minutes — Finalize Pitch Decks!"
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-stone-500 block mb-1">
                      Urgency Classification
                    </label>
                    <select
                      value={newAnnType}
                      onChange={(e) => setNewAnnType(e.target.value as any)}
                      className="w-full text-xs py-2 px-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 font-bold"
                    >
                      <option value="INFO">INFO (General Notice)</option>
                      <option value="ALERT">ALERT (Attention Required)</option>
                      <option value="CRISIS">CRISIS (Emergency Threat)</option>
                      <option value="ROUND_CHANGE">ROUND CHANGE (State Transition)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-stone-500 block mb-1">
                    Announcement Body
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detailed explanation, instructions, or operational directives for competing squads..."
                    value={newAnnContent}
                    onChange={(e) => setNewAnnContent(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:border-orange-500 font-sans"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (!newAnnTitle.trim() || !newAnnContent.trim()) {
                        alert('Please fill out both headline and content before broadcasting.');
                        return;
                      }
                      addAnnouncement(newAnnTitle.trim(), newAnnContent.trim(), newAnnType);
                      setNewAnnTitle('');
                      setNewAnnContent('');
                      showToast('Live announcement pushed to all squad devices!');
                    }}
                    className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Broadcast to All Devices</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Historical Announcements Feed */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-black text-sm uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  Broadcast History ({announcements.length})
                </h4>
              </div>
              <div className="space-y-3">
                {announcements.map((ann) => {
                  const typeClass =
                    ann.type === 'CRISIS'
                      ? 'border-l-red-500 bg-red-500/5'
                      : ann.type === 'ROUND_CHANGE'
                      ? 'border-l-emerald-500 bg-emerald-500/5'
                      : ann.type === 'ALERT'
                      ? 'border-l-amber-500 bg-amber-500/5'
                      : 'border-l-blue-500 bg-blue-500/5';

                  return (
                    <div
                      key={ann.id}
                      className={`p-4 rounded-xl border border-stone-200 dark:border-stone-800 border-l-4 ${typeClass} space-y-1.5`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                            {ann.type}
                          </span>
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {ann.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">
                          {new Date(ann.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
                        {ann.content}
                      </p>
                    </div>
                  );
                })}
                {announcements.length === 0 && (
                  <div className="p-6 text-center text-xs text-stone-400">
                    No announcements broadcast yet. Use the form above to dispatch messages to all squad screens.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: AUDIT LOGS */}
        {/* ========================================================================= */}
        {activeTab === 'AUDIT' && (
          <div className="card p-6 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
                Authoritative Audit Stream ({auditLogs.length} Records)
              </h3>
              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter actions or targets..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-1.5"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 font-mono text-xs">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 flex items-start justify-between gap-4"
                >
                  <div>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      [{log.action}]
                    </span>{' '}
                    <span className="text-stone-500 text-[11px]">({log.actor} • {log.role})</span>
                    <div className="text-stone-700 dark:text-stone-300 mt-0.5 font-sans text-xs">
                      {log.details}
                    </div>
                  </div>
                  <span className="text-stone-400 text-[10px] flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: ADMIN VERIFICATION (SUPER ADMIN ONLY) */}
        {/* ========================================================================= */}
        {activeTab === 'ADMIN_VERIFICATION' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {!isSuperAdmin() ? (
              <div className="card p-8 text-center space-y-4 border-amber-500/30">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black font-heading text-stone-900 dark:text-stone-100">
                  Super Admin Authority Required
                </h2>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Admin verification is strictly restricted to the primary bootstrap Super Administrator ({BOOTSTRAP_ADMIN_EMAIL}). Standard administrators cannot verify, suspend, or revoke other administrators.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Header Card */}
                <div className="card p-6 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black font-heading text-stone-900 dark:text-stone-100">
                        ADMIN VERIFICATION
                      </h2>
                      <span className="badge badge-orange text-[10px] font-mono">
                        SUPER ADMIN EXCLUSIVE
                      </span>
                    </div>
                    <span className="text-xs font-mono text-stone-400">
                      Bootstrap Account: {BOOTSTRAP_ADMIN_EMAIL}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Verify Code.SCRIET users as active administrators by email address. Manage authorization status (Active, Suspended, Revoked).
                  </p>
                </div>

                {/* 2. Search Code.SCRIET User Card */}
                <div className="card p-6 space-y-4">
                  <h3 className="font-heading font-black text-sm uppercase tracking-wider text-stone-800 dark:text-stone-200">
                    Search Code.SCRIET User
                  </h3>
                  <form onSubmit={handleSearchUser} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-search-admin-email"
                        type="email"
                        placeholder="Enter Email Address (e.g. student@example.com)"
                        value={searchEmailInput}
                        onChange={(e) => setSearchEmailInput(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <button
                      id="btn-search-user"
                      type="submit"
                      disabled={isSearchingUser}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSearchingUser ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      <span>SEARCH USER</span>
                    </button>
                  </form>

                  {/* Search Error Alert */}
                  {searchError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{searchError}</span>
                    </div>
                  )}

                  {/* USER RESULT CARD */}
                  {searchedUser && (
                    <div className="mt-4 p-5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                        <span className="font-heading font-black text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400">
                          USER RESULT
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          Verified Code.SCRIET Member
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-stone-400 block text-[11px]">Name:</span>
                          <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                            {searchedUser.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">Email:</span>
                          <span className="font-bold font-mono text-stone-800 dark:text-stone-200">
                            {searchedUser.email}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">Code.SCRIET User ID:</span>
                          <span className="font-mono text-stone-600 dark:text-stone-400 text-[11px]">
                            {searchedUser.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">Current Role:</span>
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            {searchedUser.role}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">Admin Status:</span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase inline-block ${
                              searchedUser.adminStatus === 'ACTIVE'
                                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                                : searchedUser.adminStatus === 'SUSPENDED'
                                ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                                : searchedUser.adminStatus === 'REVOKED'
                                ? 'bg-red-500/15 text-red-600 border border-red-500/30'
                                : 'bg-stone-500/15 text-stone-500 border border-stone-500/30'
                            }`}
                          >
                            {searchedUser.adminStatus === 'ACTIVE'
                              ? `VERIFIED ADMIN (${searchedUser.adminRole || 'ADMIN'})`
                              : searchedUser.adminStatus === 'SUSPENDED'
                              ? 'SUSPENDED ADMIN'
                              : searchedUser.adminStatus === 'REVOKED'
                              ? 'REVOKED ADMIN'
                              : 'NOT VERIFIED'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">Grant Role:</span>
                          <select
                            value={selectedVerifyRole}
                            onChange={(e) => setSelectedVerifyRole(e.target.value as AdminPermissionRole)}
                            className="text-xs p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold"
                          >
                            <option value="ADMIN">ADMIN (Full Simulator Ops)</option>
                            <option value="EVENT_ADMIN">EVENT_ADMIN (Scarcity & Crisis)</option>
                            <option value="EVENT_OPERATOR">EVENT_OPERATOR (Floor Ops)</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
                        <button
                          id="btn-verify-admin"
                          onClick={() => handleVerify(searchedUser.email)}
                          disabled={actionLoadingEmail === searchedUser.email}
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>{searchedUser.adminStatus === 'ACTIVE' ? 'UPDATE / RE-VERIFY ADMIN' : 'VERIFY ADMIN'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. VERIFIED ADMINS Card */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                    <div>
                      <h3 className="font-heading font-black text-sm uppercase tracking-wider text-stone-800 dark:text-stone-200">
                        VERIFIED ADMINS
                      </h3>
                      <p className="text-xs text-stone-500">
                        Authoritative administrator accounts recognized by server
                      </p>
                    </div>
                    <span className="badge badge-orange text-[10px] font-mono">
                      {adminAuthorizations.filter((a) => a.status === 'ACTIVE' || a.active).length} Active Admins
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-semibold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Name</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Role</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Verified By</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                        {adminAuthorizations.map((auth) => {
                          const isMaster = auth.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
                          const isActive = auth.status === 'ACTIVE' || (auth.active && auth.status !== 'SUSPENDED' && auth.status !== 'REVOKED');
                          const isSuspended = auth.status === 'SUSPENDED';
                          const isRevoked = auth.status === 'REVOKED';

                          return (
                            <tr key={auth.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/50 transition-colors">
                              <td className="py-3 px-3 font-bold text-stone-900 dark:text-stone-100">
                                {auth.name}
                                {isMaster && (
                                  <span className="ml-2 text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 font-bold">
                                    PRIMARY BOOTSTRAP
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 font-mono text-stone-700 dark:text-stone-300">
                                {auth.email}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold text-stone-800 dark:text-stone-200">
                                  {auth.role}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    isActive
                                      ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                                      : isSuspended
                                      ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                                      : 'bg-stone-500/15 text-stone-400 border border-stone-500/30'
                                  }`}
                                >
                                  {auth.status || (isActive ? 'ACTIVE' : 'INACTIVE')}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-[11px] text-stone-500 truncate max-w-[140px]">
                                {auth.verifiedBy || 'SYSTEM'}
                              </td>
                              <td className="py-3 px-3 text-right">
                                {isMaster ? (
                                  <span className="text-[10px] text-stone-400 font-mono italic">
                                    Permanent Super Admin
                                  </span>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Suspend Action */}
                                    {isActive && (
                                      <button
                                        id={`btn-suspend-admin-${auth.email}`}
                                        onClick={() => handleSuspend(auth.email)}
                                        disabled={actionLoadingEmail === auth.email}
                                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition-colors"
                                      >
                                        Suspend
                                      </button>
                                    )}

                                    {/* Reactivate Action */}
                                    {(isSuspended || isRevoked) && (
                                      <button
                                        id={`btn-reactivate-admin-${auth.email}`}
                                        onClick={() => handleReactivate(auth.email)}
                                        disabled={actionLoadingEmail === auth.email}
                                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-colors"
                                      >
                                        Reactivate
                                      </button>
                                    )}

                                    {/* Revoke Action */}
                                    {!isRevoked && (
                                      <button
                                        id={`btn-revoke-admin-${auth.email}`}
                                        onClick={() => handleRevoke(auth.email)}
                                        disabled={actionLoadingEmail === auth.email}
                                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-stone-200 dark:bg-stone-800 hover:bg-red-500/20 hover:text-red-500 text-stone-600 dark:text-stone-400 transition-colors"
                                      >
                                        Revoke
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. AUTHORIZATION AUDIT LOG */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                    <div>
                      <h3 className="font-heading font-black text-sm uppercase tracking-wider text-stone-800 dark:text-stone-200">
                        AUTHORIZATION AUDIT TRAIL
                      </h3>
                      <p className="text-xs text-stone-500">
                        Immutable log of administrative authorizations, suspensions, and revocations
                      </p>
                    </div>
                    <span className="badge badge-orange text-[10px] font-mono">
                      {adminAuditLogs.length} Records
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-semibold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Actor</th>
                          <th className="py-2.5 px-3">Target Admin</th>
                          <th className="py-2.5 px-3">Action</th>
                          <th className="py-2.5 px-3">Status Transition</th>
                          <th className="py-2.5 px-3">Reason</th>
                          <th className="py-2.5 px-3 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-mono text-[11px]">
                        {adminAuditLogs.slice(0, 15).map((log) => (
                          <tr key={log.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/50">
                            <td className="py-2.5 px-3 font-bold text-orange-500">
                              {log.actorEmail}
                            </td>
                            <td className="py-2.5 px-3 text-stone-800 dark:text-stone-200">
                              {log.targetEmail}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                {log.action}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-stone-500">
                              {log.beforeStatus} → <span className="font-bold text-stone-900 dark:text-stone-100">{log.afterStatus}</span>
                            </td>
                            <td className="py-2.5 px-3 font-sans text-xs text-stone-600 dark:text-stone-400 max-w-[200px] truncate">
                              {log.reason || 'Operational security update'}
                            </td>
                            <td className="py-2.5 px-3 text-right text-stone-400 text-[10px]">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: EXPORT & BACKUP */}
        {/* ========================================================================= */}
        {activeTab === 'BACKUP' && (
          <div className="card p-6 space-y-4 animate-in fade-in">
            <h3 className="font-heading font-black text-lg text-stone-900 dark:text-stone-100">
              Export, Disaster Recovery & Snapshots (Rules 58 & 59)
            </h3>
            <p className="text-xs text-stone-500">
              Generate 1-click backups and download authoritative JSON and CSV archives of all event ledger transactions.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleExportJSON}
                className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download JSON Snapshot
              </button>

              <button
                onClick={handleExportCSV}
                className="btn-secondary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-stone-400" />
                Export Teams CSV
              </button>

              <button
                onClick={() => setShowRestoreModal(true)}
                className="btn-secondary py-2.5 px-6 text-xs font-bold flex items-center gap-2 ml-auto"
              >
                <Upload className="w-4 h-4 text-orange-500" />
                Restore from Snapshot
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal for Reset & Reseed (Rule 69) */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 bg-white dark:bg-[#12141C] space-y-4 shadow-2xl rounded-3xl border border-red-500/40 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black font-heading text-stone-900 dark:text-stone-100">
                1-Click Rehearsal Reset & Reseed?
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                This will reset team balances, clear proposals, restore initial stock, reseed RNG, and restart Round 2 fresh for simulation rehearsals.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="btn-secondary w-1/2 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAndReseedSimulation();
                  setResetConfirmOpen(false);
                  showToast('Simulation successfully reset and reseeded!');
                }}
                className="btn-danger w-1/2 py-2 text-xs font-bold"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Snapshot Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 bg-white dark:bg-[#12141C] space-y-4 shadow-2xl rounded-3xl border border-orange-500/40 animate-in zoom-in-95">
            <h3 className="text-lg font-black font-heading text-stone-900 dark:text-stone-100">
              Restore Event State from Snapshot
            </h3>
            <p className="text-xs text-stone-500">
              Paste the JSON content from a previously downloaded snapshot file.
            </p>
            <textarea
              rows={8}
              value={restoreJsonInput}
              onChange={(e) => setRestoreJsonInput(e.target.value)}
              placeholder="Paste JSON snapshot content here..."
              className="w-full text-xs font-mono p-3 rounded-xl border border-stone-200 dark:border-stone-800"
            />
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="btn-secondary py-2 px-5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreSubmit}
                className="btn-primary py-2 px-6 text-xs font-bold"
              >
                Restore Snapshot State
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
  );
};
