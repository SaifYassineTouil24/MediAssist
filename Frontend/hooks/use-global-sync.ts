"use client"

import { useEffect, useCallback, useRef } from "react"
import { globalSyncManager, type SyncEvent, type SyncEventType } from "@/lib/global-sync-manager"

interface UseSyncOptions {
  onEvent?: (event: SyncEvent) => void
  autoSubscribe?: boolean
}

export function useGlobalSync(eventType: SyncEventType, options: UseSyncOptions = {}) {
  const { onEvent, autoSubscribe = true } = options
  const listenerIdRef = useRef<string | null>(null)

  const emit = useCallback(
    (data: Record<string, any>) => {
      if (globalSyncManager) {
        globalSyncManager.emit(eventType, data)
      }
    },
    [eventType],
  )

  useEffect(() => {
    if (!autoSubscribe || !onEvent || !globalSyncManager) return

    listenerIdRef.current = globalSyncManager.subscribe(eventType, onEvent)

    return () => {
      if (listenerIdRef.current && globalSyncManager) {
        globalSyncManager.unsubscribe(eventType, listenerIdRef.current)
      }
    }
  }, [eventType, onEvent, autoSubscribe])

  return { emit }
}

export function useAllSync(onEvent: (event: SyncEvent) => void) {
  const listenerIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!globalSyncManager) return

    listenerIdRef.current = globalSyncManager.subscribe("user-action" as SyncEventType, onEvent)

    return () => {
      if (listenerIdRef.current && globalSyncManager) {
        globalSyncManager.unsubscribe("user-action" as SyncEventType, listenerIdRef.current)
      }
    }
  }, [onEvent])
}
