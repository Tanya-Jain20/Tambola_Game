
import React from 'react';
import './HelpModal.css';

function HelpModal({ onClose }) {
    return (
        <div className="help-modal-overlay" onClick={onClose}>
            <div className="help-modal-content" onClick={e => e.stopPropagation()}>
                <button className="help-modal-close-btn" onClick={onClose}>×</button>

                <h2 className="help-title">🎲 How to Play Tambola</h2>

                <div className="help-section">
                    <h3>🏆 Winning Patterns</h3>
                    <ul className="winning-list">
                        <li><strong>Early 5:</strong> The first player to mark any 5 numbers.</li>
                        <li><strong>First Line:</strong> All numbers in the first row.</li>
                        <li><strong>Second Line:</strong> All numbers in the second row.</li>
                        <li><strong>Third Line:</strong> All numbers in the third row.</li>
                        <li><strong>Corners:</strong> The first and last numbers of the first and third rows (4 numbers).</li>
                        <li><strong>Full House:</strong> All 15 numbers on the ticket (Two winners allowed!).</li>
                    </ul>
                </div>

                <div className="help-section">
                    <h3>📝 HOW TO START THE GAME</h3>
                    <ol className="rules-list">
                        <li><strong>Starting:</strong> Open the <strong>"👥 Players"</strong> button in the top header and click <strong>"Mark Ready"</strong>. The host can start once everyone is ready.</li>
                        <li>Any player can become the <strong>Host</strong> if there isn't one already from the <strong>"👥 Players"</strong> list.</li>
                        <li>Each player gets a ticket with 15 random numbers.</li>
                        <li>The host (or auto-caller) calls out numbers one by one.</li>
                        <li>If a called number is on your ticket, click it to mark it.</li>
                        <li>When you complete a winning pattern, click the corresponding <strong>Claim</strong> button immediately!</li>
                        <li><strong>Winners:</strong> When someone wins, the game pauses for a celebration! It will resume automatically after a short countdown.</li>
                    </ol>
                </div>

                <div className="help-footer">
                    <button className="start-btn" onClick={onClose}>
                        LETS GO! 🚀
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HelpModal;
