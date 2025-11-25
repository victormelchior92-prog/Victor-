import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';

// Note: Using a public environment variable for demo purposes if process.env isn't available
// In production, this should be handled securely.
const API_KEY = process.env.API_KEY || ''; 

export const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for audio handling
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null); // LiveSession type
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    if (!API_KEY) {
      setError("Clé API manquante");
      return;
    }

    try {
      setError(null);
      setIsActive(true);
      
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Input Context (Mic)
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // Output Context (Speaker)
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const inputCtx = inputAudioContextRef.current;
      const outputCtx = outputAudioContextRef.current;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'Tu es un assistant vocal amical pour VTV, une application de streaming. Tu aides les utilisateurs à choisir des films, tu réponds à des questions sur le cinéma. Réponds toujours en français de manière concise et enthousiaste.',
          speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        },
        callbacks: {
            onopen: () => {
                console.log("Gemini Live Connected");
                const source = inputCtx.createMediaStreamSource(stream);
                const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                
                scriptProcessor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                };
                
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputCtx.destination);
            },
            onmessage: async (msg: LiveServerMessage) => {
                const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                    setIsSpeaking(true);
                    const ctx = outputAudioContextRef.current!;
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                    
                    const buffer = await decodeAudioData(
                        decode(audioData),
                        ctx,
                        24000,
                        1
                    );
                    
                    const source = ctx.createBufferSource();
                    source.buffer = buffer;
                    source.connect(outputNode);
                    source.onended = () => {
                        sourcesRef.current.delete(source);
                        if (sourcesRef.current.size === 0) setIsSpeaking(false);
                    };
                    
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += buffer.duration;
                    sourcesRef.current.add(source);
                }
            },
            onclose: () => {
                console.log("Gemini Live Closed");
                stopSession();
            },
            onerror: (err) => {
                console.error("Gemini Error", err);
                setError("Erreur de connexion");
                stopSession();
            }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error(err);
      setError("Impossible d'accéder au microphone");
      setIsActive(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setIsSpeaking(false);
    
    // Close audio contexts
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    
    // Stop tracks
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    
    // Close session if possible (wrapper doesn't expose clean close easily, relying on dereference)
    sessionRef.current = null;
    sourcesRef.current.clear();
  };

  if (!API_KEY) return null; // Don't show if no key

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isActive ? (
        <button 
          onClick={startSession}
          className="flex items-center gap-2 bg-gradient-to-r from-vtv-neon to-vtv-purple text-black font-bold py-3 px-5 rounded-full shadow-[0_0_20px_rgba(0,242,234,0.5)] hover:scale-105 transition-transform"
        >
          <Mic size={20} />
          <span>Assistant VTV</span>
        </button>
      ) : (
        <div className="bg-vtv-card border border-vtv-neon p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-4 w-64 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between w-full items-center">
                <span className="text-xs font-bold text-vtv-neon uppercase tracking-wider">En écoute</span>
                <button onClick={stopSession} className="text-gray-400 hover:text-white">
                    <X size={16} />
                </button>
            </div>
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isSpeaking ? 'bg-vtv-purple animate-pulse-fast' : 'bg-vtv-dark border-2 border-vtv-neon'}`}>
                {isSpeaking ? <Volume2 className="text-white" size={32} /> : <Mic className="text-vtv-neon" size={32} />}
            </div>

            <div className="h-4 w-full flex justify-center items-end gap-1">
                 {/* Fake visualizer bars */}
                 {[1,2,3,4,5].map(i => (
                     <div key={i} className={`w-1 bg-vtv-neon rounded-full transition-all duration-100 ${isSpeaking ? `h-${Math.floor(Math.random()*4)+2}` : 'h-1'}`} style={{animationDelay: `${i*0.1}s`}}></div>
                 ))}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
};
