
import React from 'react';
import { AppTab, Machine } from '../types';

interface DashboardProps {
  onNavigate: (tab: AppTab) => void;
  machines: Machine[];
  userName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, machines, userName }) => {
  const stats = [
    { label: "Total Fleet", value: machines.length.toString(), trend: "Active", color: "text-yellow-500" },
    { label: "Critical", value: machines.filter(m => m.status === 'Critical').length.toString(), trend: "Alert", color: "text-red-500" },
    { label: "Healthy", value: machines.filter(m => m.status === 'Healthy').length.toString(), trend: "Stable", color: "text-green-500" },
    { label: "In Repair", value: machines.filter(m => m.status === 'In Repair').length.toString(), trend: "Ongoing", color: "text-blue-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Karibu, <span className="text-yellow-500">{userName || 'Musa'}.</span></h1>
          <p className="text-gray-400 max-w-lg">Mfumo wa utambuzi na usimamizi wa mitambo umeshawashwa. Una mitambo {machines.length} kwenye orodha.</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-bold transition-colors">EXPORT REPORT</button>
          <button 
            onClick={() => onNavigate(AppTab.MACHINES)}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-xs font-black transition-colors"
          >
            LIST YA MITAMBO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-neutral-900/50 p-6 rounded-3xl border border-white/5 hover:border-yellow-500/20 transition-all">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
              <span className="text-[10px] font-bold text-gray-500">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Machine Buttons Section */}
      <section className="bg-neutral-950 p-8 rounded-[40px] border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black flex items-center gap-3 italic">
            <span className="w-2 h-8 bg-yellow-500 block rounded-full"></span>
            MITAMBO YA SASA (FLEET)
          </h2>
          <button 
            onClick={() => onNavigate(AppTab.MACHINES)}
            className="text-xs font-black text-yellow-500 hover:underline uppercase tracking-widest"
          >
            Manage All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {machines.slice(0, 4).map((m, i) => (
            <button 
              key={m.id}
              onClick={() => onNavigate(AppTab.MACHINES)}
              className="bg-neutral-900 border border-white/5 hover:border-yellow-500/50 p-6 rounded-3xl text-left transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-white/10 group-hover:border-yellow-500/30">
                   <svg className="w-5 h-5 text-gray-500 group-hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${m.status === 'Healthy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {m.status}
                </span>
              </div>
              <h4 className="font-black text-sm mb-1 truncate">{m.make} {m.name}</h4>
              <p className="text-[10px] text-gray-500 uppercase font-bold">{m.id}</p>
            </button>
          ))}
          {machines.length === 0 && (
            <p className="col-span-full py-8 text-center text-gray-600 text-sm italic font-medium">Hakuna mitambo kwenye list. Nenda "Mitambo" kuongeza.</p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button 
          onClick={() => onNavigate(AppTab.DIAGNOSIS)}
          className="group relative bg-neutral-900 border border-white/5 hover:border-yellow-500/50 p-8 rounded-[40px] text-left transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-yellow-500/10 transition-colors">
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-black mb-6 shadow-lg shadow-yellow-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 className="text-xl font-black mb-2 uppercase italic tracking-tighter">AI Diagnosis</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Multimodal engine and hydraulic analysis via photo or text symptoms.</p>
          </div>
        </button>

        <button 
          onClick={() => onNavigate(AppTab.EDITOR)}
          className="group relative bg-neutral-900 border border-white/5 hover:border-blue-500/50 p-8 rounded-[40px] text-left transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-blue-500/10 transition-colors">
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <h3 className="text-xl font-black mb-2 uppercase italic tracking-tighter text-blue-400">Smart Editor</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Highlight parts, remove background noise, and generate technical diagrams.</p>
          </div>
        </button>

        <button 
          onClick={() => onNavigate(AppTab.SEARCH)}
          className="group relative bg-neutral-900 border border-white/5 hover:border-green-500/50 p-8 rounded-[40px] text-left transition-all overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-green-500/10 transition-colors">
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-green-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <h3 className="text-xl font-black mb-2 uppercase italic tracking-tighter text-green-400">Technical Hub</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Grounded technical specs search and local service center locations.</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
