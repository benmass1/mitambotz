
import React, { useState, useEffect } from 'react';
import { AppTab, Machine } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DiagnosisTool from './components/DiagnosisTool';
import MachineEditor from './components/MachineEditor';
import VideoGenerator from './components/VideoGenerator';
import SearchTool from './components/SearchTool';
import MachinesList from './components/MachinesList';
import LiveChat from './components/LiveChat';
import SignUpModal from './components/SignUpModal';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';
import AuthScreen from './components/AuthScreen';

// Mitambo ya mfano imeondolewa ili kuanza na list tupu
const DEFAULT_MACHINES: Machine[] = [];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isShareMode, setIsShareMode] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Global Machines State
  const [machines, setMachines] = useState<Machine[]>(() => {
    const saved = localStorage.getItem('dr_mitambo_fleet');
    return saved ? JSON.parse(saved) : DEFAULT_MACHINES;
  });

  useEffect(() => {
    // Check for logged in user
    const savedUser = localStorage.getItem('dr_mitambo_user');
    console.log('Saved user from localStorage:', savedUser);
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Log Visit
    fetch('/backend/log-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
      })
    }).catch(err => console.error('Failed to log visit', err));
  }, []);

  useEffect(() => {
    localStorage.setItem('dr_mitambo_fleet', JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('share') === 'true') {
      setIsShareMode(true);
    }
    checkApiKey();
  }, []);

  useEffect(() => {
    // Check server health
    fetch('/backend/health')
      .then(res => res.json())
      .then(data => console.log('Server Health:', data))
      .catch(err => console.error('Server Health Check Failed:', err));
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    } else {
      setHasApiKey(true);
    }
  };

  const handleOpenKeySelection = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const isAdmin = currentUser?.role === 'Manager';

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD: 
        return <Dashboard onNavigate={setActiveTab} machines={machines} userName={currentUser?.name} />;
      case AppTab.MACHINES: 
        return <MachinesList onNavigate={setActiveTab} machines={machines} setMachines={setMachines} />;
      case AppTab.DIAGNOSIS: return <DiagnosisTool />;
      case AppTab.EDITOR: return <MachineEditor />;
      case AppTab.VISUALIZER: return <VideoGenerator />;
      case AppTab.SEARCH: return <SearchTool />;
      case AppTab.LIVE: return <LiveChat />;
      case AppTab.ADMIN: return isAdmin ? <AdminPanel /> : <Dashboard onNavigate={setActiveTab} machines={machines} userName={currentUser?.name} />;
      default: return <Dashboard onNavigate={setActiveTab} machines={machines} userName={currentUser?.name} />;
    }
  };

  if (!hasApiKey && (activeTab === AppTab.VISUALIZER || activeTab === AppTab.EDITOR || activeTab === AppTab.LIVE)) {
    return (
      <div className="flex items-center justify-center h-screen bg-black p-8 text-center">
        <div className="max-w-md space-y-6">
          <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h1 className="text-3xl font-black">API Key Required</h1>
          <p className="text-gray-400">High-fidelity tools like Veo Video and Live Audio Chat require a paid Gemini API key.</p>
          <p className="text-xs text-gray-500">Ensure your project has billing enabled at <a href="https://ai.google.dev/gemini-api/docs/billing" className="underline text-yellow-500">ai.google.dev/billing</a>.</p>
          <button 
            onClick={handleOpenKeySelection}
            className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold hover:bg-yellow-400 transition-colors"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <AuthScreen 
          onLoginClick={() => setIsLoginOpen(true)}
          onRegisterClick={() => setIsSignUpOpen(true)}
        />
        <SignUpModal 
          isOpen={isSignUpOpen} 
          onClose={() => setIsSignUpOpen(false)} 
          onSuccess={(user) => setCurrentUser(user)}
        />
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
          onSuccess={(user) => setCurrentUser(user)}
          onSwitchToRegister={() => {
            setIsLoginOpen(false);
            setIsSignUpOpen(true);
          }}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
        isShareMode={isShareMode}
        isAdmin={isAdmin}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-lg border-b border-white/5 p-4 flex items-center justify-between lg:px-8">
          <button className="lg:hidden text-yellow-500" onClick={() => setIsMenuOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"/></svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500 font-black italic tracking-tighter text-xl">DR MITAMBO TZ</span>
            <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-500/20 uppercase tracking-tighter">AI-Fundi</span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin);
                // Simple feedback
                const btn = document.getElementById('share-btn');
                if (btn) {
                  const originalText = btn.innerText;
                  btn.innerText = 'COPIED!';
                  setTimeout(() => btn.innerText = originalText, 2000);
                }
              }}
              id="share-btn"
              className="hidden md:flex bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors items-center space-x-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              <span>SHARE LINK</span>
            </button>

            {!currentUser ? (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsLoginOpen(true)}
                  className="hidden md:flex bg-neutral-800 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-neutral-700 transition-colors"
                >
                  INGIA
                </button>
                <button 
                  onClick={() => setIsSignUpOpen(true)}
                  className="bg-yellow-500 text-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-yellow-400 transition-colors"
                >
                  JISAJILI
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-bold">{currentUser.name}</span>
                  <span className="text-[10px] text-green-500 uppercase font-black">{currentUser.role}</span>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('dr_mitambo_user');
                    setCurrentUser(null);
                  }}
                  className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest"
                >
                  LOGOUT
                </button>
              </div>
            )}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-orange-500 border-2 border-white/10 flex items-center justify-center text-black font-black">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'TR'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {renderContent()}
          </div>
        </div>
        
        <SignUpModal 
          isOpen={isSignUpOpen} 
          onClose={() => setIsSignUpOpen(false)} 
          onSuccess={(user) => setCurrentUser(user)}
        />
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
          onSuccess={(user) => setCurrentUser(user)}
          onSwitchToRegister={() => {
            setIsLoginOpen(false);
            setIsSignUpOpen(true);
          }}
        />
      </main>
    </div>
  );
};

export default App;
