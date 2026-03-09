
import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredAt: string;
}

interface Visit {
  id: string;
  ip: string;
  userEmail: string;
  userAgent: string;
  timestamp: string;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [visitors, setVisitors] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'visitors' | 'settings'>('users');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/data');
        
        let data;
        try {
          const text = await response.text();
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          console.error('Failed to parse admin data:', e);
          throw new Error('Invalid server response');
        }

        if (!response.ok) {
           throw new Error('Failed to fetch data');
        }

        setUsers(data.users || []);
        setVisitors(data.visitors || []);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
        // Fallback to empty data so UI doesn't crash
        setUsers([]);
        setVisitors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Admin Control Center</h1>
          <p className="text-gray-500 text-sm mt-1">System Overview & Configuration</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border border-red-500/20 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Restricted Access
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          USERS ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('visitors')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'visitors' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          VISITORS ({visitors.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-purple-500 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          SYSTEM SETTINGS
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'users' && (
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 h-full overflow-hidden flex flex-col">
            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-black/50 text-gray-500 sticky top-0 backdrop-blur-md z-10">
                  <tr>
                    <th className="p-4 rounded-l-lg">Name</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 rounded-r-lg">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 font-bold text-white group-hover:text-yellow-500 transition-colors">{user.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                          user.role === 'Manager' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 
                          user.role === 'Technician' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/20' : 
                          'bg-gray-500/20 text-gray-500 border border-gray-500/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono">{user.email}</td>
                      <td className="p-4 text-xs text-gray-500">{new Date(user.registeredAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'visitors' && (
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 h-full overflow-hidden flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Total Visits</p>
                <p className="text-3xl font-black text-white">{visitors.length}</p>
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Unique Users</p>
                <p className="text-3xl font-black text-blue-500">{new Set(visitors.map(v => v.userEmail)).size}</p>
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Last 24h</p>
                <p className="text-3xl font-black text-green-500">
                  {visitors.filter(v => new Date(v.timestamp).getTime() > Date.now() - 86400000).length}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase bg-black/50 text-gray-500 sticky top-0 backdrop-blur-md z-10">
                  <tr>
                    <th className="p-4 rounded-l-lg">Time</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Device Info</th>
                    <th className="p-4 rounded-r-lg">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visitors.map(visit => (
                    <tr key={visit.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-xs whitespace-nowrap text-gray-300">
                        {new Date(visit.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {visit.userEmail}
                      </td>
                      <td className="p-4 text-xs font-mono text-gray-500 max-w-xs truncate" title={visit.userAgent}>
                        {visit.userAgent}
                      </td>
                      <td className="p-4 text-xs font-mono text-blue-400">
                        {visit.ip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-2xl space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </span>
                  System Configuration
                </h3>
                <p className="text-gray-400 text-sm mb-6">Manage global settings for the Dr. Mitambo platform. Changes here affect all users.</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                    <div>
                      <h4 className="font-bold text-white text-sm">Maintenance Mode</h4>
                      <p className="text-xs text-gray-500">Disable access for non-admin users</p>
                    </div>
                    <button className="w-12 h-6 bg-gray-700 rounded-full relative transition-colors">
                      <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                    <div>
                      <h4 className="font-bold text-white text-sm">New User Registration</h4>
                      <p className="text-xs text-gray-500">Allow new users to sign up</p>
                    </div>
                    <button className="w-12 h-6 bg-green-500 rounded-full relative transition-colors">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                    <div>
                      <h4 className="font-bold text-white text-sm">AI Model Version</h4>
                      <p className="text-xs text-gray-500">Current: Gemini 1.5 Flash</p>
                    </div>
                    <select className="bg-black border border-white/10 rounded-lg text-xs p-2 text-white outline-none">
                      <option>Gemini 1.5 Flash</option>
                      <option>Gemini 1.5 Pro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  </span>
                  Danger Zone
                </h3>
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Reset System Data</h4>
                      <p className="text-xs text-gray-500">Clear all machine data and logs</p>
                    </div>
                    <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-xs font-bold transition-all">
                      RESET DATA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
