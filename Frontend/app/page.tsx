"use client"

import React from "react"
import { useState, useEffect, createContext, useCallback, useMemo, useRef } from "react"
import PatientCard from "../components/patient-card"
import AppointmentCalendar from "../components/appointment-calendar"
import { useAppointments } from "../hooks/use-appointments"
import { useGlobalSync } from "@/hooks/use-global-sync"
import EditAppointmentModal from "@/components/edit-appointment-modal"
import IconComponent from "@/components/icon-component"

const AppContext = createContext<any>(null)

interface Appointment {
  ID_RV: number
  ID_patient: number
  type: string
  mutuelle: boolean
  status: string
  patient: {
    first_name: string
    last_name: string
  }
}

interface AppointmentsByStatus {
  scheduled: Appointment[]
  waiting: Appointment[]
  preparing: Appointment[]
  consulting: Appointment[]
  completed: Appointment[]
  canceled: Appointment[]
}

const STATUSES = ["scheduled", "waiting", "preparing", "consulting", "completed", "canceled"] as const

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(null)
  const [renderKey, setRenderKey] = useState(0)
  
  // État local géré manuellement
  const [localData, setLocalData] = useState<AppointmentsByStatus>({
    scheduled: [],
    waiting: [],
    preparing: [],
    consulting: [],
    completed: [],
    canceled: [],
  })
  
  const { 
    appointments: serverData, 
    loading, 
    error, 
    updateAppointmentStatus, 
    toggleMutuelle, 
    deleteAppointment, 
    refetch 
  } = useAppointments(selectedDate)

  // Sync server data to local state
  const lastServerDataRef = useRef<string>("")
  
  useEffect(() => {
    if (serverData) {
      const serverDataStr = JSON.stringify(serverData)
      if (serverDataStr !== lastServerDataRef.current) {
        lastServerDataRef.current = serverDataStr
        setLocalData({
          scheduled: [...(serverData.scheduled || [])],
          waiting: [...(serverData.waiting || [])],
          preparing: [...(serverData.preparing || [])],
          consulting: [...(serverData.consulting || [])],
          completed: [...(serverData.completed || [])],
          canceled: [...(serverData.canceled || [])],
        })
        setRenderKey(k => k + 1)
      }
    }
  }, [serverData])

  const dragStateRef = useRef({
    appointmentId: null as number | null,
    sourceStatus: null as string | null,
    isDragging: false,
  })

  const showNotification = useCallback((message: string, type: "success" | "error") => {
    const el = document.createElement("div")
    el.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg ${
      type === "error" ? "bg-red-500" : "bg-green-500"
    } text-white max-w-md z-[9999]`
    el.textContent = message
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 3000)
  }, [])

  // Déplacer un appointment localement
  const moveLocal = useCallback((appointmentId: number, fromStatus: string, toStatus: string) => {
    setLocalData(prev => {
      const fromKey = fromStatus as keyof AppointmentsByStatus
      const toKey = toStatus as keyof AppointmentsByStatus
      
      const fromList = prev[fromKey] || []
      const toList = prev[toKey] || []
      
      const idx = fromList.findIndex(a => a.ID_RV === appointmentId)
      if (idx === -1) {
        console.log("Appointment not found in source:", appointmentId, fromStatus)
        return prev
      }
      
      const item = fromList[idx]
      const newFromList = fromList.filter((_, i) => i !== idx)
      const newToList = [...toList, { ...item, status: toStatus }]
      
      const newState = {
        ...prev,
        [fromKey]: newFromList,
        [toKey]: newToList,
      }
      
      console.log("Moved appointment:", appointmentId, "from", fromStatus, "to", toStatus)
      console.log("New state:", newState)
      
      return newState
    })
    
    // Force re-render
    setRenderKey(k => k + 1)
  }, [])

  // Supprimer localement
  const deleteLocal = useCallback((appointmentId: number) => {
    setLocalData(prev => {
      const newState = { ...prev }
      for (const status of STATUSES) {
        newState[status] = prev[status].filter(a => a.ID_RV !== appointmentId)
      }
      return newState
    })
    setRenderKey(k => k + 1)
  }, [])

  // Drag and Drop handlers
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement
      const card = target.closest("[data-appointment-id]") as HTMLElement
      
      if (!card) {
        e.preventDefault()
        return
      }
      
      const id = card.getAttribute("data-appointment-id")
      const container = card.closest("[data-status]")
      const status = container?.getAttribute("data-status")
      
      if (!id || !status) {
        e.preventDefault()
        return
      }
      
      dragStateRef.current = {
        appointmentId: Number(id),
        sourceStatus: status,
        isDragging: true,
      }
      
      e.dataTransfer?.setData("text/plain", id)
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move"
      }
      
      card.style.opacity = "0.5"
      console.log("Drag started:", id, "from", status)
    }

    const handleDragEnd = (e: DragEvent) => {
      // Reset all card styles
      document.querySelectorAll("[data-appointment-id]").forEach(el => {
        (el as HTMLElement).style.opacity = "1"
      })
      
      // Reset all container styles
      document.querySelectorAll("[data-status]").forEach(el => {
        el.classList.remove("bg-blue-100", "ring-2", "ring-blue-500")
      })
      
      dragStateRef.current.isDragging = false
      console.log("Drag ended")
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      
      const container = (e.target as HTMLElement).closest("[data-status]")
      if (container && dragStateRef.current.isDragging) {
        document.querySelectorAll("[data-status]").forEach(el => {
          el.classList.remove("bg-blue-100", "ring-2", "ring-blue-500")
        })
        container.classList.add("bg-blue-100", "ring-2", "ring-blue-500")
      }
    }

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      // Clean up styles
      document.querySelectorAll("[data-status]").forEach(el => {
        el.classList.remove("bg-blue-100", "ring-2", "ring-blue-500")
      })
      document.querySelectorAll("[data-appointment-id]").forEach(el => {
        (el as HTMLElement).style.opacity = "1"
      })
      
      const { appointmentId, sourceStatus, isDragging } = dragStateRef.current
      
      if (!isDragging || !appointmentId || !sourceStatus) {
        console.log("Drop cancelled - invalid state")
        return
      }
      
      const container = (e.target as HTMLElement).closest("[data-status]")
      const targetStatus = container?.getAttribute("data-status")
      
      if (!targetStatus) {
        console.log("Drop cancelled - no target status")
        return
      }
      
      if (sourceStatus === targetStatus) {
        console.log("Drop cancelled - same status")
        dragStateRef.current = { appointmentId: null, sourceStatus: null, isDragging: false }
        return
      }
      
      console.log("Processing drop:", appointmentId, sourceStatus, "->", targetStatus)
      
      // Reset drag state
      dragStateRef.current = { appointmentId: null, sourceStatus: null, isDragging: false }
      
      // 1. Mise à jour locale immédiate
      moveLocal(appointmentId, sourceStatus, targetStatus)
      
      // 2. Appel API
      try {
        const result = await updateAppointmentStatus(appointmentId, targetStatus)
        
        if (result.success) {
          showNotification("Statut mis à jour", "success")
        } else {
          showNotification(result.message || "Erreur", "error")
          // Rollback
          moveLocal(appointmentId, targetStatus, sourceStatus)
        }
      } catch (err) {
        console.error("API error:", err)
        showNotification("Erreur serveur", "error")
        // Rollback
        moveLocal(appointmentId, targetStatus, sourceStatus)
      }
    }

    document.addEventListener("dragstart", handleDragStart)
    document.addEventListener("dragend", handleDragEnd)
    document.addEventListener("dragover", handleDragOver)
    document.addEventListener("drop", handleDrop)

    return () => {
      document.removeEventListener("dragstart", handleDragStart)
      document.removeEventListener("dragend", handleDragEnd)
      document.removeEventListener("dragover", handleDragOver)
      document.removeEventListener("drop", handleDrop)
    }
  }, [moveLocal, updateAppointmentStatus, showNotification])

  // Listen for external updates
  useEffect(() => {
    const handler = () => refetch()
    window.addEventListener("appointmentCreated", handler)
    return () => window.removeEventListener("appointmentCreated", handler)
  }, [refetch])

  const sections = useMemo(() => [
    { title: "Programmé", status: "scheduled", icon: "calendar-check", color: "text-gray-700" },
    { title: "Salle d'attente", status: "waiting", icon: "clock", color: "text-yellow-600" },
    { title: "En préparation", status: "preparing", icon: "clipboard-list", color: "text-orange-600" },
    { title: "En consultation", status: "consulting", icon: "stethoscope", color: "text-blue-700", maxLimit: 1 },
    { title: "Terminé", status: "completed", icon: "check-circle", color: "text-green-600" },
    { title: "Annulé", status: "canceled", icon: "ban", color: "text-red-700" },
  ], [])

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date)
    emitDateChange({ date })
  }, [])

  const handleMutuelleToggle = useCallback(async (id: string | number) => {
    const numId = typeof id === "string" ? Number(id) : id
    const result = await toggleMutuelle(numId)
    if (result.success) {
      showNotification("Mutuelle mise à jour", "success")
      refetch()
    } else {
      showNotification(result.message || "Erreur", "error")
    }
  }, [toggleMutuelle, showNotification, refetch])

  const handleDelete = useCallback(async (id: number) => {
    deleteLocal(id)
    const result = await deleteAppointment(id)
    if (result.success) {
      showNotification("Supprimé", "success")
    } else {
      showNotification(result.message || "Erreur", "error")
      refetch()
    }
  }, [deleteAppointment, deleteLocal, showNotification, refetch])

  const { emit: emitDateChange } = useGlobalSync("date-select", {
    onEvent: (event) => {
      if (event.data.date) setSelectedDate(event.data.date)
    },
  })

  if (loading && localData.scheduled.length === 0) {
    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error && localData.scheduled.length === 0) {
    return (
      <div className="flex-1 overflow-auto p-4">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {sections.map((section) => {
              const data = localData[section.status as keyof AppointmentsByStatus] || []
              
              return (
                <div 
                  key={section.status} 
                  className="bg-white rounded-2xl shadow-[0px_8px_20px_rgba(0,0,0,0.25)] p-4"
                >
                  <h3 className={`text-base font-semibold mb-3 pb-3 border-b border-gray-200 ${section.color} flex items-center`}>
                    <IconComponent name={section.icon} className="w-4 h-4 mr-2" />
                    {section.title}
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {data.length}
                    </span>
                  </h3>
                  <div
                    data-status={section.status}
                    className="space-y-2 max-h-[320px] overflow-y-auto min-h-[100px] rounded-lg p-1 transition-colors duration-200"
                  >
                    {data.length > 0 ? (
                      data.map((apt) => (
                        <div
                          key={`${apt.ID_RV}-${renderKey}`}
                          data-appointment-id={apt.ID_RV}
                          draggable="true"
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <PatientCard
                            name={`${apt.patient?.first_name || ""} ${apt.patient?.last_name || ""}`}
                            type={apt.type}
                            status={section.status}
                            appointmentId={apt.ID_RV}
                            patientId={apt.ID_patient}
                            mutuelle={apt.mutuelle}
                            onMutuelleToggle={handleMutuelleToggle}
                            onDelete={handleDelete}
                            onEdit={setEditingAppointmentId}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 text-sm py-8">
                        <p>Aucun rendez-vous</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <AppointmentCalendar activeDate={selectedDate} onDateSelect={handleDateSelect} />
        </div>
      </div>

      {editingAppointmentId && (
        <EditAppointmentModal
          appointmentId={editingAppointmentId}
          onClose={() => setEditingAppointmentId(null)}
          onSuccess={() => {
            setEditingAppointmentId(null)
            refetch()
          }}
        />
      )}
    </>
  )
}

export default function Home() {
  return <Dashboard />
}

export { AppContext }