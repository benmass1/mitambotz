
import React, { useState } from 'react';
import { analyzeSymptom } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const DiagnosisTool: React.FC = () => {
  const [symptom, setSymptom] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnose = async () => {
    if (!symptom && !image) return;
    setLoading(true);
    try {
      const diagnosis = await analyzeSymptom(symptom, image || undefined);
      setResult(diagnosis);
    } catch (error) {
      console.error(error);
      setResult("Diagnosis failed. Please check your connection or API configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-neutral-900 border border-white/5 rounded-[40px] p-8 md:p-12">
        <h2 className="text-3xl font-black mb-8 italic tracking-tighter">AI DIAGNOSIS <span className="text-yellow-500">ENGINE</span></h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Describe Symptoms</label>
            <textarea
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="e.g., Heavy smoke from exhaust, loss of power in hydraulics when cold..."
              className="w-full h-48 bg-black border border-white/10 rounded-3xl p-6 focus:outline-none focus:border-yellow-500 transition-all text-sm leading-relaxed resize-none"
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Visual Evidence (Optional)</label>
            <div className="relative group h-48 bg-black border border-white/10 rounded-3xl overflow-hidden flex items-center justify-center">
              {image ? (
                <>
                  <img src={image} alt="Upload" className="w-full h-full object-cover" />
                  <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/50 p-2 rounded-full hover:bg-black">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center group-hover:text-yellow-500 transition-colors">
                  <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50">Upload Photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <p className="text-[10px] text-gray-500 italic">Plate info, leaks, or dashboard error codes help most.</p>
          </div>
        </div>

        <button
          onClick={handleDiagnose}
          disabled={loading || (!symptom && !image)}
          className={`w-full py-6 rounded-3xl font-black text-lg transition-all flex items-center justify-center space-x-3 ${
            loading ? 'bg-neutral-800 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 text-black hover:bg-yellow-400 active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
              <span>CHURNING DATA...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>GENERATE ANALYSIS</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="bg-neutral-900 border border-yellow-500/20 rounded-[40px] p-8 md:p-12 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-8 bg-yellow-500 rounded-full"></div>
            <h3 className="text-2xl font-black italic tracking-tighter">AI <span className="text-yellow-500">INSIGHTS</span></h3>
          </div>
          <div className="prose prose-invert prose-yellow max-w-none text-gray-300 leading-relaxed text-sm">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisTool;
