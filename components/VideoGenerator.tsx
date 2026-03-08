
import React, { useState } from 'react';
import { generateTechnicalAnimation } from '../services/geminiService';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setStatus('Initializing Veo 3.1 Fast...');
    try {
      const url = await generateTechnicalAnimation(prompt, image || undefined);
      setVideoUrl(url);
    } catch (error) {
      console.error(error);
      setStatus('Generation failed. Check API limits.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-neutral-900 border border-white/5 rounded-[40px] p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <svg className="w-64 h-64" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
        </div>

        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2 italic tracking-tighter">VIDEO <span className="text-orange-500">SIMULATOR</span></h2>
          <p className="text-gray-500 text-sm mb-8">Animate complex machinery movements using Veo 3.1 AI.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Starting Frame (Optional)</label>
              <div className="h-40 bg-black border border-white/10 rounded-3xl overflow-hidden flex items-center justify-center">
                {image ? (
                  <img src={image} className="w-full h-full object-cover" alt="Start" />
                ) : (
                  <label className="cursor-pointer flex flex-col items-center hover:text-orange-500 transition-colors opacity-30">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Base Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Motion Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A cinematic view of a Volvo EC480 excavator bucket digging into hard rock with realistic dust effects..."
                className="w-full h-40 bg-black border border-white/10 rounded-3xl p-6 focus:outline-none focus:border-orange-500 text-sm leading-relaxed resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={`w-full py-6 rounded-3xl font-black text-lg transition-all flex flex-col items-center justify-center ${
              loading ? 'bg-neutral-800 text-gray-500 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-500 shadow-xl shadow-orange-600/20 active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-4 border-gray-600 border-t-white rounded-full animate-spin mb-2"></div>
                <span className="text-[10px] tracking-widest uppercase">{status}</span>
              </>
            ) : (
              <span>GENERATE SIMULATION</span>
            )}
          </button>
        </div>
      </div>

      {videoUrl && (
        <div className="bg-neutral-900 border border-orange-500/20 rounded-[40px] p-8 animate-in zoom-in duration-500">
           <div className="aspect-video bg-black rounded-[32px] overflow-hidden shadow-2xl">
             <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
           </div>
           <div className="mt-6 flex justify-between items-center">
             <div>
               <p className="text-xs font-black text-orange-500 italic">SIMULATION READY</p>
               <p className="text-[10px] text-gray-500">720p HD · 16:9 Landscape · Veo 3.1 Preview</p>
             </div>
             <a href={videoUrl} download="mitambo_sim.mp4" className="bg-white/5 hover:bg-white/10 px-6 py-2 rounded-full text-xs font-black uppercase transition-colors">Download MP4</a>
           </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
