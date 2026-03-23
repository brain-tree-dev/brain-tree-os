'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface BrainFile { id: string; path: string }
interface BrainLink { source_file_id: string; target_path: string }
interface ExecutionStep {
  id: string; phase_number: number; phase_title: string; step_number: number; title: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  tasks_json: Array<{ done: boolean; text: string }> | null;
}
interface Handoff {
  id: string; session_number: number; date: string; created_at: string | null;
  duration_seconds: number | null; summary: string; file_path: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface InitialData {
  files: BrainFile[]
  links: BrainLink[]
  executionSteps: ExecutionStep[]
  handoffs: Handoff[]
}

interface UseBrainRealtimeReturn {
  files: BrainFile[]
  links: BrainLink[]
  executionSteps: ExecutionStep[]
  handoffs: Handoff[]
  connectionStatus: ConnectionStatus
  isStreaming: boolean
  optimisticUpdateStep: (stepId: string, status: ExecutionStep['status']) => void
}

export function useBrainRealtime(
  brainId: string,
  initialData: InitialData
): UseBrainRealtimeReturn {
  const [files, setFiles] = useState<BrainFile[]>(initialData.files)
  const [links, setLinks] = useState<BrainLink[]>(initialData.links)
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>(initialData.executionSteps)
  const [handoffs, setHandoffs] = useState<Handoff[]>(initialData.handoffs)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [isStreaming, setIsStreaming] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const streamTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Connect to WebSocket for real-time file updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws`

    setConnectionStatus('connecting')
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setConnectionStatus('connected')
      // Subscribe to this brain's updates
      ws.send(JSON.stringify({ type: 'subscribe', brainId }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)

        // Handle individual update types from watcher
        if (msg.type === 'files') setFiles(msg.data)
        if (msg.type === 'links') setLinks(msg.data)
        if (msg.type === 'execution_steps') setExecutionSteps(msg.data)
        if (msg.type === 'handoffs') setHandoffs(msg.data)

        // Also handle full-update for backwards compatibility
        if (msg.type === 'full-update') {
          if (msg.files) setFiles(msg.files)
          if (msg.links) setLinks(msg.links)
          if (msg.executionSteps) setExecutionSteps(msg.executionSteps)
          if (msg.handoffs) setHandoffs(msg.handoffs)
        }

        // Show streaming indicator on any data update
        if (['files', 'links', 'execution_steps', 'handoffs', 'full-update'].includes(msg.type)) {
          setIsStreaming(true)
          if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current)
          streamTimeoutRef.current = setTimeout(() => setIsStreaming(false), 5000)
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.onclose = () => {
      setConnectionStatus('disconnected')
    }

    ws.onerror = () => {
      setConnectionStatus('error')
    }

    return () => {
      ws.close()
      wsRef.current = null
      if (streamTimeoutRef.current) clearTimeout(streamTimeoutRef.current)
    }
  }, [brainId])

  // Sync initial data when props change
  useEffect(() => {
    setFiles(initialData.files)
    setLinks(initialData.links)
    setExecutionSteps(initialData.executionSteps)
    setHandoffs(initialData.handoffs)
  }, [initialData.files, initialData.links, initialData.executionSteps, initialData.handoffs])

  const optimisticUpdateStep = useCallback(
    (stepId: string, status: ExecutionStep['status']) => {
      setExecutionSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, status } : s)))
    },
    []
  )

  return { files, links, executionSteps, handoffs, connectionStatus, isStreaming, optimisticUpdateStep }
}
