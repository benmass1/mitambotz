
import React, { useState } from 'react';
import { editMachinePhoto, generateMachineryImage } from '../services/geminiService';

const MachineEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'edit' | 'generate'>('generate');
  
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setMode('edit');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    setLoading(true);
    try {
      if (mode === 'edit' && image) {
        const edited = await editMachinePhoto(image, prompt);
        setResult(edited);
      } else {
        const generated = await generateMachineryImage(prompt, aspectRatio, imageSize);
        setResult(generated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-neutral-900 border border-white/5 rounded-[40px] p-8">
            <h2 className="text-xl font-black mb-6 uppercase italic tracking-tight">Image <span className="text-blue-400">Lab</span></h2>
            
            <div className="flex bg-black p-1 rounded-2xl mb-6">
              <button 
                onClick={() => setMode('generate')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'generate' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                Create New
              </button>
              <button 
                onClick={() => setMode('edit')}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'edit' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                Edit Photo
              </button>
            </div>

            <div className="space-y-4">
              {mode === 'edit' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Base Photo</label>
                  <div className="border border-white/10 rounded-2xl p-4 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-black">
                    {image ? (
                      <img src={image} className="w-full h-24 object-contain rounded" alt="Base" />
                    ) : (
                      <label className="cursor-pointer text-center py-4">
                        <svg className="w-8 h-8 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        <span className="text-[10px] font-bold opacity-30 uppercase">Upload</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {mode === 'generate' ? 'What do you want to see?' : 'What edits to apply?'}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'generate' ? "e.g., A 3D cross-section of a 6-cylinder diesel engine with turbocharger highlighted..." : "e.g., Circle the leaking seal in red, remove the technician in the background..."}
                  className="w-full h-32 bg-black border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-blue-500 text-xs resize-none"
                />
              </div>

              {mode === 'generate' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ratio</label>
                    <select 
                      value={aspectRatio} 
                      onChange={(e) => setAspectRatio(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none"
                    >
                      <option value="1:1">Square (1:1)</option>
                      <option value="3:4">Portrait (3:4)</option>
                      <option value="4:3">Album (4:3)</option>
                      <option value="16:9">Wide (16:9)</option>
                      <option value="21:9">Ultra (21:9)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Quality</label>
                    <select 
                      value={imageSize} 
                      onChange={(e) => setImageSize(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold focus:outline-none"
                    >
                      <option value="1K">Standard (1K)</option>
                      <option value="2K">High (2K)</option>
                      <option value="4K">Master (4K)</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={loading || !prompt || (mode === 'edit' && !image)}
                className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest transition-all ${
                  loading ? 'bg-neutral-800 text-gray-500' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:scale-[0.98]'
                }`}
              >
                {loading ? 'PROCESSING...' : (mode === 'generate' ? 'GENERATE IMAGE' : 'APPLY EDITS')}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-neutral-900 border border-white/5 rounded-[40px] h-full flex flex-col overflow-hidden min-h-[400px]">
             {result ? (
               <div className="flex-1 p-8 flex flex-col">
                  <div className="flex-1 rounded-[32px] overflow-hidden bg-black shadow-2xl relative group">
                    <img src={result} className="w-full h-full object-contain" alt="Result" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = result;
                          link.download = 'mitambo_diagram.png';
                          link.click();
                        }}
                        className="bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Generated via Gemini 3 Pro Vision</p>
                    <button onClick={() => setResult(null)} className="text-red-400 text-[10px] font-black uppercase hover:underline">Clear & Restart</button>
                  </div>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-600">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 uppercase tracking-tighter italic">Preview Canvas</h3>
                  <p className="max-w-xs text-sm mt-2 opacity-50 italic">Configure your parameters on the left and run the generator to see the magic.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineEditor;
