import React, { useState, useEffect } from 'react';
import { CodeScrietLogo } from './CodeScrietLogo';
import { useSimulation } from '../services/simulationContext';
import { PRESET_USERS, BOOTSTRAP_ADMIN_EMAIL } from '../services/adminAuthService';
import {
  Sun,
  Moon,
  ChevronDown,
  UserCheck,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Gavel,
  Briefcase,
  Layers,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  LogIn,
  LogOut,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
} from 'lucide-react';
import { SimulationRole } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    currentTeam,
    teams,
    setCurrentTeamId,
    eventStatus,
    serverTimeRemainingSeconds,
    isLockdownActive,
    isAdminVerified,
    getAdminStatus,
    isSuperAdmin,
    loginWithEmail,
    logout,
    isLoggedIn,
    adminNotification,
    dismissAdminNotification,
  } = useSimulation();

  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark');
  });

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEmailLoginForm, setShowEmailLoginForm] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState('');

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('codescriet-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('codescriet-theme', 'light');
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const close = () => {
      setIsRoleDropdownOpen(false);
      setIsTeamDropdownOpen(false);
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // Format seconds to mm:ss
  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isSimulationView = [
    'team-dashboard',
    'market',
    'crisis',
    'inventory',
    'canvas',
    'build',
    'auction',
    'trade',
    'submit',
  ].includes(currentView);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#EFE8DD] dark:border-[#202432] bg-[#FAF8F5]/90 dark:bg-[#07080B]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div
            onClick={() => onNavigate('landing')}
            className="cursor-pointer flex items-center gap-2 hover:opacity-95 transition-opacity"
          >
            <CodeScrietLogo size={34} />
          </div>

          <div className="h-5 w-px bg-stone-300 dark:bg-stone-700 hidden sm:block" />

          {/* Subdomain / Event Mark */}
          <div
            onClick={() => onNavigate(isSimulationView ? 'team-dashboard' : 'landing')}
            className="cursor-pointer inline-flex items-center gap-1.5 font-bold tracking-tight text-stone-900 dark:text-stone-100 hover:text-orange-600 transition-colors"
          >
            <span className="font-heading text-sm sm:text-base tracking-wide uppercase font-extrabold text-orange-600 dark:text-orange-500">
              ZERO → ONE
            </span>
          </div>

          {/* Clock badge in simulation view */}
          {isSimulationView && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-400 font-mono text-xs font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>{eventStatus.replace('_', ' ')}</span>
              <span className="text-stone-400">|</span>
              <span className="font-bold">{formatTimer(serverTimeRemainingSeconds)}</span>
            </div>
          )}
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              currentView === 'landing'
                ? 'text-orange-600 dark:text-orange-400 font-semibold bg-orange-500/10'
                : 'hover:text-orange-600 dark:hover:text-orange-400'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('events-directory')}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              currentView === 'events-directory'
                ? 'text-orange-600 dark:text-orange-400 font-semibold bg-orange-500/10'
                : 'hover:text-orange-600 dark:hover:text-orange-400'
            }`}
          >
            Events
          </button>

          <button
            onClick={() => onNavigate('team-dashboard')}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              isSimulationView
                ? 'text-orange-600 dark:text-orange-400 font-semibold bg-orange-500/10'
                : 'hover:text-orange-600 dark:hover:text-orange-400'
            }`}
          >
            Team Hub
          </button>

          <button
            onClick={() => onNavigate('live-screen')}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              currentView === 'live-screen'
                ? 'text-orange-600 dark:text-orange-400 font-semibold bg-orange-500/10'
                : 'hover:text-orange-600 dark:hover:text-orange-400'
            }`}
          >
            Live Screen
          </button>

          <button
            onClick={() => onNavigate('judge-portal')}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              currentView === 'judge-portal'
                ? 'text-orange-600 dark:text-orange-400 font-semibold bg-orange-500/10'
                : 'hover:text-orange-600 dark:hover:text-orange-400'
            }`}
          >
            Judge
          </button>

          <button
            onClick={() => onNavigate('marshal-portal')}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              currentView === 'marshal-portal'
                ? 'text-orange-600 dark:text-orange-400 font-semibold bg-orange-500/10'
                : 'hover:text-orange-600 dark:hover:text-orange-400'
            }`}
          >
            Marshal
          </button>

          {/* Admin Panel button - ONLY visible if user is server-verified admin */}
          {isAdminVerified() && (
            <a
              id="header-nav-admin-btn"
              href="/admin.html"
              className="px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-semibold bg-orange-500/10 hover:bg-orange-500/20"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </a>
          )}
        </nav>

        {/* Right: Team Switcher, Theme Toggle, Profile & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Team Switcher (when in simulation) */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsTeamDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:border-orange-500 transition-colors"
            >
              <Briefcase className="w-3.5 h-3.5 text-orange-500" />
              <span>{currentTeam.teamCode}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {isTeamDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#12141C] rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 py-1.5">
                  Select Active Team
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {teams.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setCurrentTeamId(t.id);
                        setIsTeamDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        t.id === currentTeam.id
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold'
                          : 'hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="truncate">
                        {t.teamCode} - {t.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {t.healthScore}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full flex items-center justify-center text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:text-orange-500 hover:border-orange-500 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
          </button>

          {/* Role Switcher & Profile Dropdown (signed in) / Sign In (guest) */}
          {!isLoggedIn ? (
            <button
              onClick={() => onNavigate('onboarding')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Join</span>
            </button>
          ) : (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-orange-500 transition-colors"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-orange-500"
              />
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 hidden sm:inline">
                {currentRole}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#12141C] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Identity and Authoritative Server Status */}
                <div className="pb-3 mb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center justify-between">
                    <span className="truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-stone-400 font-mono">ID: {currentUser.id.slice(-6)}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">{currentUser.email}</div>

                  {/* Server Authoritative Status Badge */}
                  <div className="mt-2">
                    {isAdminVerified() ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{isSuperAdmin() ? 'Super Administrator' : 'Verified Administrator'}</span>
                      </div>
                    ) : getAdminStatus() === 'SUSPENDED' || getAdminStatus() === 'ADMIN_SUSPENDED' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                        <Ban className="w-3.5 h-3.5 text-rose-500" />
                        <span>Admin Privileges Suspended</span>
                      </div>
                    ) : getAdminStatus() === 'REVOKED' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                        <Ban className="w-3.5 h-3.5 text-red-500" />
                        <span>Admin Access Revoked</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                        <UserCheck className="w-3.5 h-3.5 text-orange-500" />
                        <span>Official Code.SCRIET Member</span>
                      </div>
                    )}
                  </div>

                  {/* Direct Admin Access Button in Profile - ONLY for Verified Active Admins */}
                  {isAdminVerified() && (
                    <a
                      id="profile-open-admin-btn"
                      href="/admin.html"
                      className="mt-2.5 w-full py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-between transition-colors shadow-sm"
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Open Admin Dashboard (admin.html)</span>
                      </span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Enter</span>
                    </a>
                  )}
                </div>

                {/* Simulation Role Switcher with Server-Side Guard on ADMIN */}
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1 py-1">
                  Simulation Role
                </div>

                <div className="grid grid-cols-2 gap-1 mb-2">
                  {(['CEO', 'CFO', 'CTO', 'CMO', 'JUDGE', 'MARSHAL'] as (SimulationRole | 'JUDGE' | 'MARSHAL')[]).map(
                    (role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setCurrentRole(role as SimulationRole);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          currentRole === role
                            ? 'bg-orange-500 text-white font-bold shadow-sm'
                            : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          {role === 'CEO' && <Briefcase className="w-3 h-3" />}
                          {role === 'CFO' && <Layers className="w-3 h-3" />}
                          {role === 'CTO' && <Sparkles className="w-3 h-3" />}
                          {role === 'CMO' && <UserCheck className="w-3 h-3" />}
                          {role === 'JUDGE' && <Gavel className="w-3 h-3" />}
                          {role === 'MARSHAL' && <Shield className="w-3 h-3" />}
                          <span>{role}</span>
                        </span>
                        {currentRole === role && <span className="text-[9px]">●</span>}
                      </button>
                    )
                  )}

                  {/* ADMIN role button - disabled/checked server-side */}
                  <button
                    disabled={!isAdminVerified()}
                    onClick={() => {
                      if (isAdminVerified()) {
                        setCurrentRole('ADMIN');
                        setIsRoleDropdownOpen(false);
                      }
                    }}
                    title={isAdminVerified() ? 'Switch to Admin view' : 'Requires verified admin authorization'}
                    className={`col-span-2 text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      !isAdminVerified()
                        ? 'opacity-40 cursor-not-allowed bg-stone-100 dark:bg-stone-900 text-stone-400'
                        : currentRole === 'ADMIN'
                        ? 'bg-orange-500 text-white font-bold shadow-sm'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>ADMIN</span>
                      {!isAdminVerified() && (
                        <span className="text-[10px] text-stone-400 font-normal">
                          (Authorization Required)
                        </span>
                      )}
                    </span>
                    {currentRole === 'ADMIN' && <span className="text-[10px]">Active</span>}
                  </button>
                </div>

                {/* Persona Switcher for Quick Verification Testing */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1 py-1">
                    Persona Testing (Auth States)
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {PRESET_USERS.map((p) => (
                      <button
                        key={p.user.email}
                        onClick={() => {
                          loginWithEmail(p.user.email, p.user.name);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition-colors ${
                          currentUser.email.toLowerCase() === p.user.email.toLowerCase()
                            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold'
                            : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        <span className="truncate max-w-[170px]">{p.label}</span>
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                          {p.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Unified Login with Any Email */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => setShowEmailLoginForm((v) => !v)}
                    className="w-full text-left text-[11px] font-bold text-stone-500 hover:text-orange-500 flex items-center justify-between py-1 transition-colors"
                  >
                    <span>Unified Email Sign In</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${showEmailLoginForm ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showEmailLoginForm && (
                    <div className="mt-1.5 space-y-1.5 p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                      <input
                        type="email"
                        value={customEmailInput}
                        onChange={(e) => setCustomEmailInput(e.target.value)}
                        placeholder="Enter email to sign in..."
                        className="w-full px-2 py-1 text-xs rounded border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => {
                          if (customEmailInput.trim()) {
                            loginWithEmail(customEmailInput.trim());
                            setCustomEmailInput('');
                            setShowEmailLoginForm(false);
                            setIsRoleDropdownOpen(false);
                          }
                        }}
                        className="w-full py-1 text-xs font-bold rounded bg-orange-600 hover:bg-orange-500 text-white transition-colors"
                      >
                        Sign In (Unified Flow)
                      </button>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <div className="pt-2 mt-1 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => {
                      logout();
                      setIsRoleDropdownOpen(false);
                      onNavigate('landing');
                    }}
                    className="w-full py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen((p) => !p)}
            className="lg:hidden p-2 text-stone-700 dark:text-stone-300 hover:text-orange-500"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-[#FAF8F5] dark:bg-[#07080B] px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              onNavigate('landing');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Home Landing
          </button>
          <button
            onClick={() => {
              onNavigate('events-directory');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Events (codescriet.dev/events)
          </button>
          <button
            onClick={() => {
              onNavigate('team-dashboard');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 text-orange-600"
          >
            Team Dashboard
          </button>
          <button
            onClick={() => {
              onNavigate('market');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Digital Market
          </button>
          <button
            onClick={() => {
              onNavigate('crisis');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 text-red-600"
          >
            Active Crisis
          </button>
          <button
            onClick={() => {
              onNavigate('canvas');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Startup Canvas
          </button>
          <button
            onClick={() => {
              onNavigate('live-screen');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Auditorium Live Screen
          </button>

          {/* Mobile Admin Link - SERVER AUTHORIZATION CHECK */}
          {isAdminVerified() && (
            <a
              id="mobile-nav-admin-btn"
              href="/admin.html"
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 text-orange-600 flex items-center justify-between"
            >
              <span>Admin Control Center (admin.html)</span>
              <span className="text-[10px] uppercase font-bold bg-orange-500/20 text-orange-600 px-2 py-0.5 rounded-full">
                Verified
              </span>
            </a>
          )}

        </div>
      )}

      {/* Admin Notification Toast Banner */}
      {adminNotification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white dark:bg-[#12141C] border border-orange-500/30 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-xs text-stone-900 dark:text-stone-100">
              {adminNotification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {adminNotification.type === 'error' && <Ban className="w-4 h-4 text-red-500" />}
              {adminNotification.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
              {adminNotification.type === 'info' && <ShieldCheck className="w-4 h-4 text-orange-500" />}
              <span>{adminNotification.title}</span>
            </div>
            <button
              onClick={dismissAdminNotification}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 pl-6">
            {adminNotification.message}
          </p>
        </div>
      )}
    </header>
  );
};
