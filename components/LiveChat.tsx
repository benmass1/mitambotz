
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// Base64 helper functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // PCM 16-bit Little Endian
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface ChatEntry {
  role: 'user' | 'model';
  text: string;
}

const LiveChat: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [volume, setVolume] = useState(0);
  const [isKeySelected, setIsKeySelected] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setIsKeySelected(selected);
      }
    };
    checkKey();
  }, []);
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const [liveInputText, setLiveInputText] = useState('');
  const [liveOutputText, setLiveOutputText] = useState('');

  const inputTranscriptionRef = useRef('');
  const outputTranscriptionRef = useRef('');
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputGainNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, liveInputText, liveOutputText]);

  const stopSession = () => {
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    if (inputAudioContextRef.current) inputAudioContextRef.current.close().catch(() => {});
    if (outputAudioContextRef.current) outputAudioContextRef.current.close().catch(() => {});
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());

    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
    outputGainNodeRef.current = null;
    streamRef.current = null;
    sessionPromiseRef.current = null;
    
    setStatus('idle');
    setVolume(0);
    setIsAiThinking(false);
    setLiveInputText('');
    setLiveOutputText('');
    inputTranscriptionRef.current = '';
    outputTranscriptionRef.current = '';
    nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    stopSession();
    setStatus('connecting');

    try {
      const apiKey = (window as any).process?.env?.API_KEY || process.env.API_KEY || '';
      if (!apiKey) {
        throw new Error("API Key haijapatikana. Tafadhali hakikisha umechagua API Key kwenye menu.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      await outCtx.resume();
      
      const gainNode = outCtx.createGain();
      gainNode.gain.value = 2.0; // Punguza kidogo isipasue spika lakini iwe na nguvu
      gainNode.connect(outCtx.destination);
      
      outputAudioContextRef.current = outCtx;
      outputGainNodeRef.current = gainNode;

      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      await inCtx.resume();
      inputAudioContextRef.current = inCtx;

      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ 
          audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1, sampleRate: 16000 } 
        });
      } catch (e) {
        throw new Error("Microphone haijapatikana. Tafadhali ruhusu matumizi ya mic kwenye browser.");
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            setErrorMessage('');
            console.log("Live Session Opened");
            
            // LAKINISHA: Tuma salamu ya kwanza kumlazimisha Dr. Mitambo aongee
            sessionPromise.then(session => {
              session.sendRealtimeInput({ 
                text: "Habari Dr. Mitambo! Mimi ni fundi wako hapa Tz. Karibu kwenye mazungumzo yetu ya leo." 
              });
            });

            if (inputAudioContextRef.current && streamRef.current) {
              const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
              const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                
                let sum = 0;
                for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                const rms = Math.sqrt(sum / inputData.length);
                setVolume(rms);

                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ 
                    media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
                  });
                });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContextRef.current.destination);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsAiThinking(false);
              return;
            }

            if (message.serverContent?.inputTranscription) {
              inputTranscriptionRef.current += message.serverContent.inputTranscription.text;
              setLiveInputText(inputTranscriptionRef.current);
              setIsAiThinking(true);
            }

            if (message.serverContent?.outputTranscription) {
              outputTranscriptionRef.current += message.serverContent.outputTranscription.text;
              setLiveOutputText(outputTranscriptionRef.current);
              setIsAiThinking(false);
            }

            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && outputAudioContextRef.current && outputGainNodeRef.current) {
              for (const part of parts) {
                const audioData = part.inlineData?.data;
                if (audioData) {
                  console.log("Audio chunk received, length:", audioData.length);
                  const ctx = outputAudioContextRef.current;
                  if (ctx.state === 'suspended') await ctx.resume();
                  
                  try {
                    const decodedData = decode(audioData);
                    const audioBuffer = await decodeAudioData(decodedData, ctx, 24000, 1);
                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputGainNodeRef.current);
                    
                    const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
                    source.start(startTime);
                    nextStartTimeRef.current = startTime + audioBuffer.duration;
                    
                    source.onended = () => sourcesRef.current.delete(source);
                    sourcesRef.current.add(source);
                  } catch (err) {
                    console.error("Audio Playback Error:", err);
                  }
                }
              }
            }

            if (message.serverContent?.turnComplete) {
              if (inputTranscriptionRef.current || outputTranscriptionRef.current) {
                setHistory(prev => [
                  ...prev, 
                  { role: 'user', text: inputTranscriptionRef.current || "[Sauti]" },
                  { role: 'model', text: outputTranscriptionRef.current || "[Jibu la sauti]" }
                ]);
              }
              inputTranscriptionRef.current = '';
              outputTranscriptionRef.current = '';
              setLiveInputText('');
              setLiveOutputText('');
              setIsAiThinking(false);
            }
          },
          onerror: (e) => {
            console.error("Live System Error:", e);
            setStatus('error');
            stopSession();
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: 'Wewe ni Dr. Mitambo, fundi mkuu wa mitambo Tanzania. Jibu lako liwe la sauti ya kiume, ya mamlaka, na mchangamfu sana. ONGEA KWA KISWAHILI SANIFU CHA MITAANI NA KIUFUNDI (Professional Tanzanian Swahili). Unaposikia fundi anauliza jambo, jibu kwa urefu kiasi, usiwe na maneno mafupi mafupi mno. Dr. Mitambo ana elimu kubwa ya mashine za CAT, Volvo, Komatsu na Sany. Mara tu unapoanza link, wasalimie fundi kwa bashasha.'
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Kuna tatizo limetokea wakati wa kuunganisha.");
      setStatus('error');
      stopSession();
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col space-y-4 animate-in fade-in duration-500">
      <div className="bg-neutral-900 border border-white/10 rounded-[40px] p-6 shadow-2xl relative overflow-hidden shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-neutral-700'}`}></div>
            <h2 className="text-sm font-black italic tracking-tighter uppercase">DR. MITAMBO <span className="text-yellow-500">VOICE LINK</span></h2>
          </div>
          <div className="flex items-center space-x-2">
             <span className="bg-green-500/10 text-green-500 text-[8px] font-black px-2 py-0.5 rounded uppercase">Optimized Audio</span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-1.5 h-16">
          {[...Array(40)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 rounded-full transition-all duration-75 ${status === 'active' ? (isAiThinking ? 'bg-blue-500 animate-pulse' : 'bg-yellow-500') : 'bg-neutral-800'}`}
              style={{ 
                height: status === 'active' ? `${20 + (volume * 400 * (0.4 + Math.random() * 0.6))}%` : '6px',
                opacity: status === 'active' ? 1 : 0.2
              }}
            ></div>
          ))}
        </div>
        
        {status === 'active' && (
          <p className="text-center text-[10px] font-black uppercase text-gray-400 mt-2 tracking-widest">
            {isAiThinking ? "DR. MITAMBO ANAFIKIRI..." : "DR. MITAMBO ANASIKILIZA..."}
          </p>
        )}

        {status === 'error' && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold text-center uppercase">
            {errorMessage}
          </div>
        )}
        {!isKeySelected && (
          <button 
            onClick={async () => {
              await (window as any).aistudio.openSelectKey();
              setIsKeySelected(true);
            }}
            className="mt-4 w-full bg-yellow-500 text-black py-2 rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            CHAGUA API KEY
          </button>
        )}
      </div>

      <div className="flex-1 bg-neutral-900 border border-white/5 rounded-[40px] overflow-hidden flex flex-col shadow-inner relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {history.length === 0 && !liveInputText && !liveOutputText && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 border border-yellow-500/20">
                <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
              </div>
              <p className="text-sm font-bold uppercase italic tracking-widest text-white">Anzisha Link kuzungumza na Bingwa.</p>
              <p className="text-[10px] text-gray-500 mt-2">Hakikisha umeunganisha Internet na Mic.</p>
            </div>
          )}

          {history.map((chat, i) => (
            <div key={i} className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] px-5 py-3 rounded-[24px] text-sm font-medium ${
                chat.role === 'user' 
                ? 'bg-neutral-800 text-gray-400 rounded-tr-none border border-white/10' 
                : 'bg-yellow-500 text-black rounded-tl-none font-bold shadow-lg shadow-yellow-500/10'
              }`}>
                {chat.text}
              </div>
              <span className="text-[9px] font-black text-gray-600 uppercase mt-1 px-2 tracking-widest">
                {chat.role === 'user' ? 'FUNDI' : 'DR. MITAMBO'}
              </span>
            </div>
          ))}

          {liveInputText && (
            <div className="flex flex-col items-end">
              <div className="max-w-[85%] px-5 py-3 rounded-[24px] rounded-tr-none bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm italic">
                {liveInputText}
              </div>
              <span className="text-[9px] font-black text-blue-500 uppercase mt-1 px-2 tracking-widest animate-pulse">Unazungumza...</span>
            </div>
          )}

          {liveOutputText && (
            <div className="flex flex-col items-start">
              <div className="max-w-[85%] px-5 py-3 rounded-[24px] rounded-tl-none bg-yellow-500 text-black text-sm font-bold">
                {liveOutputText}
              </div>
              <span className="text-[9px] font-black text-yellow-500 uppercase mt-1 px-2 tracking-widest animate-pulse">Dr. Mitambo anajibu...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 bg-black/40 border-t border-white/5 backdrop-blur-md">
          {status === 'active' ? (
            <button 
              onClick={stopSession}
              className="w-full bg-red-600/10 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-500/10 active:scale-95"
            >
              KATA LINK YA AUDIO
            </button>
          ) : (
            <button 
              onClick={startSession}
              disabled={status === 'connecting'}
              className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
            >
              {status === 'connecting' ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>INAUNGANISHA...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  <span>UNGANISHA NA DR. MITAMBO</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
