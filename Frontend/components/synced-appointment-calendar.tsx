"use client"

import { useCalendar } from "../hooks/use-calendar"
import { useCalendarSync } from "../hooks/use-calendar-sync"
import { useEffect, useState } from "react"

interface SyncedCalendarProps {
  onDateSelect?: (date: string) => void
}

export default function SyncedAppointmentCalendar({ onDateSelect }: SyncedCalendarProps) {
  const { currentDate: hookDate, appointmentCounts, loading, error, navigateMonth: hookNavigate } = useCalendar()
  const { syncState, broadcastDateSelect, broadcastMonthNavigation, getSessionInfo } = useCalendarSync()
  const [showSyncIndicator, setShowSyncIndicator] = useState(false)

  // Use synced date if available, otherwise use hook date
  const currentDate = syncState.currentDate || hookDate

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ]

  const dayNames = ["D", "L", "M", "M", "J", "V", "S"]

  const getCountColor = (count: number) => {
    if (count === 0) return "bg-gray-300"
    if (count <= 5) return "bg-green-500"
    if (count <= 15) return "bg-yellow-500"
    if (count <= 25) return "bg-orange-500"
    return "bg-red-500"
  }

  const getTodayString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Show sync indicator when event is received
  useEffect(() => {
    if (syncState.lastSyncEvent) {
      setShowSyncIndicator(true)
      const timer = setTimeout(() => setShowSyncIndicator(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [syncState.lastSyncEvent])

  const handleDateSelect = (date: string) => {
    broadcastDateSelect(date)
    onDateSelect?.(date)
  }

  const handleMonthNavigation = (direction: "prev" | "next") => {
    broadcastMonthNavigation(direction)
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const todayString = getTodayString()

    const days = []

    // Day headers
    dayNames.forEach((day, index) => {
      days.push(
        <div key={`header-${index}`} className="font-medium text-gray-500 text-center p-1">
          {day}
        </div>,
      )
    })

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-1"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const isToday = dateString === todayString
      const isActiveDate = dateString === syncState.selectedDate
      const count = appointmentCounts[dateString] || 0
      const colorClass = getCountColor(count)

      days.push(
        <div
          key={day}
          className={`relative p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200 ${
            isToday
              ? "bg-blue-500 hover:bg-blue-600"
              : isActiveDate
                ? "bg-gray-300 hover:bg-gray-400 ring-2 ring-gray-500"
                : ""
          }`}
          onClick={() => handleDateSelect(dateString)}
          title={count > 0 ? `${count} rendez-vous` : "Aucun rendez-vous"}
        >
          <div
            className={`text-sm text-center ${isToday ? "text-white font-semibold" : isActiveDate ? "text-gray-800 font-semibold" : "text-gray-700"}`}
          >
            {day}
          </div>
          <div className="absolute bottom-1 right-1">
            <div
              className={`${colorClass} w-2 h-2 rounded-full shadow-md`}
              title={count > 0 ? `${count} rendez-vous` : "Aucun rendez-vous"}
            ></div>
          </div>
        </div>,
      )
    }

    return days
  }

  const sessionInfo = getSessionInfo()

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 h-fit">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-700 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendrier
            {loading && <span className="ml-2 text-xs text-gray-500">Chargement...</span>}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {sessionInfo.connectedUsers} utilisateur{sessionInfo.connectedUsers > 1 ? "s" : ""} connecté
            {sessionInfo.connectedUsers > 1 ? "s" : ""}
          </p>
        </div>
        {showSyncIndicator && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 border border-green-300 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-700 font-medium">Synchronisé</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => handleMonthNavigation("prev")}
          className="text-gray-600 hover:text-blue-500 p-1 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <h4 className="text-base font-medium">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        <button
          onClick={() => handleMonthNavigation("next")}
          className="text-gray-600 hover:text-blue-500 p-1 transition-colors"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      {error && <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">{error}</div>}

      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-3">{renderCalendar()}</div>

      <div className="space-y-1 pt-2 border-t border-gray-200">
        <div className="text-xs font-semibold text-gray-600 mb-2">Nombre de rendez-vous:</div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
          <span className="text-xs text-gray-600">Aucun RV</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="text-xs text-gray-600">1-5 RV</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
          <span className="text-xs text-gray-600">6-15 RV</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
          <span className="text-xs text-gray-600">16-25 RV</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="text-xs text-gray-600">&gt;25 RV</span>
        </div>
      </div>
    </div>
  )
}

// Custom SVG Icons
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)
