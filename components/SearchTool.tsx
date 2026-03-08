
import React, { useState } from 'react';
import { searchTechnicalData, findServiceCenters } from '../services/geminiService';
import { GroundingSource } from '../types';
import ReactMarkdown from 'react-markdown';

const SearchTool: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, sources: GroundingSource[] } | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const data = await searchTechnicalData(query);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFindNearby = async () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const data = await findServiceCenters(pos.coords.latitude, pos.coords.longitude);
          setResult(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }, () => {
        setLoading(false);
        alert("Geolocation denied. Cannot find nearby centers.");
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-neutral-900 border border-white/5 rounded-[40px] p-8 md:p-12">
        <h2 className="text-3xl font-black mb-8 italic tracking-tighter">TECHNICAL <span className="text-green-500">HUB</span></h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search Torque specs, Part numbers, or latest bulletins..."
              className="w-full bg-black border border-white/10 rounded-full py-4 pl-16 pr-8 focus:outline-none focus:border-green-500 transition-all text-sm"
            />
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleSearch}
              disabled={loading || !query}
              className="bg-green-600 hover:bg-green-500 text-white px-8 rounded-full font-black text-xs uppercase transition-all whitespace-nowrap"
            >
              Search Web
            </button>
            <button 
              onClick={handleFindNearby}
              disabled={loading}
              className="bg-white/5 hover:bg-white/10 text-white px-8 rounded-full font-black text-xs uppercase transition-all whitespace-nowrap border border-white/10 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>Nearby Help</span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center py-12">
            <div className="w-12 h-12 border-4 border-white/5 border-t-green-500 rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-black text-green-500 animate-pulse tracking-widest uppercase">Grounded Intelligence Loading...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-8">
            <div className="prose prose-invert prose-green max-w-none text-gray-300 leading-relaxed text-sm bg-black/40 p-8 rounded-3xl border border-white/5">
              <ReactMarkdown>{result.text}</ReactMarkdown>
            </div>

            {result.sources.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Verified Sources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 bg-neutral-800/50 hover:bg-neutral-800 rounded-2xl border border-white/5 transition-all"
                    >
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-black uppercase text-green-500 mb-0.5 opacity-70 group-hover:opacity-100">TECHNICAL REF</p>
                        <p className="text-xs font-bold truncate max-w-[180px]">{source.title}</p>
                      </div>
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchTool;
