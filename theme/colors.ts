// Paleta espelhada do frontend Angular (src/styles.css, tokens --aiut-*).
// Mantém a identidade roxa com suporte a claro/escuro.
export const colorTokens = {
  light: {
    background: '#F7F7FB',
    backgroundElevated: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F5F6FA',
    text: '#12101C',
    mutedText: '#56516A',
    subtleText: '#8B849B',
    primary: '#7C3AED',
    primaryDark: '#6D28D9',
    primaryLight: '#EEE7FF',
    primarySoft: 'rgba(124, 58, 237, 0.08)',
    secondary: '#F59E0B',
    accent: '#14B8A6',
    border: '#E5E7EB',
    borderStrong: '#CBD5E1',
    chip: '#EEE7FF',
    modeToggleIcon: '#000000',
    onPrimary: '#FFFFFF',
    bubbleUser: '#7C3AED',
    bubbleAssistant: '#F5F6FA',
    focusRing: 'rgba(124, 58, 237, 0.2)',

    // Menu lateral (sempre escuro, espelhando a sidebar do frontend)
    sidebarBg: '#171222',
    sidebarBorder: 'rgba(255, 255, 255, 0.08)',
    sidebarText: '#EEE9FF',
    sidebarMuted: '#AAA0C6',
    sidebarActiveBg: 'rgba(167, 139, 250, 0.18)',
    sidebarActiveText: '#FFFFFF',
    sidebarHoverBg: 'rgba(255, 255, 255, 0.07)',

    // Cores de status (valor único)
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#DC2626',
    info: '#A855F7',

    // Pares background/foreground (badges, chips)
    successBg: '#D1FAE5',
    successFg: '#047857',
    warningBg: '#FEF3C7',
    warningFg: '#92400E',
    dangerBg: '#FEE2E2',
    dangerFg: '#991B1B',
    infoBg: '#EDE9FE',
    infoFg: '#5B21B6',
    neutralBg: '#E5E7EB',
    neutralFg: '#374151',

    // Status de chamados
    statusOpen: '#7C3AED',
    statusInProgress: '#F59E0B',
    statusWaiting: '#A855F7',
    statusResolved: '#10B981',
    statusClosed: '#6B7280',

    // Prioridade
    priorityLow: '#6B7280',
    priorityMedium: '#7C3AED',
    priorityHigh: '#F97316',
    priorityUrgent: '#DC2626',

    // Papéis
    roleAdmin: '#7C3AED',
    roleAgent: '#10B981',
    roleViewer: '#6B7280',
    roleRequester: '#F59E0B',
  },
  dark: {
    background: '#0F0F14',
    backgroundElevated: '#15151C',
    surface: '#181820',
    surfaceMuted: '#22222C',
    text: '#F5F4FA',
    mutedText: '#CAC6D6',
    subtleText: '#A29AAD',
    primary: '#A78BFA',
    primaryDark: '#DDD6FE',
    primaryLight: 'rgba(167, 139, 250, 0.16)',
    primarySoft: 'rgba(167, 139, 250, 0.08)',
    secondary: '#FBBF24',
    accent: '#2DD4BF',
    border: '#30303A',
    borderStrong: '#4A4658',
    chip: 'rgba(167, 139, 250, 0.16)',
    modeToggleIcon: '#FFFFFF',
    onPrimary: '#160B2C',
    bubbleUser: '#A78BFA',
    bubbleAssistant: '#22222C',
    focusRing: 'rgba(167, 139, 250, 0.24)',

    // Menu lateral (sempre escuro, espelhando a sidebar do frontend)
    sidebarBg: '#121019',
    sidebarBorder: 'rgba(255, 255, 255, 0.08)',
    sidebarText: '#F5F0FF',
    sidebarMuted: '#AFA6C0',
    sidebarActiveBg: 'rgba(167, 139, 250, 0.18)',
    sidebarActiveText: '#FFFFFF',
    sidebarHoverBg: 'rgba(255, 255, 255, 0.07)',

    // Cores de status (valor único)
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    info: '#C084FC',

    // Pares background/foreground (badges, chips)
    successBg: 'rgba(16, 185, 129, 0.16)',
    successFg: '#6EE7B7',
    warningBg: 'rgba(245, 158, 11, 0.16)',
    warningFg: '#FCD34D',
    dangerBg: 'rgba(220, 38, 38, 0.18)',
    dangerFg: '#FCA5A5',
    infoBg: 'rgba(167, 139, 250, 0.16)',
    infoFg: '#DDD6FE',
    neutralBg: 'rgba(255, 255, 255, 0.08)',
    neutralFg: '#CAC6D6',

    // Status de chamados (dark só sobrescreve statusOpen)
    statusOpen: '#A78BFA',
    statusInProgress: '#F59E0B',
    statusWaiting: '#A855F7',
    statusResolved: '#10B981',
    statusClosed: '#6B7280',

    // Prioridade (dark só sobrescreve priorityMedium)
    priorityLow: '#6B7280',
    priorityMedium: '#A78BFA',
    priorityHigh: '#F97316',
    priorityUrgent: '#DC2626',

    // Papéis (dark só sobrescreve roleAdmin)
    roleAdmin: '#A78BFA',
    roleAgent: '#10B981',
    roleViewer: '#6B7280',
    roleRequester: '#F59E0B',
  },
} as const;
