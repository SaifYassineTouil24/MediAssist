type SyncEventType =
  | "navigation"
  | "appointment-update"
  | "date-select"
  | "patient-select"
  | "status-change"
  | "data-update"
  | "user-action"

interface SyncEvent {
  type: SyncEventType
  userId: string
  timestamp: number
  data: Record<string, any>
  sessionId: string
}

interface SyncListener {
  id: string
  callback: (event: SyncEvent) => void
}

class GlobalSyncManager {
  private static instance: GlobalSyncManager
  private listeners: Map<string, SyncListener[]> = new Map()
  private eventHistory: SyncEvent[] = []
  private sessionId: string
  private userId = ""
  private maxHistorySize = 100

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeListeners()
  }

  static getInstance(): GlobalSyncManager {
    if (!GlobalSyncManager.instance) {
      GlobalSyncManager.instance = new GlobalSyncManager()
    }
    return GlobalSyncManager.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeListeners(): void {
    if (typeof window === "undefined") return

    // Listen for storage changes from other tabs/windows
    window.addEventListener("storage", (event) => {
      if (event.key?.startsWith("sync_event_")) {
        try {
          const syncEvent = JSON.parse(event.newValue || "{}") as SyncEvent
          if (syncEvent.sessionId !== this.sessionId) {
            this.broadcastEvent(syncEvent)
          }
        } catch (error) {
          console.error("[v0] Failed to parse sync event:", error)
        }
      }
    })
  }

  setUserId(userId: string): void {
    this.userId = userId
  }

  subscribe(eventType: SyncEventType, callback: (event: SyncEvent) => void): string {
    const listenerId = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }

    this.listeners.get(eventType)!.push({
      id: listenerId,
      callback,
    })

    return listenerId
  }

  unsubscribe(eventType: SyncEventType, listenerId: string): void {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      const index = listeners.findIndex((l) => l.id === listenerId)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(eventType: SyncEventType, data: Record<string, any>): void {
    if (typeof window === "undefined") return

    const syncEvent: SyncEvent = {
      type: eventType,
      userId: this.userId,
      timestamp: Date.now(),
      data,
      sessionId: this.sessionId,
    }

    // Add to history
    this.eventHistory.push(syncEvent)
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift()
    }

    // Broadcast to local listeners
    this.broadcastEvent(syncEvent)

    // Store in localStorage for cross-tab communication
    const eventKey = `sync_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(eventKey, JSON.stringify(syncEvent))

    // Clean up old events from localStorage
    this.cleanupOldEvents()
  }

  private broadcastEvent(event: SyncEvent): void {
    const listeners = this.listeners.get(event.type) || []
    listeners.forEach((listener) => {
      try {
        listener.callback(event)
      } catch (error) {
        console.error("[v0] Error in sync listener:", error)
      }
    })

    // Also broadcast to 'all' listeners
    const allListeners = this.listeners.get("user-action" as SyncEventType) || []
    if (event.type !== "user-action") {
      allListeners.forEach((listener) => {
        try {
          listener.callback(event)
        } catch (error) {
          console.error("[v0] Error in sync listener:", error)
        }
      })
    }
  }

  private cleanupOldEvents(): void {
    if (typeof window === "undefined") return

    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5 minutes

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("sync_event_")) {
        try {
          const event = JSON.parse(localStorage.getItem(key) || "{}") as SyncEvent
          if (now - event.timestamp > maxAge) {
            localStorage.removeItem(key)
          }
        } catch (error) {
          localStorage.removeItem(key || "")
        }
      }
    }
  }

  getEventHistory(): SyncEvent[] {
    return [...this.eventHistory]
  }

  getSessionId(): string {
    return this.sessionId
  }

  getConnectedUsers(): number {
    // Count unique users from recent events
    const recentEvents = this.eventHistory.slice(-50)
    const uniqueUsers = new Set(recentEvents.map((e) => e.userId))
    return uniqueUsers.size
  }
}

const globalSyncManager = typeof window !== "undefined" ? GlobalSyncManager.getInstance() : null

export { globalSyncManager }
export type { SyncEvent, SyncEventType }
