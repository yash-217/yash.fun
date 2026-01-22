import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

type SquareValue = 'X' | 'O' | null;

function calculateWinner(squares: SquareValue[]): { winner: SquareValue; line: number[] } | null {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], line: [a, b, c] };
        }
    }
    return null;
}

function findBestMove(squares: SquareValue[]): number {
    // Minimax algorithm to find the best move for 'O'
    function minimax(board: SquareValue[], depth: number, isMaximizing: boolean): number {
        const result = calculateWinner(board);
        if (result?.winner === 'O') return 10 - depth;
        if (result?.winner === 'X') return depth - 10;
        if (board.every(s => s !== null)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = 'O';
                    const score = minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = 'X';
                    const score = minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
            const tempBoard = [...squares];
            tempBoard[i] = 'O';
            const score = minimax(tempBoard, 0, false);
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

export function TicTacToePage() {
    const [board, setBoard] = useState<SquareValue[]>(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    const [isCPUMode, setIsCPUMode] = useState(false);
    const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });
    const [recorded, setRecorded] = useState(false);

    const result = calculateWinner(board);
    const winner = result?.winner;
    const winningLine = result?.line || [];
    const isDraw = !winner && board.every(square => square !== null);

    // Record score when game ends
    if ((winner || isDraw) && !recorded) {
        if (winner === 'X') setScores(s => ({ ...s, X: s.X + 1 }));
        else if (winner === 'O') setScores(s => ({ ...s, O: s.O + 1 }));
        else if (isDraw) setScores(s => ({ ...s, Draws: s.Draws + 1 }));
        setRecorded(true);
    }

    const handleClick = (index: number) => {
        if (board[index] || winner || (isCPUMode && !xIsNext)) return;
        makeMove(index);
    };

    const makeMove = (index: number) => {
        const newBoard = [...board];
        newBoard[index] = xIsNext ? 'X' : 'O';
        setBoard(newBoard);
        setXIsNext(!xIsNext);
    };

    // CPU Move Logic
    useEffect(() => {
        if (isCPUMode && !xIsNext && !winner && !isDraw) {
            const timer = setTimeout(() => {
                const move = findBestMove(board);
                if (move !== -1) makeMove(move);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [xIsNext, isCPUMode, board, winner, isDraw]);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
        setRecorded(false);
    };

    const resetScores = () => {
        setScores({ X: 0, O: 0, Draws: 0 });
        resetGame();
    };

    let status: string;
    if (winner) {
        status = isCPUMode && winner === 'O' ? "CPU Wins!" : `Winner: ${winner}`;
    } else if (isDraw) {
        status = "It's a Draw!";
    } else {
        status = isCPUMode && !xIsNext ? "CPU is thinking..." : `Turn: ${xIsNext ? 'X' : 'O'}`;
    }

    return (
        <div className="min-h-screen bg-[#05050a] flex flex-col relative overflow-hidden">
            {/* Header */}
            <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-white/5 bg-[#05050a]/80 backdrop-blur-md z-20"
            >
                <Link
                    to="/"
                    className="flex items-center gap-2 md:gap-3 text-gray-400 hover:text-white transition-colors group"
                >
                    <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest hidden sm:inline">Exit</span>
                </Link>

                <div className="flex flex-col items-center">
                    <h1 className="text-sm md:text-xl font-black text-white uppercase tracking-tight italic">
                        Neon Tic-Tac-Toe
                    </h1>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={resetScores}
                        className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all"
                    >
                        Reset All
                    </button>
                </div>
            </motion.header>

            {/* Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-6 p-4 md:p-8 relative z-10">

                {/* Scoreboard */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="grid grid-cols-3 gap-4 w-full"
                >
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Player (X)</span>
                        <span className="text-2xl font-black text-white">{scores.X}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Draws</span>
                        <span className="text-2xl font-black text-white">{scores.Draws}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 rounded-2xl bg-pink-500/5 border border-pink-500/10">
                        <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-1">{isCPUMode ? 'CPU (O)' : 'Player (O)'}</span>
                        <span className="text-2xl font-black text-white">{scores.O}</span>
                    </div>
                </motion.div>

                {/* Status */}
                <motion.div
                    key={status}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`
                        text-xl md:text-2xl font-black uppercase tracking-tight h-8
                        ${winner === 'X' ? 'text-indigo-400' : winner === 'O' ? 'text-pink-400' : isDraw ? 'text-amber-400' : 'text-white'}
                    `}
                >
                    {status}
                </motion.div>

                {/* Board Container */}
                <div className="relative group">
                    {/* Decorative glow behind board */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/10 via-pink-500/5 to-indigo-500/10 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative grid grid-cols-3 p-1 rounded-3xl bg-[#0a0a14] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {board.map((square, index) => (
                            <Square
                                key={index}
                                index={index}
                                value={square}
                                onClick={() => handleClick(index)}
                                isWinning={winningLine.includes(index)}
                                disabled={!!winner || !!square || (isCPUMode && !xIsNext)}
                            />
                        ))}
                    </motion.div>
                </div>

                {/* Game Over Actions */}
                <div className="h-16 flex items-center justify-center">
                    {(winner || isDraw) && (
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            onClick={resetGame}
                            className="px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                        >
                            Next Round
                        </motion.button>
                    )}
                </div>

                {/* CPU Mode Switch */}
                <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button
                        onClick={() => {
                            if (isCPUMode) {
                                setIsCPUMode(false);
                                resetScores();
                            }
                        }}
                        className={`
                            px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                            ${!isCPUMode
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-gray-500 hover:text-gray-300'
                            }
                        `}
                    >
                        vs Local
                    </button>
                    <button
                        onClick={() => {
                            if (!isCPUMode) {
                                setIsCPUMode(true);
                                resetScores();
                            }
                        }}
                        className={`
                            px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                            ${isCPUMode
                                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20'
                                : 'text-gray-500 hover:text-gray-300'
                            }
                        `}
                    >
                        vs CPU
                    </button>
                </div>

                {/* Game Progress (Successive Games) */}
                <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Game Session</span>
                    <div className="flex gap-1.5">
                        {[...Array(5)].map((_, i) => {
                            const gameNum = scores.X + scores.O + scores.Draws;
                            const isActive = i === gameNum % 5;
                            const isPast = i < gameNum % 5 || (gameNum > 0 && gameNum % 5 === 0 && i < 5);

                            return (
                                <div
                                    key={i}
                                    className={`
                                        w-8 h-1 rounded-full transition-all duration-500
                                        ${isPast ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : isActive ? 'bg-white/20 animate-pulse' : 'bg-white/5'}
                                    `}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Re-using the Square component from before but slightly adjusted for the new layout
function Square({
    value,
    onClick,
    isWinning,
    disabled,
    index
}: {
    value: SquareValue;
    onClick: () => void;
    isWinning: boolean;
    disabled: boolean;
    index: number;
}) {
    const borderClasses = `
        ${index < 6 ? 'border-b border-white/5' : ''}
        ${index % 3 !== 2 ? 'border-r border-white/5' : ''}
    `;

    const colors = {
        X: 'text-indigo-400',
        O: 'text-pink-400'
    };

    return (
        <motion.button
            whileHover={!disabled && !value ? { backgroundColor: 'rgba(255, 255, 255, 0.02)' } : {}}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            disabled={disabled}
            className={`
                w-24 h-24 md:w-32 md:h-32 text-5xl md:text-6xl font-black
                flex items-center justify-center relative transition-colors duration-300
                ${borderClasses}
                ${isWinning ? 'bg-emerald-500/10' : ''}
                ${value ? colors[value] : ''}
                ${!value && !disabled ? 'cursor-pointer' : 'cursor-default'}
            `}
        >
            {isWinning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-emerald-500/5 shadow-[inset_0_0_25px_rgba(16,185,129,0.15)]"
                />
            )}
            {value && (
                <motion.span
                    initial={{ scale: 0, rotate: -45, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    className="relative z-10 drop-shadow-[0_0_15px_currentColor]"
                >
                    {value}
                </motion.span>
            )}
        </motion.button>
    );
}
