import React, { useState, useEffect } from 'react';
import Board from './Board';
import { generateBoard } from '../utils/dailyGenerator';
import ShareModal from '../components/ShareModal';

export default function GameManager() {
    const [board, setBoard] = useState([]);
    const [status, setStatus] = useState('playing'); // 'playing', 'won', 'lost'
    const [mineCount, setMineCount] = useState(5);
    const [flagsUsed, setFlagsUsed] = useState(0);
    const [dateStr, setDateStr] = useState('');
    const [moves, setMoves] = useState(0);
    const [actionLog, setActionLog] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFlagMode, setIsFlagMode] = useState(false);

    // Initialize game on mount or new day
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        setDateStr(today);

        const storedState = localStorage.getItem(`cleansweep-${today}`);
        if (storedState) {
            const parsed = JSON.parse(storedState);
            // Verify it's a 5x5 board to flush old 9x9 cache
            if (parsed.board && parsed.board.length === 5) {
                setBoard(parsed.board);
                setStatus(parsed.status);
                setFlagsUsed(parsed.flagsUsed);
                setMoves(parsed.moves);
                setActionLog(parsed.actionLog || []);
                return;
            }
        }
        // Generate new board
        setBoard(generateBoard(today, 5, 5, 5));
    }, []);

    // Save state to LocalStorage whenever it changes
    useEffect(() => {
        if (dateStr && board.length > 0) {
            localStorage.setItem(`cleansweep-${dateStr}`, JSON.stringify({
                board,
                status,
                flagsUsed,
                moves,
                actionLog
            }));
        }
    }, [board, status, flagsUsed, moves, actionLog, dateStr]);

    // Check for win condition and modal popups
    useEffect(() => {
        if (status === 'won' || status === 'lost') {
            setIsModalOpen(true); // Open modal whenever game ends or if reloaded in end state
        }
    }, [status]);

    useEffect(() => {
        if (status !== 'playing' || board.length === 0) return;

        let allNonMinesRevealed = true;
        for (let r = 0; r < board.length; r++) {
            for (let c = 0; c < board[0].length; c++) {
                if (!board[r][c].isMine && !board[r][c].isRevealed) {
                    allNonMinesRevealed = false;
                    break;
                }
            }
        }

        if (allNonMinesRevealed) {
            setStatus('won');
            setActionLog(prev => [...prev, '🧹']);
            // Flag all remaining mines
            const newBoard = [...board];
            for (let r = 0; r < newBoard.length; r++) {
                for (let c = 0; c < newBoard[0].length; c++) {
                    if (newBoard[r][c].isMine) {
                        newBoard[r][c].isFlagged = true;
                    }
                }
            }
            setBoard(newBoard);
            updateStreak();
        }
    }, [board, status]);

    const updateStreak = () => {
        const currentStreak = parseInt(localStorage.getItem('streak') || '0', 10);
        localStorage.setItem('streak', (currentStreak + 1).toString());
    };

    const handleReset = () => {
        // Clear this specific day's save data
        localStorage.removeItem(`cleansweep-${dateStr}`);

        // Reset states
        setStatus('playing');
        setFlagsUsed(0);
        setMoves(0);
        setActionLog([]);
        setBoard(generateBoard(dateStr, 5, 5, 5));
    };

    const handleCellClick = (r, c) => {
        if (status !== 'playing' || board[r][c].isRevealed) return;

        // If in flag mode, or the cell is already flagged, route to right-click logic
        if (isFlagMode || board[r][c].isFlagged) {
            handleCellRightClick(r, c);
            return;
        }

        setMoves(m => m + 1);
        const newBoard = [...board];

        if (newBoard[r][c].isMine) {
            // Game Over
            newBoard[r][c].isRevealed = true;
            setActionLog(prev => [...prev, '💣']);
            setStatus('lost');
            localStorage.setItem('streak', '0'); // Reset streak on loss
        } else {
            // Reveal single cell or flood fill
            setActionLog(prev => [...prev, '🟩']);
            floodFill(newBoard, r, c);
        }

        setBoard(newBoard);
    };

    const handleCellRightClick = (r, c) => {
        if (status !== 'playing' || board[r][c].isRevealed) return;

        const newBoard = [...board];
        const newFlagState = !newBoard[r][c].isFlagged;
        newBoard[r][c].isFlagged = newFlagState;

        setFlagsUsed(prev => newFlagState ? prev + 1 : prev - 1);
        if (newFlagState) setActionLog(prev => [...prev, '🚩']);
        setBoard(newBoard);
    };

    const floodFill = (b, r, c) => {
        const stack = [[r, c]];
        const rows = b.length;
        const cols = b[0].length;

        while (stack.length > 0) {
            const [currR, currC] = stack.pop();

            if (
                currR < 0 || currR >= rows ||
                currC < 0 || currC >= cols ||
                b[currR][currC].isRevealed ||
                b[currR][currC].isFlagged
            ) {
                continue;
            }

            b[currR][currC].isRevealed = true;

            // If cell has 0 adjacent mines, add neighbors to stack
            if (b[currR][currC].adjacentMines === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr !== 0 || dc !== 0) {
                            stack.push([currR + dr, currC + dc]);
                        }
                    }
                }
            }
        }
    };

    return (
        <div className="game-manager">
            <div className="header">
                <div className="stat-box">
                    <span className="icon">💣</span> {Math.max(0, mineCount - flagsUsed)}
                </div>
                <h1>CleanSweep</h1>
                <div className="stat-box">
                    <span className="icon">🔥</span> {localStorage.getItem('streak') || 0}
                </div>
            </div>

            <div className={`board-container ${status}`}>
                <Board
                    board={board}
                    onCellClick={handleCellClick}
                    onCellRightClick={handleCellRightClick}
                    status={status}
                />
            </div>

            <div className="controls">
                <button
                    className={`flag-toggle ${isFlagMode ? 'active' : ''}`}
                    onClick={() => setIsFlagMode(!isFlagMode)}
                    title={isFlagMode ? "Flag Mode On" : "Reveal Mode On"}
                    aria-label="Toggle flag mode"
                >
                    🚩
                </button>
            </div>

            {isModalOpen && (status === 'won' || status === 'lost') && (
                <ShareModal
                    status={status}
                    actionLog={actionLog}
                    dateStr={dateStr}
                    moves={moves}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {!isModalOpen && (status === 'won' || status === 'lost') && (
                <button className="secondary-btn" onClick={() => setIsModalOpen(true)} style={{ marginTop: '1rem' }}>
                    Show Results
                </button>
            )}
        </div>
    );
}
