
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  isShareMode?: boolean;
  isAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMenuOpen, setIsMenuOpen, isShareMode, isAdmin }) => {
  const copyShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('share', 'true');
    navigator.clipboard.writeText(url.toString());
    alert('Share link copied to clipboard! You can now send this to others.');
  };
  const NavItem = ({ id, label, icon, isLive }: { id: AppTab, label: string, icon: React.ReactNode, isLive?: boolean }) => (
    <button
      onClick={() => { setActiveTab(id); setIsMenuOpen(false); }}
      className={`flex items-center space-x-3 w-full p-3.5 rounded-xl transition-all duration-200 group relative ${
        activeTab === id 
        ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className={`${activeTab === id ? 'text-black' : 'text-gray-500 group-hover:text-yellow-500'} transition-colors`}>
        {icon}
      </div>
      <span className="font-bold text-sm tracking-tight">{label}</span>
      {isLive && (
        <span className="absolute right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
    </button>
  );

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 mb-4">
        <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20 mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-500 p-2 rounded-lg text-black">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>
            </div>
            <span className="font-black text-white italic tracking-tighter">DR. MITAMBO</span>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">Multimodal Heavy Machinery AI Assistant v3.1</p>
        </div>

        <nav className="space-y-1.5">
          <NavItem id={AppTab.DASHBOARD} label="DASHBOARD" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"/></svg>} />
          <NavItem id={AppTab.LIVE} label="LIVE AUDIO CHAT" isLive icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>} />
          <NavItem id={AppTab.MACHINES} label="MITAMBO (FLEET)" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>} />
          <NavItem id={AppTab.DIAGNOSIS} label="AI DIAGNOSIS" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>} />
          <NavItem id={AppTab.SEARCH} label="TECHNICAL SEARCH" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>} />
          <NavItem id={AppTab.EDITOR} label="IMAGE EDITOR" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>} />
          {!isShareMode && <NavItem id={AppTab.VISUALIZER} label="VIDEO SIMULATOR" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>} />}
          {isAdmin && <NavItem id={AppTab.ADMIN} label="ADMIN PANEL" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>} />}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        {!isShareMode && (
          <button 
            onClick={copyShareLink}
            className="w-full py-3 px-4 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-xl border border-yellow-500/30 text-xs font-black transition-all flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
            <span>COPY SHARE LINK</span>
          </button>
        )}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-[10px] text-gray-500 uppercase font-black mb-2">System Status</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold">Cloud Core Ready</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-72 bg-neutral-950 border-r border-white/5 h-screen overflow-y-auto">
        {navContent}
      </aside>

      {/* Mobile Sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-neutral-950 border-r border-white/10 shadow-2xl flex flex-col animate-slide-in">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
