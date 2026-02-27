import React from 'react';
import GameManager from './game/GameManager';

function App() {
  return (
    <div className="app-container">
      <main className="main-content">
        <GameManager />
      </main>
      <footer>
        <p>A new puzzle every day. Built with Vite + React.</p>
      </footer>
    </div>
  );
}

export default App;
