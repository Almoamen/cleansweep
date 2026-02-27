import React, { useState } from 'react';

export default function ShareModal({ status, actionLog, dateStr, moves, onClose }) {
    const [copied, setCopied] = useState(false);

    // Generate Emoji string
    const generateShareText = () => {
        let text = `CleanSweep - ${dateStr}\n`;
        text += `Result: ${status === 'won' ? 'Won 🏆' : 'Lost 💀'} in ${moves} moves\n\n`;

        const chunkedLog = [];
        for (let i = 0; i < actionLog.length; i += 5) {
            chunkedLog.push(actionLog.slice(i, i + 5).join(''));
        }
        text += chunkedLog.join('\n');

        text += `\n\nPlay at: https://yoursite.com`; // Placeholder URL
        return text;
    };

    const handleShare = () => {
        const text = generateShareText();
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy', err);
            // Fallback: alert or simple textarea copy
            alert("Clipboard API not supported. Copy this:\n\n" + text);
        });
    };

    return (
        <div className="share-modal-overlay">
            <div className={`share-modal ${status}`}>
                <h2>{status === 'won' ? 'Clean Sweep! 🧹' : 'Game Over'}</h2>
                <p>Come back tomorrow for a new puzzle.</p>

                <div className="emoji-preview">
                    <pre>{generateShareText().split('\n\n')[1]}</pre>
                </div>

                <div className="modal-actions">
                    <button className="share-btn" onClick={handleShare}>
                        {copied ? 'Copied to Clipboard!' : 'Share Result 🔗'}
                    </button>
                    <button className="secondary-btn" onClick={onClose}>
                        See Board 👁️
                    </button>
                </div>
            </div>
        </div>
    );
}
