
import React from 'react';

interface AuthScreenProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Side: Branding */}
        <div className="text-center md:text-left space-y-6">
          <div className="inline-flex items-center space-x-3 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full mb-4">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            <span className="text-yellow-500 text-xs font-black tracking-widest uppercase">AI-Powered Maintenance</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
            DR. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">MITAMBO</span>
          </h1>
          
          <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto md:mx-0">
            Mfumo wa kisasa wa utambuzi, usimamizi, na uchambuzi wa mitambo mizito kwa kutumia akili bandia (AI).
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
            <button 
              onClick={onLoginClick}
              className="px-8 py-4 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all transform hover:scale-105 uppercase tracking-widest text-sm"
            >
              Ingia (Login)
            </button>
            <button 
              onClick={onRegisterClick}
              className="px-8 py-4 bg-yellow-500 text-black font-black rounded-xl hover:bg-yellow-400 transition-all transform hover:scale-105 uppercase tracking-widest text-sm shadow-lg shadow-yellow-500/20"
            >
              Jisajiri (Register)
            </button>
            <button 
              onClick={() => {
                const guestUser = { name: 'Mgeni', role: 'Technician' };
                localStorage.setItem('dr_mitambo_user', JSON.stringify(guestUser));
                window.location.reload();
              }}
              className="px-8 py-4 bg-neutral-800 text-white font-black rounded-xl hover:bg-neutral-700 transition-all transform hover:scale-105 uppercase tracking-widest text-sm"
            >
              Endelea kama Mgeni
            </button>
          </div>
        </div>

        {/* Right Side: Visual Feature List */}
        <div className="hidden md:grid grid-cols-1 gap-4">
          <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:border-yellow-500/30 transition-colors">
            <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 className="text-white font-bold mb-1">AI Diagnosis</h3>
            <p className="text-gray-500 text-xs">Tambua matatizo ya mitambo kwa picha au sauti.</p>
          </div>

          <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:border-yellow-500/30 transition-colors translate-x-8">
            <div className="w-10 h-10 bg-green-500/20 text-green-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
            <h3 className="text-white font-bold mb-1">Fleet Management</h3>
            <p className="text-gray-500 text-xs">Simamia orodha nzima ya mitambo na ratiba za service.</p>
          </div>

          <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-sm hover:border-yellow-500/30 transition-colors">
            <div className="w-10 h-10 bg-purple-500/20 text-purple-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <h3 className="text-white font-bold mb-1">Admin Control</h3>
            <p className="text-gray-500 text-xs">Udhibiti kamili wa watumiaji na ripoti za mfumo.</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 text-center">
        <p className="text-gray-600 text-[10px] uppercase tracking-widest">Powered by Google Gemini AI</p>
      </div>
    </div>
  );
};

export default AuthScreen;
