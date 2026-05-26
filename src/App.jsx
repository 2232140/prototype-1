import React, { useState } from 'react';
import Home     from './components/Home';
import CheckIn  from './components/CheckIn';
import History  from './components/History';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';

export default function App() {
  const [screen, setScreen] = useState('home');

  const render = () => {
    switch (screen) {
      case 'home':     return <Home     onNavigate={setScreen} />;
      case 'checkin':  return <CheckIn  onNavigate={setScreen} />;
      case 'history':  return <History />;
      case 'settings': return <Settings />;
      default:         return <Home     onNavigate={setScreen} />;
    }
  };

  return (
    <div className="app">
      <main className="main">{render()}</main>
      <BottomNav current={screen} onChange={setScreen} />
    </div>
  );
}
