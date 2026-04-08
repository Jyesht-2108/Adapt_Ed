/**
 * SSE stream hook for curriculum generation
 * Wraps EventSource and returns chunks, status, and error state
 */

import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../lib/api';
import type { SSEStatusEvent, SSEChunkEvent, SSECompleteEvent, SSEErrorEvent } from '../types';

interface SSEStreamState {
  status: string | null;
  step: number;
  totalSteps: number;
  chunks: string[];
  lessonId: string | null;
  isComplete: boolean;
  error: string | null;
  isConnected: boolean;
}

export function useSSEStream(
  generationId: string | null,
  goal: string,
  sessionId: string
) {
  const [state, setState] = useState<SSEStreamState>({
    status: null,
    step: 0,
    totalSteps: 4,
    chunks: [],
    lessonId: null,
    isComplete: false,
    error: null,
    isConnected: false,
  });

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!generationId || !goal) return;

    const streamUrl = apiClient.getStreamUrl(generationId, goal, sessionId);
    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    setState((prev) => ({ ...prev, isConnected: true }));

    // Handle status events
    eventSource.addEventListener('status', (event) => {
      try {
        const data: SSEStatusEvent = JSON.parse(event.data);
        setState((prev) => ({
          ...prev,
          status: data.message,
          step: data.step,
          totalSteps: data.total_steps,
        }));
      } catch (err) {
        console.error('Failed to parse status event:', err);
      }
    });

    // Handle chunk events
    eventSource.addEventListener('chunk', (event) => {
      try {
        const data: SSEChunkEvent = JSON.parse(event.data);
        setState((prev) => ({
          ...prev,
          chunks: [...prev.chunks, data.content],
        }));
      } catch (err) {
        console.error('Failed to parse chunk event:', err);
      }
    });

    // Handle complete events
    eventSource.addEventListener('complete', (event) => {
      try {
        const data: SSECompleteEvent = JSON.parse(event.data);
        setState((prev) => ({
          ...prev,
          lessonId: data.lesson_id,
          isComplete: true,
          isConnected: false,
        }));
        eventSource.close();
      } catch (err) {
        console.error('Failed to parse complete event:', err);
      }
    });

    // Handle error events from the server (named 'error')
    eventSource.addEventListener('error', (event) => {
      try {
        const data: SSEErrorEvent = JSON.parse((event as MessageEvent).data);
        setState((prev) => ({
          ...prev,
          error: data.message,
          isConnected: false,
        }));
        if (data.fatal !== false) {
          eventSource.close();
        }
      } catch {
        // Connection error (not a message error)
        setState((prev) => ({
          ...prev,
          error: 'Connection lost. Please try again.',
          isConnected: false,
        }));
        eventSource.close();
      }
    });

    // Handle connection errors
    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) return;
      setState((prev) => ({
        ...prev,
        error: 'Connection error. Please check your network.',
        isConnected: false,
      }));
      eventSource.close();
    };

    // Cleanup on unmount
    return () => {
      if (eventSource.readyState !== EventSource.CLOSED) {
        eventSource.close();
      }
    };
  }, [generationId, goal, sessionId]);

  return state;
}
