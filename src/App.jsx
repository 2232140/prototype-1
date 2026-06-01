import React, { useState, useEffect } from 'react';
import Home      from './components/Home';
import CheckIn   from './components/CheckIn';
import History   from './components/History';
import Settings  from './components/Settings';
import BottomNav from './components/BottomNav';
import Login     from './components/Login';
import { supabase } from './utils/supabase';

export default function App() {
  const [screen, setScreen]   = useState('home');
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="app" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <span className="ai-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app">
        <main className="main"><Login /></main>
      </div>
    );
  }

  const render = () => {
    switch (screen) {
      case 'home':     return <Home     onNavigate={setScreen} />;
      case 'checkin':  return <CheckIn  onNavigate={setScreen} />;
      case 'history':  return <History />;
      case 'settings': return <Settings user={session.user} />;
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
