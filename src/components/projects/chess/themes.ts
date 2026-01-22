// Board theme definitions
export interface BoardTheme {
    name: string;
    lightSquare: string;
    darkSquare: string;
    border?: string;
    glow?: string;
}

export const BOARD_THEMES: Record<string, BoardTheme> = {
    classic: {
        name: 'Classic',
        lightSquare: '#f0d9b5',
        darkSquare: '#b58863',
    },
    wood: {
        name: 'Wood',
        lightSquare: '#deb887',
        darkSquare: '#8b4513',
    },
    neon: {
        name: 'Neon',
        lightSquare: '#1a1a2e',
        darkSquare: '#0f0f1a',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        glow: '0 0 30px rgba(99, 102, 241, 0.15)',
    },
};

export type ThemeKey = keyof typeof BOARD_THEMES;
