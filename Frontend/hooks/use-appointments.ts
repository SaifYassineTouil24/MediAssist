"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { apiClient, type Appointment } from "../lib/api"

export interface GroupedAppointments {
  scheduled: Appointment[]
  waiting: Appointment[]
  preparing: Appointment[]
  consulting: Appointment[]
  completed: Appointment[]
  canceled: Appointment[]
}

export function useAppointments(selectedDate?: string) {
  const [appointments, setAppointments] = useState<GroupedAppointments>({
    scheduled: [],
    waiting: [],
    preparing: [],
    consulting: [],
    completed: [],
    canceled: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef<Map<string, GroupedAppointments>>(new Map())

  const mapStatusToKey = (status: string): keyof GroupedAppointments => {
    const statusMap: Record<string, keyof GroupedAppointments> = {
      Programmé: "scheduled",
      "Salle dattente": "waiting",
      "En préparation": "preparing",
      "En consultation": "consulting",
      Terminé: "completed",
      Annulé: "canceled",
    }
    return statusMap[status] || "scheduled"
  }

  const mapKeyToStatus = (key: string): string => {
    const keyMap: Record<string, string> = {
      scheduled: "scheduled",
      waiting: "waiting",
      preparing: "preparing",
      consulting: "consulting",
      completed: "completed",
      canceled: "canceled",
    }
    return keyMap[key] || "scheduled"
  }

  const fetchAppointments = useCallback(async (date?: string, forceRefresh = false) => {
    try {
      const cacheKey = date || "default"
      if (!forceRefresh && cacheRef.current.has(cacheKey)) {
        setAppointments(cacheRef.current.get(cacheKey)!)
        setLoading(false)
        return
      }

      if (!forceRefresh) setLoading(true)
      setError(null)

      const response = await apiClient.getAppointments(date, forceRefresh)

      if (response.success && response.data) {
        const grouped: GroupedAppointments = {
          scheduled: [],
          waiting: [],
          preparing: [],
          consulting: [],
          completed: [],
          canceled: [],
        }

        if (response.data.grouped) {
          Object.entries(response.data.grouped).forEach(([status, appointmentList]) => {
            const statusKey = mapStatusToKey(status)
            grouped[statusKey] = appointmentList.map((appointment) => ({
              ...appointment,
              mutuelle: Boolean(appointment.mutuelle),
            }))
          })
        }

        cacheRef.current.set(cacheKey, grouped)
        setAppointments(grouped)
        setLoading(false)
      } else {
        const errorMsg = response.message || "Failed to fetch appointments"
        setError(`${errorMsg}${response.error ? ` (${response.error})` : ""}`)
        setLoading(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(`Connection failed: ${errorMessage}. Please check if the Laravel backend is running.`)
      setLoading(false)
    }
  }, [])

  const updateAppointmentStatus = useCallback(
    async (appointmentId: number, newStatus: string) => {
      try {
        setAppointments((prev) => {
          const newAppointments = { ...prev }
          let movedAppointment: Appointment | null = null

          Object.keys(newAppointments).forEach((status) => {
            const statusKey = status as keyof GroupedAppointments
            const index = newAppointments[statusKey].findIndex((app) => app.ID_RV === appointmentId)
            if (index !== -1) {
              movedAppointment = {
                ...newAppointments[statusKey][index],
                status: newStatus,
              }
              newAppointments[statusKey].splice(index, 1)
            }
          })

          if (movedAppointment) {
            const validStatuses: (keyof GroupedAppointments)[] = [
              "scheduled",
              "waiting",
              "preparing",
              "consulting",
              "completed",
              "canceled",
            ]
            const newStatusKey = validStatuses.includes(newStatus as keyof GroupedAppointments)
              ? (newStatus as keyof GroupedAppointments)
              : "scheduled"

            newAppointments[newStatusKey].push(movedAppointment)
          }

          cacheRef.current.clear()
          return newAppointments
        })

        const response = await apiClient.updateAppointmentStatus(appointmentId, newStatus)

        if (!response.success) {
          // Revert on error by refetching
          throw new Error(response.message || "Failed to update status")
        }

        return { success: true, message: "Statut mis à jour avec succès" }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        console.log("[v0] Status update error:", errorMessage)

        // Revert the UI change by refetching the appointments
        await fetchAppointments(selectedDate)

        if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("Connection")) {
          setError(errorMessage)
        }
        return { success: false, message: errorMessage }
      }
    },
    [fetchAppointments, selectedDate],
  )

  const toggleMutuelle = useCallback(async (appointmentId: number) => {
    try {
      const response = await apiClient.toggleMutuelle(appointmentId)

      if (response.success) {
        setAppointments((prev) => {
          const newAppointments = { ...prev }

          Object.keys(newAppointments).forEach((status) => {
            const statusKey = status as keyof GroupedAppointments
            const appointmentIndex = newAppointments[statusKey].findIndex((app) => app.ID_RV === appointmentId)
            if (appointmentIndex !== -1) {
              newAppointments[statusKey][appointmentIndex].mutuelle = Boolean(response.data?.mutuelle)
            }
          })

          cacheRef.current.clear()
          return newAppointments
        })

        return { success: true }
      } else {
        throw new Error(response.message || "Failed to toggle mutuelle")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      return { success: false, message: errorMessage }
    }
  }, [])

  const deleteAppointment = useCallback(async (appointmentId: number) => {
    try {
      const response = await apiClient.deleteAppointment(appointmentId)

      if (response.success) {
        setAppointments((prev) => {
          const newAppointments = { ...prev }

          Object.keys(newAppointments).forEach((status) => {
            const statusKey = status as keyof GroupedAppointments
            newAppointments[statusKey] = newAppointments[statusKey].filter((app) => app.ID_RV !== appointmentId)
          })

          cacheRef.current.clear()
          return newAppointments
        })

        return { success: true, message: "Rendez-vous supprimé avec succès" }
      } else {
        return { success: false, message: response.message || "Failed to delete appointment" }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      console.error("[v0] Delete error:", errorMessage)
      return { success: false, message: errorMessage }
    }
  }, [])

  useEffect(() => {
    fetchAppointments(selectedDate)

    const intervalId = setInterval(() => {
      fetchAppointments(selectedDate, true)
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(intervalId)
  }, [fetchAppointments, selectedDate])

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    updateAppointmentStatus,
    toggleMutuelle,
    deleteAppointment,
  }
}
