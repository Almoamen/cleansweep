import React from 'react';

export default function Cell({ cell, onClick, onContextMenu, status }) {
    const { isRevealed, isMine, isFlagged, adjacentMines } = cell;

    // Determine classes
    let classes = 'cell';
    if (isRevealed) classes += ' revealed';
    if (isFlagged && !isRevealed) classes += ' flagged';

    let content = '';
    if (isRevealed) {
        if (isMine) {
            content = '💣';
            classes += ' mine';
        } else if (adjacentMines > 0) {
            content = adjacentMines;
            classes += ` mines-${adjacentMines}`;
        }
    } else if (isFlagged) {
        content = '🚩';
    } else if (status === 'lost' && isMine) { // Game over reveal all mines not flagged
        content = '💣';
        classes += ' revealed mine';
    } else if (status === 'lost' && isFlagged && !isMine) {
        content = '❌'; // Wrong flag
        classes += ' revealed wrong-flag'
    }

    const handleContextMenu = (e) => {
        e.preventDefault();
        onContextMenu();
    };

    return (
        <div
            className={classes}
            onClick={onClick}
            onContextMenu={handleContextMenu}
        >
            {content}
        </div>
    );
}
