
import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, X, Bot, Loader2, ExternalLink, MapPin,
  Mic, Camera, Sparkles, Volume2, Building2,
  Maximize2, Minimize2, Calendar, Phone, Zap, ShieldCheck
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { geminiService, GroundingSource } from '../services/geminiService';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: GroundingSource[];
  image?: string;
}

// Helper functions for Live API
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
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

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const Chatbot: React.FC = () => {
  const { properties, team } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Welcome to NewOak Limited. I am your property concierge. How may I assist your search in Accra today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const [isLiveActive, setIsLiveActive] = useState(false);
  const [nextStartTime, setNextStartTime] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !userCoords) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Location access restricted.")
      );
    }
  }, [isOpen, userCoords]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setPendingImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (forcedText?: string) => {
    const textToSend = forcedText || input;
    if (!textToSend.trim() && !pendingImage || isLoading) return;

    const userMsg = textToSend;
    const currentImage = pendingImage;
    setInput('');
    setPendingImage(null);

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMsg || "Analyze this architectural feature.",
      image: currentImage || undefined
    }]);
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const imagePart = currentImage ? {
      inlineData: {
        mimeType: 'image/jpeg',
        data: currentImage.split(',')[1]
      }
    } : undefined;

    const context = { properties, team };
    const response = await geminiService.generateChatResponse(userMsg, history, userCoords, imagePart, context);

    setMessages(prev => [...prev, {
      role: 'model',
      content: response.text,
      sources: response.sources
    }]);
    setIsLoading(false);
  };

  const startLiveSession = async () => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.error('VITE_GEMINI_API_KEY is not configured for live voice mode');
        setIsLiveActive(false);
        setMode('text');
        return;
      }
      setIsLiveActive(true);
      const ai = new GoogleGenAI({ apiKey });
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inCtx;
      outputAudioContextRef.current = outCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const startAt = Math.max(nextStartTime, outCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outCtx.destination);
              source.start(startAt);
              setNextStartTime(startAt + audioBuffer.duration);
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
          },
          onerror: () => stopLiveSession(),
          onclose: () => setIsLiveActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: "You are the NewOak Executive Concierge. Speak in elegant, plain prose. No lists. Focus on Accra real estate.",
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setIsLiveActive(false);
    }
  };

  const stopLiveSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (micStreamRef.current) micStreamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    setIsLiveActive(false);
    setMode('text');
  };

  const quickActions = [
    { label: 'Visit', text: 'How do I schedule a viewing?', icon: Calendar },
    { label: 'Map', text: 'Show me nearby landmarks.', icon: MapPin },
    { label: 'Value', text: 'Discuss appreciation trends.', icon: Zap }
  ];

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end pointer-events-none p-4 sm:p-0 overflow-hidden sm:overflow-visible">
      {isOpen && (
        <div
          role="dialog"
          aria-label="NewOak Assistant"
          className={`
            pointer-events-auto
            flex flex-col bg-white overflow-hidden shadow-2xl chat-window-transition
            ${isMinimized
              ? 'h-14 w-64 rounded-xl mb-4 border border-oak/10'
              : 'h-[85dvh] w-[92vw] sm:h-[650px] sm:w-[420px] sm:rounded-2xl border border-oak/5'}
          `}
        >
          {/* Header */}
          <div className="bg-oak p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="relative">
                <div className={`w-9 h-9 rounded-full bg-gold flex items-center justify-center shadow-md ${isLiveActive ? 'animate-pulse' : ''}`}>
                  {mode === 'voice' ? <Mic size={18} className="text-oak" /> : <Bot size={20} className="text-oak" />}
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-[16px] leading-tight truncate">NewOak Concierge</h3>
                <div className="flex items-center space-x-1">
                  <span className="text-[7px] text-gold uppercase tracking-[0.2em] font-bold">Encrypted Global Standard</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  if (mode === 'text') { setMode('voice'); startLiveSession(); }
                  else { stopLiveSession(); setMode('text'); }
                }}
                className={`p-2 rounded-full transition-all ${mode === 'voice' ? 'bg-gold text-oak shadow-inner' : 'hover:bg-white/5 text-gray-400'}`}
                aria-label="Switch to voice mode"
              >
                <Volume2 size={18} />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/5 p-2 rounded-full hidden sm:block text-gray-400"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/5 p-2 rounded-full text-gray-400"
                aria-label="Close assistant"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {mode === 'voice' && (
                <div className="flex-grow bg-[#051210] flex flex-col items-center justify-center p-8 text-center space-y-8 animate-fade-in-up">
                  <div className="w-32 h-32 rounded-full border-2 border-gold/30 flex items-center justify-center bg-oak shadow-2xl relative">
                    <Mic size={48} className="text-gold" />
                    <div className="absolute inset-0 rounded-full border-2 border-gold/10 animate-ping"></div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-2xl text-white">Listening...</h4>
                    <p className="text-[12px] text-gray-500 font-light px-6">Inquire about our estates and architectural heritage using natural voice.</p>
                  </div>
                  <button onClick={stopLiveSession} className="bg-red-500/10 text-red-500 border border-red-500/20 px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">
                    Disconnect Session
                  </button>
                </div>
              )}

              {mode === 'text' && (
                <div className="flex flex-col flex-grow overflow-hidden bg-white">
                  {/* Messages */}
                  <div ref={scrollRef} className="flex-grow p-4 sm:p-5 space-y-5 overflow-y-auto bg-gray-50/50 custom-scrollbar">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                        <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                          {msg.image && <img src={msg.image} className="mb-3 rounded-xl border border-gray-100 shadow-md max-w-[200px]" alt="Uploaded scan" />}
                          <div className={`p-4 text-[13px] leading-relaxed tracking-wide shadow-sm ${msg.role === 'user'
                              ? 'bg-oak text-white rounded-[20px_20px_4px_20px]'
                              : 'bg-white text-oak border border-gray-100 rounded-[20px_20px_20px_4px]'
                            }`}>
                            {msg.content}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                {msg.sources.map((s, i) => (
                                  <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-gray-50/80 hover:bg-white px-4 py-2.5 rounded-lg text-[10px] hover:shadow-md transition-all group">
                                    <span className="truncate font-bold text-oak pr-2">{s.title}</span>
                                    <ExternalLink size={12} className="text-gray-300 group-hover:text-gold" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          {msg.role === 'model' && (
                            <div className="mt-2 flex items-center space-x-1.5 opacity-50 text-[8px] font-bold uppercase tracking-widest pl-2">
                              <ShieldCheck size={10} className="text-gold" />
                              <span>Verified Intelligence</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center space-x-3 shadow-sm">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Processing...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Dashboard */}
                  <div className="bg-white border-t border-gray-100 p-4 sm:p-5 space-y-4 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                      {quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(action.text)}
                          className="flex items-center space-x-2 bg-gray-50 hover:bg-white hover:border-gold hover:text-gold border border-gray-200 px-4 py-2.5 rounded-full text-[10px] whitespace-nowrap transition-all text-gray-500 font-bold uppercase tracking-widest"
                        >
                          <action.icon size={12} className="text-gold" />
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-400 hover:text-gold hover:bg-gold/10 p-3 rounded-xl transition-all shrink-0"
                        title="Analyze architectural feature"
                      >
                        <Camera size={22} />
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                      <div className="flex-grow relative">
                        <input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="How can I assist you?"
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-gold/20 rounded-2xl py-3.5 pl-5 pr-12 text-[14px] focus:ring-0 transition-all font-light"
                          aria-label="Type message"
                        />
                        <button
                          onClick={() => handleSend()}
                          disabled={isLoading || (!input.trim() && !pendingImage)}
                          className={`absolute right-1 top-1/2 -translate-y-1/2 p-2.5 transition-all ${isLoading || (!input.trim() && !pendingImage) ? 'text-gray-300' : 'text-gold active:scale-90 hover:bg-gold/10 rounded-xl'}`}
                          aria-label="Send"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isMinimized && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            pointer-events-auto
            w-16 h-16 bg-oak text-white rounded-full flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 relative group
            ${isOpen ? 'hidden sm:flex' : 'flex mb-4 mr-4 sm:mb-0 sm:mr-0'}
          `}
          aria-label={isOpen ? "Close chatbot" : "Open property concierge"}
        >
          {isOpen ? <X size={28} /> : (
            <>
              <MessageSquare size={28} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full border-2 border-oak shadow-md"></span>
            </>
          )}
          {/* Tooltip on Hover (Desktop) */}
          <div className="absolute right-20 bg-oak text-gold text-[10px] font-bold uppercase tracking-widest py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl border border-white/10 hidden md:block whitespace-nowrap">
            Personal Concierge
          </div>
        </button>
      )}
    </div>
  );
};
