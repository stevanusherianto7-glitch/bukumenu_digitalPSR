/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
import { useOrderStore } from '../store/orderStore';
import { api } from '../lib/api';

export const OrderManager: React.FC = () => {
    const { orders, setOrders } = useOrderStore();
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

    // Polling Logic
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/api/orders');
                const serverOrders = response.data;

                // Check for NEW pending orders
                // We compare the incoming server data with our current store state.
                // Specifically, we look for any order with status 'pending' that we don't already have locally as 'pending'
                // OR simpler: check if server has MORE pending orders than we do.

                const currentPendingIDs = new Set(orders.filter(o => o.status === 'pending').map(o => o.id));
                const serverPendingOrders = serverOrders.filter((o: any) => o.status === 'pending');

                let hasNewOrder = false;
                for (const sOrder of serverPendingOrders) {
                    if (!currentPendingIDs.has(sOrder.id)) {
                        hasNewOrder = true;
                        break;
                    }
                }

                if (hasNewOrder) {
                    console.log("🔔 New Order Received! Playing sound...");
                    playNotificationSound();
                }

                // Always sync store with latest server truth
                // We sort by timestamp descending to keep recent at top
                const sortedOrders = serverOrders.sort((a: any, b: any) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );

                setOrders(sortedOrders);

            } catch (error) {
                console.error("Polling error in OrderManager:", error);
            }
        };

        // Initial fetch
        fetchOrders();

        // Poll every 5 seconds
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orders]); // Depend on orders ensures we compare against fresh state

    return null; // Invisible component
};
