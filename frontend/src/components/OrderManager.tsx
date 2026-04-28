/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';

export const OrderManager: React.FC = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    // Function to play sound (Ting-Tung effect)
    const playNotificationSound = () => {
        try {
            // Re-create or resume AudioContext
            // Note: Browsers block audio unless triggered by user interaction first.
            // We assume the admin has interacted with the page at least once.
            if (!audioContextRef.current) {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContextClass();
            }

            const ctx = audioContextRef.current;
            if (ctx?.state === 'suspended') {
                ctx.resume().catch(e => console.warn("Audio resume failed:", e));
            }

            if (!ctx) return;

            const now = ctx.currentTime;

            // Oscillator 1: "Ting" (High Pitch)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, now); // A5
            gain1.gain.setValueAtTime(0.1, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            osc1.start(now);
            osc1.stop(now + 0.5);

            // Oscillator 2: "Tung" (Lower Pitch) - slightly delayed
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(587.33, now + 0.2); // D5
            gain2.gain.setValueAtTime(0.1, now + 0.2);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

            osc2.start(now + 0.2);
            osc2.stop(now + 1.2);

        } catch (error) {
            console.error("Failed to play notification sound:", error);
        }
    };

    // Event Listener for new orders
    useEffect(() => {
        const handleNewOrder = () => {
            console.log("🔔 New Order Received via Supabase Realtime! Playing sound...");
            playNotificationSound();
        };

        window.addEventListener('new-order-ping', handleNewOrder);
        
        return () => {
            window.removeEventListener('new-order-ping', handleNewOrder);
        };
    }, []);

    return null; // Invisible component
};
