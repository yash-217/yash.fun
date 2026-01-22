import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import type { Move, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BOARD_THEMES } from './themes';
import type { ThemeKey } from './themes';

type GameMode = 'local' | 'cpu';
type GameStatus = 'playing' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';

interface GameState {
    fen: string;
    history: Move[];
    status: GameStatus;
    winner: 'white' | 'black' | 'draw' | null;
}

// Stockfish worker reference
let stockfishWorker: Worker | null = null;

function initStockfish(): Promise<Worker> {
    return new Promise((resolve, reject) => {
        try {
            // Load Stockfish from public directory
            const worker = new Worker('/stockfish/stockfish-17.1-lite-single-03e3232.js');

            worker.onmessage = (e) => {
                if (e.data === 'uciok') {
                    // Set skill level to approximately 1200 ELO
                    worker.postMessage('setoption name Skill Level value 5');
                    worker.postMessage('setoption name Move Overhead value 10');
                    resolve(worker);
                }
            };

            worker.onerror = (e) => {
                console.error('Stockfish worker error:', e);
                reject(e);
            };

            worker.postMessage('uci');
        } catch (error) {
            console.error('Failed to initialize Stockfish:', error);
            reject(error);
        }
    });
}

function getBestMove(worker: Worker, fen: string): Promise<string> {
    return new Promise((resolve) => {
        const handler = (e: MessageEvent) => {
            const message = e.data;
            if (typeof message === 'string' && message.startsWith('bestmove')) {
                const move = message.split(' ')[1];
                worker.removeEventListener('message', handler);
                resolve(move);
            }
        };

        worker.addEventListener('message', handler);
        worker.postMessage(`position fen ${fen}`);
        worker.postMessage('go movetime 800'); // Think for 800ms
    });
}

export function ChessPage() {
    const [game, setGame] = useState(new Chess());
    const [gameState, setGameState] = useState<GameState>({
        fen: game.fen(),
        history: [],
        status: 'playing',
        winner: null,
    });
    const [mode, setMode] = useState<GameMode>('local');
    const [theme, setTheme] = useState<ThemeKey>('classic');
    const [scores, setScores] = useState({ white: 0, black: 0, draws: 0 });
    const [isThinking, setIsThinking] = useState(false);
    const [stockfishReady, setStockfishReady] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

    // Update window width on resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Board size (50% larger than Tic Tac Toe)
    const boardWidth = windowWidth < 768
        ? Math.min(windowWidth - 32, 432)
        : 576;

    const gameRef = useRef(game);
    const historyRef = useRef<HTMLDivElement>(null);

    // Keep ref in sync
    useEffect(() => {
        gameRef.current = game;
    }, [game]);

    // Auto-scroll to latest move
    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [gameState.history.length]);

    // Initialize Stockfish when CPU mode is selected
    useEffect(() => {
        if (mode === 'cpu' && !stockfishWorker) {
            initStockfish()
                .then((worker) => {
                    stockfishWorker = worker;
                    setStockfishReady(true);
                })
                .catch(() => {
                    console.warn('Stockfish not available, falling back to random moves');
                    setStockfishReady(false);
                });
        }
    }, [mode]);

    // Make CPU move
    const makeCPUMove = useCallback(async () => {
        if (gameState.status !== 'playing') return;

        setIsThinking(true);

        // Add a small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const currentGame = gameRef.current;
        let moveStr: string;

        if (stockfishWorker && stockfishReady) {
            moveStr = await getBestMove(stockfishWorker, currentGame.fen());
        } else {
            // Fallback: random legal move
            const moves = currentGame.moves({ verbose: true });
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            moveStr = randomMove.from + randomMove.to + (randomMove.promotion || '');
        }

        try {
            const from = moveStr.slice(0, 2) as Square;
            const to = moveStr.slice(2, 4) as Square;
            const promotion = moveStr.length > 4 ? moveStr[4] : undefined;

            const move = currentGame.move({ from, to, promotion });

            if (move) {
                setGame(new Chess(currentGame.fen()));
                updateGameState(currentGame, move);
            }
        } catch (error) {
            console.error('CPU move error:', error);
        }

        setIsThinking(false);
    }, [gameState.status, stockfishReady]);

    // Trigger CPU move when it's black's turn in CPU mode
    useEffect(() => {
        if (mode === 'cpu' && game.turn() === 'b' && gameState.status === 'playing' && !isThinking) {
            makeCPUMove();
        }
    }, [mode, game, gameState.status, isThinking, makeCPUMove]);

    function updateGameState(g: Chess, newMove?: Move) {
        let status: GameStatus = 'playing';
        let winner: GameState['winner'] = null;

        if (g.isCheckmate()) {
            status = 'checkmate';
            winner = g.turn() === 'w' ? 'black' : 'white';
            setScores(s => ({
                ...s,
                [winner as 'white' | 'black']: s[winner as 'white' | 'black'] + 1
            }));
        } else if (g.isStalemate()) {
            status = 'stalemate';
            winner = 'draw';
            setScores(s => ({ ...s, draws: s.draws + 1 }));
        } else if (g.isDraw()) {
            status = 'draw';
            winner = 'draw';
            setScores(s => ({ ...s, draws: s.draws + 1 }));
        }

        // Append the new move to history if provided
        setGameState(prev => ({
            fen: g.fen(),
            history: newMove ? [...prev.history, newMove] : prev.history,
            status,
            winner,
        }));

        if (status !== 'playing') {
            setShowAnalysis(true);
        }
    }

    function onDrop({ sourceSquare, targetSquare, piece }: { sourceSquare: string; targetSquare: string | null; piece: { pieceType: string } }): boolean {
        // Don't allow moves during CPU's turn
        if (mode === 'cpu' && game.turn() === 'b') return false;
        if (gameState.status !== 'playing') return false;
        if (!targetSquare) return false;

        try {
            const move = game.move({
                from: sourceSquare as Square,
                to: targetSquare as Square,
                promotion: piece.pieceType[1]?.toLowerCase() ?? 'q',
            });

            if (move === null) return false;

            setGame(new Chess(game.fen()));
            updateGameState(game, move);
            return true;
        } catch {
            return false;
        }
    }

    function resetGame() {
        const newGame = new Chess();
        setGame(newGame);
        setGameState({
            fen: newGame.fen(),
            history: [],
            status: 'playing',
            winner: null,
        });
        setShowAnalysis(false);
    }

    function resetScores() {
        setScores({ white: 0, black: 0, draws: 0 });
        resetGame();
    }

    const currentTheme = BOARD_THEMES[theme];

    const statusText = (() => {
        if (isThinking) return 'CPU is thinking...';
        if (gameState.status === 'checkmate') return `Checkmate! ${gameState.winner === 'white' ? 'White' : 'Black'} wins!`;
        if (gameState.status === 'stalemate') return 'Stalemate! Draw.';
        if (gameState.status === 'draw') return 'Draw!';
        if (game.isCheck()) return `${game.turn() === 'w' ? 'White' : 'Black'} is in check!`;
        return `${game.turn() === 'w' ? 'White' : 'Black'}'s turn`;
    })();

    return (
        <div className="min-h-screen bg-[#05050a] flex flex-col relative overflow-hidden">
            {/* Header */}
            <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-white/5 bg-[#05050a]/80 backdrop-blur-md z-20"
            >
                <Link
                    to="/"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Exit</span>
                </Link>

                <h1 className="text-sm md:text-lg font-black text-white uppercase tracking-tight">
                    ♟️ Neon Chess
                </h1>

                <button
                    onClick={resetScores}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all"
                >
                    Reset All
                </button>
            </motion.header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 p-4 md:p-8">

                {/* Left Panel - Scoreboard */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-full lg:w-64 flex lg:flex-col gap-4"
                >
                    {/* Scores */}
                    <div className="flex-1 lg:flex-none grid grid-cols-3 lg:grid-cols-1 gap-3">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">White</span>
                            <span className="text-xl font-black text-white">{scores.white}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Draws</span>
                            <span className="text-xl font-black text-white">{scores.draws}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-center">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{mode === 'cpu' ? 'CPU' : 'Black'}</span>
                            <span className="text-xl font-black text-white">{scores.black}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Center - Board */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    {/* Status */}
                    <div className={`text-sm md:text-base font-bold uppercase tracking-wider ${gameState.status === 'checkmate' ? 'text-emerald-400' :
                        gameState.status !== 'playing' ? 'text-amber-400' :
                            game.isCheck() ? 'text-red-400' :
                                'text-gray-400'
                        }`}>
                        {statusText}
                    </div>

                    {/* Board */}
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                            boxShadow: currentTheme.glow || '0 20px 50px rgba(0,0,0,0.5)',
                            border: currentTheme.border || '1px solid rgba(255,255,255,0.1)',
                        }}
                    >
                        <Chessboard
                            options={{
                                position: gameState.fen,
                                boardOrientation: "white",
                                onPieceDrop: onDrop,
                                boardStyle: {
                                    borderRadius: '12px',
                                    width: boardWidth,
                                },
                                lightSquareStyle: {
                                    backgroundColor: currentTheme.lightSquare,
                                },
                                darkSquareStyle: {
                                    backgroundColor: currentTheme.darkSquare,
                                },
                                allowDragging: gameState.status === 'playing' && !(mode === 'cpu' && game.turn() === 'b'),
                            }}
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {/* Mode Switch */}
                        <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10">
                            <button
                                onClick={() => { setMode('local'); resetGame(); }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'local'
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                vs Local
                            </button>
                            <button
                                onClick={() => { setMode('cpu'); resetGame(); }}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'cpu'
                                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20'
                                    : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                vs CPU
                            </button>
                        </div>

                        {/* Theme Switcher */}
                        <div className="flex items-center gap-2">
                            {(Object.keys(BOARD_THEMES) as ThemeKey[]).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setTheme(key)}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${theme === key
                                        ? 'bg-white/10 text-white border border-white/20'
                                        : 'bg-white/5 text-gray-500 border border-white/5 hover:text-gray-300'
                                        }`}
                                >
                                    {BOARD_THEMES[key].name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* New Game Button */}
                    {gameState.status !== 'playing' && (
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            onClick={resetGame}
                            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                        >
                            New Game
                        </motion.button>
                    )}
                </motion.div>

                {/* Right Panel - Move History */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-full lg:w-72 rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
                >
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Move History</h3>
                    </div>

                    <div ref={historyRef} className="max-h-[320px] overflow-y-auto">
                        {gameState.history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <span className="text-3xl mb-2">♟️</span>
                                <p className="text-gray-600 text-xs">No moves yet</p>
                                <p className="text-gray-700 text-[10px] mt-1">Make the first move!</p>
                            </div>
                        ) : (
                            <table className="w-full text-xs font-mono">
                                <thead className="sticky top-0 bg-[#0a0a14]">
                                    <tr className="text-gray-500 text-[10px] uppercase tracking-wider">
                                        <th className="py-2 px-3 text-left w-10">#</th>
                                        <th className="py-2 px-3 text-left">White</th>
                                        <th className="py-2 px-3 text-left">Black</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: Math.ceil(gameState.history.length / 2) }).map((_, i) => {
                                        const whiteMove = gameState.history[i * 2];
                                        const blackMove = gameState.history[i * 2 + 1];
                                        const isLatest = i === Math.floor((gameState.history.length - 1) / 2);

                                        return (
                                            <tr
                                                key={i}
                                                className={`
                                                    border-b border-white/5 transition-colors
                                                    ${isLatest ? 'bg-indigo-500/10' : 'hover:bg-white/5'}
                                                `}
                                            >
                                                <td className="py-3 px-3 text-gray-600">{i + 1}.</td>
                                                <td className={`py-3 px-3 ${whiteMove ? 'text-white' : 'text-gray-700'}`}>
                                                    {whiteMove?.san || '-'}
                                                </td>
                                                <td className={`py-3 px-3 ${blackMove ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {blackMove?.san || (gameState.history.length > i * 2 + 1 ? '-' : '...')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {gameState.history.length > 0 && (
                        <div className="px-4 py-2 border-t border-white/10 bg-white/5 flex justify-between items-center">
                            <span className="text-[10px] text-gray-500">{gameState.history.length} moves</span>
                            <span className="text-[10px] text-gray-600">
                                {game.turn() === 'w' ? "White's turn" : "Black's turn"}
                            </span>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Analysis Modal */}
            <AnimatePresence>
                {showAnalysis && gameState.status !== 'playing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAnalysis(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a14] rounded-3xl border border-white/10 p-6 max-w-md w-full"
                        >
                            <h2 className="text-xl font-black text-white mb-4 text-center">
                                {gameState.winner === 'draw' ? "It's a Draw!" : `${gameState.winner === 'white' ? 'White' : 'Black'} Wins!`}
                            </h2>

                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-3 bg-white/5 rounded-xl">
                                    <span className="block text-2xl font-black text-white">{gameState.history.length}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Moves</span>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-xl">
                                    <span className="block text-2xl font-black text-white">
                                        {gameState.history.filter(m => m.captured).length}
                                    </span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Captures</span>
                                </div>
                                <div className="text-center p-3 bg-white/5 rounded-xl">
                                    <span className="block text-2xl font-black text-white">
                                        {gameState.history.filter(m => m.san.includes('+')).length}
                                    </span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Checks</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAnalysis(false)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => { resetGame(); setShowAnalysis(false); }}
                                    className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest transition-all"
                                >
                                    Play Again
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
