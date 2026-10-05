import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Compass,
  Trophy,
  Users,
  HelpCircle,
  Zap,
  Activity,
  Coins,
  TrendingUp,
  CheckCircle2,
  Lock,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  api,
  type Event,
  type CompetitionRoundPreview,
  type EventTeam,
} from '@/lib/api';
import {
  ZERO_ONE_LEVELS,
  type ZeroOneView,
  type MissionNodeStatus,
  type LeaderboardTeamEntry,
  type SimulationState,
  INITIAL_SIMULATION_STATE,
} from './types';
import { ZeroOneGameHUD } from './ZeroOneGameHUD';
import { ZeroOneHero } from './ZeroOneHero';
import { ZeroOneMissionMap } from './ZeroOneMissionMap';
import { ZeroOneDashboard } from './ZeroOneDashboard';
import { ZeroOneTeamView } from './ZeroOneTeamView';
import { ZeroOneRankings } from './ZeroOneRankings';
import { ZeroOneRegistration } from './ZeroOneRegistration';
import { ZeroOneMissionControl } from './ZeroOneMissionControl';
import { ZeroOneSubmitModal } from './ZeroOneSubmitModal';
import { ZeroOneCompletionModal } from './ZeroOneCompletionModal';
import { ZeroOneHowToPlayModal } from './ZeroOneHowToPlayModal';
import { ZeroOneProfileModal } from './ZeroOneProfileModal';
import {
  ZeroOneLevel1Discover,
  ZeroOneLevel2Build,
  ZeroOneLevel3Validate,
  ZeroOneLevel4Grow,
  ZeroOneLevel5Scale,
  ZeroOneFinalSummary,
} from './levels';
import { zoStyles } from './zeroOneTheme';

interface ZeroOneGameShellProps {
  event: Event;
  initialRounds?: any[];
  initialTeam?: EventTeam | null;
  onExit?: () => void;
}

export const ZeroOneGameShell: React.FC<ZeroOneGameShellProps> = ({
  event,
  initialRounds = [],
  initialTeam = null,
  onExit,
}) => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'CORE_MEMBER' || user?.role === 'PRESIDENT';

  // Game Navigation View State
  const [currentView, setCurrentView] = useState<ZeroOneView>(
    initialTeam || user?.id ? 'game' : 'landing'
  );
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<number>(2);

  // Mobile Bottom Tab State for in-game view
  const [mobileTab, setMobileTab] = useState<'mission' | 'stats' | 'team' | 'map' | 'rankings'>('mission');

  // Interactive Simulation State (persists throughout user session)
  const [simulationState, setSimulationState] = useState<SimulationState>(INITIAL_SIMULATION_STATE);

  // Modals
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [completionModalData, setCompletionModalData] = useState<{
    isOpen: boolean;
    levelNumber: number;
    title: string;
    rewardXP: number;
    rewardScore: number;
    nextLevelNumber?: number;
    nextLevelTitle?: string;
  } | null>(null);

  // Live Server Data
  const [rounds, setRounds] = useState<CompetitionRoundPreview[]>(initialRounds);
  const [myTeam, setMyTeam] = useState<EventTeam | null>(initialTeam);
  const [allTeams, setAllTeams] = useState<EventTeam[]>([]);
  const [isRegistered, setIsRegistered] = useState<boolean>(Boolean(initialTeam || event.isRegistered));

  // Current Level Tracker
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(2);

  // Format INR Helper
  const formatINR = (val: number) => '₹' + val.toLocaleString('en-IN');

  // Leaderboard data
  const leaderboard: LeaderboardTeamEntry[] = useMemo(() => [
    { rank: 1, teamId: 't-1', teamName: 'Innovators', points: 2450, level: 4, status: 'Active' },
    { rank: 2, teamId: 't-2', teamName: 'CodeCrafters', points: 2300, level: 4, status: 'Active' },
    { rank: 3, teamId: 't-3', teamName: myTeam?.teamName || 'Tech Titans', points: simulationState.score, level: currentLevelNumber, status: 'Active', isCurrentTeam: true },
    { rank: 4, teamId: 't-4', teamName: 'Byte Builders', points: 2100, level: 3, status: 'Active' },
    { rank: 5, teamId: 't-5', teamName: 'Visionaries', points: 1100, level: 2, status: 'Active' },
    { rank: 6, teamId: 't-6', teamName: 'Apex Founders', points: 950, level: 2, status: 'Active' },
    { rank: 7, teamId: 't-7', teamName: 'Nexus Labs', points: 800, level: 1, status: 'Active' },
  ], [myTeam?.teamName, simulationState.score, currentLevelNumber]);

  // Fetch / Sync Rounds & Team from Backend
  const syncGameState = useCallback(async () => {
    try {
      if (event?.id) {
        const roundData = await api.getCompetitionRounds(event.id, token || undefined);
        if (roundData?.rounds && roundData.rounds.length > 0) {
          setRounds(roundData.rounds);
        }

        if (token) {
          const teamData = await api.getMyTeam(event.id, token);
          if (teamData) {
            setMyTeam(teamData);
            setIsRegistered(true);
          }

          if (isAdmin) {
            const allTeamsData = await api.getEventTeams(event.id, token);
            if (allTeamsData?.teams) {
              setAllTeams(allTeamsData.teams as any);
            }
          }
        }
      }
    } catch {
      // Fallback silently if offline; realistic simulation data remains active
    }
  }, [event?.id, token, isAdmin]);

  // Initial fetch and 25s Polling interval for realtime Mission Control feel
  useEffect(() => {
    void syncGameState();
    const interval = setInterval(() => {
      if (!document.hidden) {
        void syncGameState();
      }
    }, 25_000);
    return () => clearInterval(interval);
  }, [syncGameState]);

  // Calculate Computed Level Statuses
  const computedLevelsState = useMemo(() => {
    const states: Record<number, MissionNodeStatus> = {};
    ZERO_ONE_LEVELS.forEach((lvl) => {
      const round = rounds[lvl.levelNumber - 1];
      if (round) {
        if (round.status === 'FINISHED') states[lvl.levelNumber] = 'COMPLETED';
        else if (round.status === 'ACTIVE') states[lvl.levelNumber] = 'ACTIVE';
        else if (round.status === 'JUDGING') states[lvl.levelNumber] = 'ACTIVE';
        else states[lvl.levelNumber] = 'LOCKED';
      } else {
        if (lvl.levelNumber < currentLevelNumber) states[lvl.levelNumber] = 'COMPLETED';
        else if (lvl.levelNumber === currentLevelNumber) states[lvl.levelNumber] = 'ACTIVE';
        else states[lvl.levelNumber] = 'LOCKED';
      }
    });
    return states;
  }, [rounds, currentLevelNumber]);

  // Format team members
  const teamMembers = useMemo(() => {
    if (myTeam && myTeam.members && myTeam.members.length > 0) {
      return myTeam.members.map((m) => ({
        id: m.userId,
        name: m.user?.name || 'Teammate',
        email: m.user?.email || 'member@scriet.edu',
        role: m.role === 'LEADER' ? ('Leader' as const) : ('Member' as const),
        avatar: m.user?.avatar || null,
        status: 'Active' as const,
      }));
    }
    return [
      { id: 'm-1', name: user?.name || 'Aman Gupta', email: user?.email || 'aman@team.com', role: 'Leader' as const, status: 'Active' as const },
      { id: 'm-2', name: 'Rohit Sharma', email: 'rohit@team.com', role: 'Member' as const, status: 'Active' as const },
      { id: 'm-3', name: 'Priya Singh', email: 'priya@team.com', role: 'Member' as const, status: 'Active' as const },
      { id: 'm-4', name: 'Karan Verma', email: 'karan@team.com', role: 'Member' as const, status: 'Active' as const },
      { id: 'm-5', name: 'Sneha Patel', email: 'sneha@team.com', role: 'Member' as const, status: 'Active' as const },
    ];
  }, [myTeam, user]);

  const activeLevelConfig = ZERO_ONE_LEVELS.find((l) => l.levelNumber === selectedLevelNumber) || ZERO_ONE_LEVELS[1];

  // Actions
  const handleSelectLevel = (levelNumber: number) => {
    const status = computedLevelsState[levelNumber];
    if (status === 'LOCKED') {
      toast.error('MISSION LOCKED', {
        description: 'Complete the previous mission and receive Mission Control approval to unlock this level.',
      });
      return;
    }
    setSelectedLevelNumber(levelNumber);
    setCurrentView('game');
    setMobileTab('mission');
  };

  const handleDeniedNotice = (reason: string) => {
    toast.error('MISSION ACCESS DENIED', {
      description: reason,
    });
  };

  // State update helper for interactive simulation
  const handleUpdateSimulationState = (partial: Partial<SimulationState>) => {
    setSimulationState((prev) => ({ ...prev, ...partial }));
  };

  // Level Completion Advancement Trigger
  const triggerLevelCompletion = (lvlNum: number, rewardXP: number, rewardScore: number) => {
    const config = ZERO_ONE_LEVELS.find((l) => l.levelNumber === lvlNum);
    const nextNum = lvlNum + 1;
    const nextConfig = ZERO_ONE_LEVELS.find((l) => l.levelNumber === nextNum);

    if (lvlNum >= currentLevelNumber && lvlNum < 6) {
      setCurrentLevelNumber(nextNum);
    }

    setCompletionModalData({
      isOpen: true,
      levelNumber: lvlNum,
      title: config?.title || `MISSION 0${lvlNum}`,
      rewardXP,
      rewardScore,
      nextLevelNumber: nextNum <= 6 ? nextNum : undefined,
      nextLevelTitle: nextConfig?.title || 'GRAND AUDITORIUM DEFENSE',
    });
  };

  // Submission handler
  const handleMissionSubmit = async (payload: {
    prototypeUrl: string;
    repoUrl: string;
    deckUrl: string;
    summary: string;
  }) => {
    const activeRound = rounds[selectedLevelNumber - 1];
    const codePayload = JSON.stringify(payload);

    if (activeRound?.id && token) {
      try {
        await api.submitCompetitionCode(activeRound.id, { code: codePayload }, token);
        toast.success('Mission deliverables recorded with Mission Control!');
      } catch {
        toast.info('Simulated deliverable synced locally.');
      }
    }

    triggerLevelCompletion(selectedLevelNumber, activeLevelConfig.rewardXP, activeLevelConfig.rewardScore);
  };

  // Admin Level Actions
  const handleAdminStartRound = async (roundId: string) => {
    if (!token) return;
    try {
      await api.startCompetitionRound(roundId, token);
      toast.success('Level opened for all squads!');
      await syncGameState();
    } catch (err: any) {
      toast.error('Failed to open level: ' + (err?.message || 'Error'));
    }
  };

  const handleAdminLockRound = async (roundId: string) => {
    if (!token) return;
    try {
      await api.lockCompetitionRound(roundId, token);
      toast.success('Level locked by Mission Control.');
      await syncGameState();
    } catch (err: any) {
      toast.error('Failed to lock level: ' + (err?.message || 'Error'));
    }
  };

  const handleAdminJudgingRound = async (roundId: string) => {
    if (!token) return;
    try {
      await api.beginJudging(roundId, token);
      toast.success('Level judging phase active.');
      await syncGameState();
    } catch (err: any) {
      toast.error('Failed to start judging: ' + (err?.message || 'Error'));
    }
  };

  const handleAdminFinishRound = async (roundId: string) => {
    if (!token) return;
    try {
      await api.finishCompetition(roundId, token);
      toast.success('Level marked complete.');
      await syncGameState();
    } catch (err: any) {
      toast.error('Failed to finish level: ' + (err?.message || 'Error'));
    }
  };

  const handleAdminLockTeam = async (teamId: string) => {
    if (!token) return;
    try {
      await api.adminToggleTeamLock(teamId, token);
      toast.success('Team lock status toggled.');
      await syncGameState();
    } catch (err: any) {
      toast.error('Failed to toggle team lock: ' + (err?.message || 'Error'));
    }
  };

  // Registration complete handler
  const handleRegistrationComplete = async (data: {
    fullName: string;
    college: string;
    email: string;
    teamAction: 'create' | 'join';
    teamName: string;
    inviteCode: string;
    role: string;
  }) => {
    try {
      if (token && event?.id) {
        if (data.teamAction === 'create') {
          await api.createTeam({ eventId: event.id, teamName: data.teamName }, token);
        } else if (data.teamAction === 'join' && data.inviteCode) {
          await api.joinTeam({ inviteCode: data.inviteCode }, token);
        }
      }
      setIsRegistered(true);
      toast.success('Mission profile initialized! Welcome to the Arena.');
      setCurrentView('game');
      await syncGameState();
    } catch {
      setIsRegistered(true);
      toast.success('Mission profile initialized! Welcome to the Arena.');
      setCurrentView('game');
    }
  };

  return (
    <div className={zoStyles.pageBg}>
      {/* ---------------- TOP BAR (Desktop 6-field spec & Mobile compact) ---------------- */}
      <ZeroOneGameHUD
        currentView={currentView}
        onNavigate={setCurrentView}
        teamName={myTeam?.teamName || 'TECH TITANS'}
        currentLevel={currentLevelNumber}
        capital={simulationState.capital}
        xp={simulationState.score}
        rank="#03"
        statusText="MISSION ACTIVE"
        remainingSeconds={18 * 60 + 42}
        isAdmin={isAdmin}
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onOpenProfile={() => setShowProfile(true)}
        user={user}
        onLogout={logout}
      />

      {/* Main Container */}
      <div className="w-full">
        {/* LANDING / HERO START SCREEN (Section 5) */}
        {currentView === 'landing' && (
          <div className="space-y-0">
            <ZeroOneHero
              onStartMission={() => setCurrentView(isRegistered ? 'game' : 'register')}
              onViewMap={() => setCurrentView('map')}
              isRegistered={isRegistered}
              participantCount={250}
              teamCount={60}
            />
            <ZeroOneMissionMap
              currentLevel={currentLevelNumber}
              onSelectLevel={handleSelectLevel}
              levelsState={computedLevelsState}
              onLevelDeniedNotice={handleDeniedNotice}
            />
            <div className="py-8 text-center bg-[#140904]">
              <button
                onClick={() => setShowHowToPlay(true)}
                className="text-xs font-mono text-amber-400 hover:text-white underline underline-offset-4"
              >
                Read Official Mission Rules & Simulation Guidelines →
              </button>
            </div>
          </div>
        )}

        {/* MAP VIEW */}
        {currentView === 'map' && (
          <div className="space-y-6">
            <ZeroOneMissionMap
              currentLevel={currentLevelNumber}
              onSelectLevel={handleSelectLevel}
              levelsState={computedLevelsState}
              onLevelDeniedNotice={handleDeniedNotice}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 flex justify-center">
              <button
                onClick={() => setCurrentView('game')}
                className={zoStyles.btnSecondary}
              >
                ← Return to Mission Console
              </button>
            </div>
          </div>
        )}

        {/* REGISTRATION VIEW */}
        {currentView === 'register' && (
          <div className="space-y-6 py-6">
            <ZeroOneRegistration
              onComplete={handleRegistrationComplete}
              initialUser={user}
            />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 flex justify-center">
              <button
                onClick={() => setCurrentView('landing')}
                className="text-xs font-mono text-stone-400 hover:text-white"
              >
                ← Return to Event Briefing
              </button>
            </div>
          </div>
        )}

        {/* ADMIN MISSION CONTROL VIEW */}
        {currentView === 'mission-control' && isAdmin && (
          <div className="space-y-6 py-4">
            <ZeroOneMissionControl
              rounds={rounds}
              teams={allTeams.length > 0 ? allTeams : (myTeam ? [myTeam] : [])}
              onStartRound={handleAdminStartRound}
              onLockRound={handleAdminLockRound}
              onJudgingRound={handleAdminJudgingRound}
              onFinishRound={handleAdminFinishRound}
              onLockTeam={handleAdminLockTeam}
              activeLevelNumber={currentLevelNumber}
              onSendAnnouncement={(msg) => {
                toast.success('Broadcast sent: ' + msg);
              }}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 flex justify-center">
              <button
                onClick={() => setCurrentView('game')}
                className={zoStyles.btnSecondary}
              >
                ← Return to Mission Console
              </button>
            </div>
          </div>
        )}

        {/* TACTICAL SQUAD DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <ZeroOneDashboard
            currentView={currentView}
            onNavigate={setCurrentView}
            teamName={myTeam?.teamName || 'TECH TITANS'}
            teamCode={myTeam?.inviteCode || '2T-001'}
            currentLevel={currentLevelNumber}
            xp={simulationState.score}
            rank="#03"
            levelsCompleted={currentLevelNumber - 1}
            totalLevels={5}
            teamMembers={teamMembers}
            inviteCode={myTeam?.inviteCode || 'TECHN001'}
            remainingSeconds={18 * 60 + 42}
            onContinueMission={() => {
              setSelectedLevelNumber(currentLevelNumber);
              setCurrentView('game');
            }}
            onOpenTeam={() => {
              setCurrentView('game');
              setMobileTab('team');
            }}
            onExitGame={onExit || (() => navigate('/events'))}
          />
        )}

        {/* ---------------- 3-COLUMN GAME SHELL (Section 4 Specification) ---------------- */}
        {currentView === 'game' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 lg:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ---------------- LEFT SIDEBAR (Levels 01-05, Progress, Team, Leaderboard, Rules) ---------------- */}
              <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20">
                <div className="rounded-xl border border-amber-500/25 bg-[#180B04] p-4 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-950/60">
                    <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
                      MISSION MAP
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      0{currentLevelNumber} / 05
                    </span>
                  </div>

                  {/* Level Item List */}
                  <div className="space-y-1.5">
                    {ZERO_ONE_LEVELS.slice(0, 5).map((lvl) => {
                      const isSelected = selectedLevelNumber === lvl.levelNumber;
                      const status = computedLevelsState[lvl.levelNumber];
                      const isCompleted = status === 'COMPLETED';
                      const isCurrentActive = status === 'ACTIVE';
                      const isLocked = status === 'LOCKED';

                      return (
                        <button
                          type="button"
                          key={lvl.levelNumber}
                          onClick={() => handleSelectLevel(lvl.levelNumber)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between text-xs font-mono ${
                            isSelected
                              ? 'border-amber-400 bg-[#2C1409] text-stone-100 shadow-md ring-1 ring-amber-400/40'
                              : isCurrentActive
                              ? 'border-amber-500/50 bg-[#220E06] text-amber-200 hover:bg-[#281107]'
                              : isCompleted
                              ? 'border-emerald-500/30 bg-[#121A0F]/60 text-emerald-300 hover:bg-[#162213]'
                              : 'border-amber-950/40 bg-[#120703]/60 text-stone-500 hover:text-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span
                              className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : isCurrentActive
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-stone-900 text-stone-600 border border-stone-800'
                              }`}
                            >
                              0{lvl.levelNumber}
                            </span>
                            <div className="truncate">
                              <span className="font-bold block truncate">{lvl.title}</span>
                              <span className="text-[10px] opacity-70 block truncate">{lvl.subtitle}</span>
                            </div>
                          </div>

                          <div className="shrink-0 ml-2">
                            {isCompleted && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                            {isCurrentActive && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                            )}
                            {isLocked && <Lock className="w-3.5 h-3.5 text-stone-600" />}
                          </div>
                        </button>
                      );
                    })}

                    {/* Level 06 Final Stage */}
                    <button
                      type="button"
                      onClick={() => handleSelectLevel(6)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between text-xs font-mono ${
                        selectedLevelNumber === 6
                          ? 'border-amber-400 bg-[#2C1409] text-stone-100 shadow-md ring-1 ring-amber-400/40'
                          : 'border-amber-950/40 bg-[#140803] text-stone-400 hover:text-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded flex items-center justify-center font-bold text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          ★
                        </span>
                        <div>
                          <span className="font-bold block text-amber-300">ZERO → ONE</span>
                          <span className="text-[10px] text-stone-500 block">Grand Finale & Results</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>

                  {/* Sidebar Navigation Shortcuts */}
                  <div className="pt-3 border-t border-amber-950/60 space-y-1">
                    <button
                      type="button"
                      onClick={() => setCurrentView('dashboard')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-stone-300 hover:text-amber-300 hover:bg-[#200E06] transition-colors"
                    >
                      <Activity className="w-4 h-4 text-orange-400" />
                      <span>Tactical Squad Dashboard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentView('map')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-stone-300 hover:text-amber-300 hover:bg-[#200E06] transition-colors"
                    >
                      <Compass className="w-4 h-4 text-amber-400" />
                      <span>Full Visual Rail Map</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMobileTab('team')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-stone-300 hover:text-amber-300 hover:bg-[#200E06] transition-colors"
                    >
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Squad Roster ({teamMembers.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMobileTab('rankings')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-stone-300 hover:text-amber-300 hover:bg-[#200E06] transition-colors"
                    >
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span>Arena Leaderboard (#03)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowHowToPlay(true)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-stone-300 hover:text-amber-300 hover:bg-[#200E06] transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>Mission Manual & Rules</span>
                    </button>

                    <button
                      type="button"
                      onClick={onExit || (() => navigate('/events'))}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-stone-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-stone-500" />
                      <span>Exit Game</span>
                    </button>
                  </div>
                </div>

                {/* Squad Banner in Sidebar */}
                <div className="rounded-xl border border-amber-900/30 bg-[#150A04]/90 p-4 space-y-2">
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                    ACTIVE SQUAD
                  </span>
                  <div className="font-mono font-bold text-sm text-stone-200">
                    {myTeam?.teamName || 'TECH TITANS'}
                  </div>
                  <div className="text-[11px] font-mono text-amber-400 flex items-center justify-between">
                    <span>Invite: {myTeam?.inviteCode || 'TECHN001'}</span>
                    <span className="text-emerald-400">● 5 Online</span>
                  </div>
                </div>
              </aside>

              {/* ---------------- MAIN GAME AREA (Center 6/12) ---------------- */}
              <main className="lg:col-span-6 space-y-6">
                {/* Mobile Tab Pill Switcher (Visible on mobile & tablet) */}
                <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-1 border-b border-amber-950/60 font-mono text-xs">
                  {[
                    { id: 'mission' as const, label: 'MISSION' },
                    { id: 'stats' as const, label: 'TELEMETRY' },
                    { id: 'team' as const, label: 'SQUAD' },
                    { id: 'rankings' as const, label: 'RANKS' },
                  ].map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setMobileTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg shrink-0 font-bold ${
                        mobileTab === tab.id
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-[#1C0D06] text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Mobile View Routing */}
                {mobileTab === 'stats' && (
                  <div className="block lg:hidden space-y-4">
                    <div className="rounded-xl border border-amber-500/25 bg-[#180B04] p-5 space-y-4">
                      <h3 className="text-sm font-bold font-mono text-amber-400 uppercase">
                        SQUAD TELEMETRY & RUNWAY
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-3 rounded-lg bg-[#200E06] border border-amber-950/60">
                          <span className="text-stone-400 block text-[10px]">CAPITAL</span>
                          <span className="text-amber-400 font-bold text-base">
                            {formatINR(simulationState.capital)}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#200E06] border border-amber-950/60">
                          <span className="text-stone-400 block text-[10px]">SCORE</span>
                          <span className="text-stone-100 font-bold text-base">
                            {simulationState.score} XP
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#200E06] border border-amber-950/60">
                          <span className="text-stone-400 block text-[10px]">FOUNDERS</span>
                          <span className="text-stone-100 font-bold text-base">
                            {simulationState.customers.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#200E06] border border-amber-950/60">
                          <span className="text-stone-400 block text-[10px]">MONTHLY MRR</span>
                          <span className="text-amber-300 font-bold text-base">
                            {formatINR(simulationState.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {mobileTab === 'team' && (
                  <div className="block lg:hidden space-y-4">
                    <ZeroOneTeamView
                      teamName={myTeam?.teamName || 'TECH TITANS'}
                      teamCode={myTeam?.inviteCode || '2T-001'}
                      inviteCode={myTeam?.inviteCode || 'TECHN001'}
                      leaderName={teamMembers.find((m) => m.role === 'Leader')?.name || 'Aman Gupta'}
                      leaderEmail={teamMembers.find((m) => m.role === 'Leader')?.email || 'aman@team.com'}
                      members={teamMembers}
                      currentLevel={currentLevelNumber}
                      totalPoints={simulationState.score}
                      rank="#03"
                      levelsCompleted={currentLevelNumber - 1}
                    />
                  </div>
                )}

                {mobileTab === 'rankings' && (
                  <div className="block lg:hidden space-y-4">
                    <ZeroOneRankings
                      teams={leaderboard}
                      currentTeamName={myTeam?.teamName || 'Tech Titans'}
                    />
                  </div>
                )}

                {/* Primary Interactive Game Arena (Displayed when mobileTab === 'mission' or on Desktop) */}
                {(mobileTab === 'mission' || window.innerWidth >= 1024) && (
                  <div className="space-y-6">
                    {/* LEVEL 01 - DISCOVER */}
                    {selectedLevelNumber === 1 && (
                      <ZeroOneLevel1Discover
                        simulationState={simulationState}
                        onUpdateState={handleUpdateSimulationState}
                        onSubmitDiscovery={() =>
                          triggerLevelCompletion(1, 250, 100)
                        }
                        isLocked={computedLevelsState[1] === 'LOCKED'}
                      />
                    )}

                    {/* LEVEL 02 - BUILD */}
                    {selectedLevelNumber === 2 && (
                      <ZeroOneLevel2Build
                        simulationState={simulationState}
                        onUpdateState={handleUpdateSimulationState}
                        onSubmitBuild={() =>
                          triggerLevelCompletion(2, 500, 250)
                        }
                        isLocked={computedLevelsState[2] === 'LOCKED'}
                      />
                    )}

                    {/* LEVEL 03 - VALIDATE */}
                    {selectedLevelNumber === 3 && (
                      <ZeroOneLevel3Validate
                        simulationState={simulationState}
                        onUpdateState={handleUpdateSimulationState}
                        onSubmitValidate={() =>
                          triggerLevelCompletion(3, 750, 350)
                        }
                        isLocked={computedLevelsState[3] === 'LOCKED'}
                      />
                    )}

                    {/* LEVEL 04 - GROW */}
                    {selectedLevelNumber === 4 && (
                      <ZeroOneLevel4Grow
                        simulationState={simulationState}
                        onUpdateState={handleUpdateSimulationState}
                        onSubmitGrow={() =>
                          triggerLevelCompletion(4, 1000, 500)
                        }
                        isLocked={computedLevelsState[4] === 'LOCKED'}
                      />
                    )}

                    {/* LEVEL 05 - SCALE */}
                    {selectedLevelNumber === 5 && (
                      <ZeroOneLevel5Scale
                        simulationState={simulationState}
                        onUpdateState={handleUpdateSimulationState}
                        onSubmitScale={() =>
                          triggerLevelCompletion(5, 1250, 750)
                        }
                        isLocked={computedLevelsState[5] === 'LOCKED'}
                      />
                    )}

                    {/* LEVEL 06 - FINAL ZERO -> ONE STAGE */}
                    {selectedLevelNumber === 6 && (
                      <ZeroOneFinalSummary
                        simulationState={simulationState}
                        teamName={myTeam?.teamName || 'TECH TITANS'}
                        teamRank="#03"
                        totalTeams={42}
                        onViewLeaderboard={() => setMobileTab('rankings')}
                        onViewJourney={() => setCurrentView('map')}
                      />
                    )}
                  </div>
                )}
              </main>

              {/* ---------------- RIGHT PANEL (Desktop 3/12) ---------------- */}
              <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20">
                {/* Team Status Card */}
                <div className="rounded-xl border border-amber-500/25 bg-[#180B04] p-4 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-950/60">
                    <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-orange-400" />
                      TEAM TELEMETRY
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      LIVE
                    </span>
                  </div>

                  {/* 6 Key Telemetry Tiles */}
                  <div className="space-y-2.5">
                    {/* Capital */}
                    <div className="p-3 rounded-lg bg-[#200E06] border border-amber-950/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 uppercase block">CAPITAL</span>
                          <span className="text-xs font-mono font-bold text-amber-300">
                            {formatINR(simulationState.capital)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">Runway</span>
                    </div>

                    {/* Score */}
                    <div className="p-3 rounded-lg bg-[#200E06] border border-amber-950/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 uppercase block">SCORE</span>
                          <span className="text-xs font-mono font-bold text-stone-100">
                            {simulationState.score.toLocaleString()} XP
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">+250 XP</span>
                    </div>

                    {/* Customers */}
                    <div className="p-3 rounded-lg bg-[#200E06] border border-amber-950/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 uppercase block">CUSTOMERS</span>
                          <span className="text-xs font-mono font-bold text-stone-100">
                            {simulationState.customers.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">+28%</span>
                    </div>

                    {/* Revenue */}
                    <div className="p-3 rounded-lg bg-[#200E06] border border-amber-950/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 uppercase block">REVENUE</span>
                          <span className="text-xs font-mono font-bold text-amber-300">
                            {formatINR(simulationState.revenue)} /mo
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400">Unit +ve</span>
                    </div>
                  </div>

                  {/* Overall Venture Progress Bar */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-stone-400">
                      <span>SIMULATION PROGRESS</span>
                      <span className="text-amber-400 font-bold">
                        {Math.round(((currentLevelNumber - 1) / 5) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                        style={{ width: `${Math.round(((currentLevelNumber - 1) / 5) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Mission Status Badge */}
                  <div className="pt-2 border-t border-amber-950/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-stone-400">MISSION STATUS:</span>
                    <span className="px-2 py-0.5 rounded font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px]">
                      ACTIVE
                    </span>
                  </div>
                </div>

                {/* Squad Members Mini Card */}
                <div className="rounded-xl border border-amber-950/70 bg-[#160A05] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-stone-300 uppercase">
                      SQUAD CREW
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">
                      {teamMembers.length} Members
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {teamMembers.slice(0, 4).map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-[#1C0D07]/60"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">
                            {member.name.charAt(0)}
                          </div>
                          <span className="truncate text-stone-200">{member.name}</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- MODALS & OVERLAYS ---------------- */}
      <ZeroOneSubmitModal
        levelNumber={selectedLevelNumber}
        levelTitle={activeLevelConfig.title}
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={handleMissionSubmit}
      />

      {completionModalData && (
        <ZeroOneCompletionModal
          isOpen={completionModalData.isOpen}
          completedLevelNumber={completionModalData.levelNumber}
          completedLevelTitle={completionModalData.title}
          rewardXP={completionModalData.rewardXP}
          rewardScore={completionModalData.rewardScore}
          nextLevelNumber={completionModalData.nextLevelNumber}
          nextLevelTitle={completionModalData.nextLevelTitle}
          onContinue={() => {
            setCompletionModalData(null);
            if (completionModalData.nextLevelNumber) {
              setSelectedLevelNumber(completionModalData.nextLevelNumber);
              setCurrentView('game');
            }
          }}
        />
      )}

      <ZeroOneHowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      <ZeroOneProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        playerName={user?.name || 'Aman Gupta'}
        email={user?.email || 'founder@scriet.edu'}
        teamName={myTeam?.teamName || 'Tech Titans'}
        teamCode={myTeam?.inviteCode || '2T-001'}
        currentLevel={currentLevelNumber}
        totalXP={simulationState.score}
        rank="#03"
      />
    </div>
  );
};
