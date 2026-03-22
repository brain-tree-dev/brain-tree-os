'use client'

import { useState, useEffect, useCallback } from 'react'

interface BrainCardData {
  id: string
  name: string
  description: string
  is_demo: boolean
  fileCount: number
  departmentCount: number
  agentCount: number
  rootFolderColors: string[]
}

interface BrainsListData {
  demos: BrainCardData[]
  userBrains: BrainCardData[]
}

export function useBrainsList(initialData: BrainsListData) {
  const [data, setData] = useState<BrainsListData>(initialData)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/brains')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      // ignore fetch errors
    }
  }, [])

  useEffect(() => {
    // Connect to WebSocket for global brain list updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws`

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe-global' }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'brains-updated') {
          refresh()
        }
      } catch {
        // ignore parse errors
      }
    }

    return () => {
      ws.close()
    }
  }, [refresh])

  return data
}
