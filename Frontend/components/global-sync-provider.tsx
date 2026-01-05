"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { globalSyncManager } from "@/lib/global-sync-manager"

export function GlobalSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [connectedUsers, setConnectedUsers] = useState(1)
  const [syncStatus, setSyncStatus] = useState<"connected" | "syncing" | "idle">("idle")

  useEffect(() => {
    if (user?.id) {
      globalSyncManager.setUserId(user.id)
    }
  }, [user?.id])

  useEffect(() => {
    // Update connected users count periodically
    const interval = setInterval(() => {
      setConnectedUsers(globalSyncManager.getConnectedUsers())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Show sync indicator
  useEffect(() => {
    const handleSync = () => {
      setSyncStatus("syncing")
      const timer = setTimeout(() => setSyncStatus("connected"), 500)
      return () => clearTimeout(timer)
    }

    globalSyncManager.subscribe("user-action", () => {
      handleSync()
    })
  }, [])

  return (
    <>
      {children}
      {/* Sync Status Indicator */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white rounded-lg shadow-lg p-3 text-sm">
        <div className={`w-2 h-2 rounded-full ${syncStatus === "connected" ? "bg-green-500" : "bg-yellow-500"}`} />
        <span className="text-gray-700">{connectedUsers > 1 ? `${connectedUsers} users connected` : "Sync ready"}</span>
      </div>
    </>
  )
}
