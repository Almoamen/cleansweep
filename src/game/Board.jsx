import React from 'react';
import Cell from './Cell';

export default function Board({ board, onCellClick, onCellRightClick, status }) {
    if (!board || board.length === 0) return null;

    return (
        <div className="board">
            {board.map((row, rIndex) => (
                <div key={rIndex} className="row">
                    {row.map((cell, cIndex) => (
                        <Cell
                            key={`${rIndex}-${cIndex}`}
                            cell={cell}
                            status={status}
                            onClick={() => onCellClick(rIndex, cIndex)}
                            onContextMenu={() => onCellRightClick(rIndex, cIndex)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
