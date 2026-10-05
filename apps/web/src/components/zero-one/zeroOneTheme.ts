// ZERO → ONE Design System & Aesthetics Tokens
// Color palette directly sampled from the supplied visual reference:
// Background: Deep dark chocolate brown (#140904, #1B0C05)
// Surface Panels: Dark brown glass with warm amber borders (#261208, #35180B)
// Accents: Warm amber (#F59E0B), Golden Orange (#FFB52E), Burnt Orange (#F97316)
// Typography: Cream / Warm White (#FFF7ED), Soft Amber (#FED7AA)

export const zoTokens = {
  '--zo-bg': '#140904',
  '--zo-surface': '#220F06',
  '--zo-surface-dark': '#180B04',
  '--zo-surface-raised': '#2A1308',
  '--zo-primary': '#F59E0B',
  '--zo-primary-hover': '#FFB52E',
  '--zo-secondary': '#F97316',
  '--zo-text': '#FFF7ED',
  '--zo-muted': '#FED7AA',
  '--zo-success': '#10B981',
  '--zo-danger': '#EF4444',
  '--zo-border': 'rgba(245, 158, 11, 0.2)',
  '--zo-border-active': 'rgba(255, 181, 46, 0.6)',
} as const;

export const zoColors = {
  bgDeep: '#140904',
  bgCard: '#220F06',
  bgCardRaised: '#2E1509',
  bgCardMuted: '#180B04',
  borderMuted: 'rgba(245, 158, 11, 0.15)',
  borderAccent: 'rgba(245, 158, 11, 0.4)',
  borderGlow: 'rgba(255, 181, 46, 0.6)',
  amber: '#F59E0B',
  brightAmber: '#FFB52E',
  orange: '#F97316',
  cream: '#FFF7ED',
  creamMuted: '#FED7AA',
  emerald: '#10B981',
  crimson: '#EF4444',
};

export const zoStyles = {
  // Container & Page
  pageBg: 'bg-[#140904] text-[#FFF7ED] min-h-screen font-sans selection:bg-[#F59E0B]/30 selection:text-white',
  
  // Panels & Cards
  card: 'bg-[#220F06]/95 border border-amber-500/20 rounded-2xl backdrop-blur-md shadow-xl shadow-black/40',
  cardRaised: 'bg-[#2A1308] border border-amber-500/30 rounded-2xl backdrop-blur-md shadow-2xl shadow-black/50',
  cardInteractive: 'bg-[#220F06]/90 border border-amber-500/20 hover:border-amber-500/50 hover:bg-[#2A1308] rounded-2xl backdrop-blur-md transition-all duration-200 cursor-pointer shadow-lg shadow-black/30',
  
  // Buttons
  btnPrimary: 'inline-flex items-center justify-center font-bold px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#140904] shadow-lg shadow-amber-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0',
  btnSecondary: 'inline-flex items-center justify-center font-semibold px-6 py-3 rounded-xl bg-[#2A1308] hover:bg-[#381A0B] border border-amber-500/30 hover:border-amber-500/60 text-[#FED7AA] hover:text-[#FFF7ED] transition-all duration-200',
  btnGhost: 'inline-flex items-center justify-center font-medium px-4 py-2 rounded-xl text-amber-300 hover:text-white hover:bg-amber-500/10 transition-colors',
  
  // Status Badges
  badgeCompleted: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm',
  badgeActive: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20 animate-pulse',
  badgeLocked: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-stone-400 border border-white/10',
  
  // Text Styles
  headingDisplay: 'font-display font-black tracking-tight text-[#FFF7ED]',
  headingSub: 'font-semibold tracking-wide text-amber-400 uppercase text-xs sm:text-sm',
  textMuted: 'text-[#FED7AA]/80 text-sm leading-relaxed',
  textSecondary: 'text-[#FED7AA]/60 text-xs',
};
