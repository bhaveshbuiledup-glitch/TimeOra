import React, { useEffect, useRef, useState } from 'react';
import { Device } from '@twilio/voice-sdk';
import { Headphones, Mic, MicOff, Phone, PhoneOff, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VoiceCallButton = () => {
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');
  const [configured, setConfigured] = useState(false);
  const deviceRef = useRef(null);
  const callRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/api/voice/config`)
      .then((response) => response.json())
      .then((data) => { if (active) setConfigured(Boolean(data.configured)); })
      .catch(() => { if (active) setConfigured(false); });
    return () => {
      active = false;
      callRef.current?.disconnect();
      deviceRef.current?.destroy();
    };
  }, []);

  const endCall = () => {
    callRef.current?.disconnect();
    deviceRef.current?.destroy();
    callRef.current = null;
    deviceRef.current = null;
    setState('ended');
    setMessage('Call ended');
  };

  const startCall = async () => {
    if (!configured) {
      setState('ended');
      setMessage('Website calling is not configured yet. Please contact TIMEORA support.');
      return;
    }
    setState('connecting');
    setMessage('Requesting microphone access...');
    let permissionStream;
    try {
      permissionStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      permissionStream.getTracks().forEach((track) => track.stop());
      const response = await fetch(`${API_BASE}/api/voice/token`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.token) throw new Error(data.message || 'Calling is not configured');

      const device = new Device(data.token, { codecPreferences: ['opus', 'pcmu'] });
      deviceRef.current = device;
      device.on('error', (error) => {
        setMessage(error.message || 'Call connection failed');
        setState('ended');
      });
      const call = await device.connect({ params: { To: 'TIMEORA_AI', Source: 'website' } });
      callRef.current = call;
      call.on('accept', () => { setState('active'); setMessage('Connected to TIMEORA AI'); });
      call.on('disconnect', () => { setState('ended'); setMessage('Call ended'); });
      call.on('cancel', () => { setState('ended'); setMessage('Call ended'); });
      call.on('error', (error) => { setState('ended'); setMessage(error.message || 'Call connection failed'); });
    } catch (error) {
      permissionStream?.getTracks().forEach((track) => track.stop());
      deviceRef.current?.destroy();
      deviceRef.current = null;
      setState('ended');
      setMessage(error.name === 'NotAllowedError'
        ? 'Microphone permission is required to call.'
        : error.name === 'NotFoundError'
          ? 'No microphone was found on this device.'
          : error.message || 'Calling could not be started.');
    }
  };

  const toggleMute = () => {
    if (!callRef.current) return;
    const muted = !callRef.current.isMuted();
    callRef.current.mute(muted);
    setState(muted ? 'muted' : 'active');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2" aria-live="polite">
      {message && state !== 'idle' && (
        <div className="max-w-[min(22rem,calc(100vw-2rem))] rounded-md border border-white/15 bg-[#111827] px-3 py-2 text-xs text-white shadow-xl">
          <div className="flex items-start gap-2">
            <span className="flex-1">{message}</span>
            <button type="button" aria-label="Dismiss call status" onClick={() => { if (state === 'ended') { setState('idle'); setMessage(''); } }} className="text-gray-400 hover:text-white"><X size={14} /></button>
          </div>
        </div>
      )}
      {state === 'active' || state === 'muted' ? (
        <div className="flex items-center gap-2 rounded-md border border-white/15 bg-[#111827] p-2 shadow-xl">
          <span className="px-2 text-xs text-emerald-300">{state === 'muted' ? 'Muted' : 'Active'}</span>
          <button type="button" title={state === 'muted' ? 'Unmute microphone' : 'Mute microphone'} aria-label={state === 'muted' ? 'Unmute microphone' : 'Mute microphone'} onClick={toggleMute} className="grid size-10 place-items-center rounded-md bg-white/10 text-white hover:bg-white/20">{state === 'muted' ? <MicOff size={17} /> : <Mic size={17} />}</button>
          <button type="button" title="End call" aria-label="End call" onClick={endCall} className="grid size-10 place-items-center rounded-md bg-red-600 text-white hover:bg-red-500"><PhoneOff size={17} /></button>
        </div>
      ) : (
        <button type="button" disabled={state === 'connecting'} title={configured ? 'Talk to TIMEORA AI' : 'AI calling is not configured'} onClick={startCall} className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#2dd4bf] px-4 text-sm font-semibold text-[#07110f] shadow-lg transition hover:bg-[#5eead4] disabled:cursor-wait disabled:opacity-70">
          {state === 'connecting' ? <Headphones size={17} className="animate-pulse" /> : <Phone size={17} />}
          <span>{state === 'connecting' ? 'Connecting...' : 'Talk to TIMEORA AI'}</span>
        </button>
      )}
    </div>
  );
};

export default VoiceCallButton;
