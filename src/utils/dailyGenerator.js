/**
 * Seeded Pseudo-Random Number Generator
 * Returns a float between 0 (inclusive) and 1 (exclusive).
 * Uses a simple Mulberry32 algorithm.
 */
function mulberry32(a) {
    return function () {
        var t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Hash a string (like "2026-02-27") into a 32-bit integer seed.
 */
function xmur3(str) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}

/**
 * Initializes a PRNG based on the current date string (YYYY-MM-DD).
 */
export function getDailyPRNG(dateStr) {
    const seed = xmur3(dateStr)();
    return mulberry32(seed);
}

/**
 * Generates the daily Minesweeper board.
 * @param {string} dateStr - Date string, e.g., '2026-02-27'
 * @param {number} rows - Number of rows (default 9)
 * @param {number} cols - Number of columns (default 9)
 * @param {number} totalMines - Number of mines to place (default 10)
 */
export function generateBoard(dateStr, rows = 9, cols = 9, totalMines = 10) {
    const random = getDailyPRNG(dateStr);

    // Initialize empty board
    const board = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => ({
            row: r,
            col: c,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
        }))
    );

    // Place mines deterministically
    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
        const r = Math.floor(random() * rows);
        const c = Math.floor(random() * cols);

        if (!board[r][c].isMine) {
            board[r][c].isMine = true;
            minesPlaced++;
        }
    }

    // Calculate adjacent mines for all non-mine cells
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!board[r][c].isMine) {
                let count = 0;
                // Check all 8 neighbors
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                            if (board[nr][nc].isMine) count++;
                        }
                    }
                }
                board[r][c].adjacentMines = count;
            }
        }
    }

    return board;
}
