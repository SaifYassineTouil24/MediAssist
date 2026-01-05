"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

// Simple icon components to avoid import issues
const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const PillIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M10.5 20.5a10.5 10.5 0 1 0 0-21 10.5 10.5 0 0 0 0 21Z" />
    <path d="M8.5 8.5 15 15" />
    <path d="M15 8.5 8.5 15" />
  </svg>
)

const FlaskIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 3h6l-3 7" />
    <path d="M6 14h12l-3-7" />
    <path d="M6 14l1.5 2.5" />
    <path d="M18 14l-1.5 2.5" />
  </svg>
)

const BarChartIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const LogOutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const MenuIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const StethoscopeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M11 2a2 2 0 0 1 2 2v6.5a0.5 0.5 0 0 1-0.5 0.5h-3a0.5 0.5 0 0 1-0.5-0.5V4a2 2 0 0 1 2-2Z" />
    <path d="M4.5 10.5c0 0.828 0.672 1.5 1.5 1.5s1.5-0.672 1.5-1.5-0.672-1.5-1.5-1.5-1.5 0.672-1.5 1.5Z" />
    <path d="M17 10.5c0 0.828 0.672 1.5 1.5 1.5s1.5-0.672 1.5-1.5-0.672-1.5-1.5-1.5-1.5 0.672-1.5 1.5Z" />
    <path d="M6 12v4a6 6 0 0 0 12 0v-4" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m11-7a4 4 0 0 1 0 8m0-8a4 4 0 0 0 0 8" />
  </svg>
)

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
  onClick?: () => void
}

const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`sidebar-item flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all duration-200 ${
        active ? "active" : ""
      }`}
    >
      <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

interface MedicalSidebarProps {
  currentPage: string
  user: {
    name: string
    role: string
    avatar?: string
  }
}

export default function MedicalSidebar({ currentPage, user }: MedicalSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const menuItems = [
    {
      id: "dashboard",
      label: "Tableau De Bord",
      icon: <UserIcon />,
      href: "/",
      show: user.role === "admin",
    },
    {
      id: "medecin",
      label: "Dashboard Médecin",
      icon: <StethoscopeIcon />,
      href: "/medecin",
      show: user.role === "admin",
    },
    {
      id: "patients",
      label: "Patients",
      icon: <UsersIcon />,
      href: "/patients",
      show: true,
    },
    {
      id: "medicaments",
      label: "Médicaments",
      icon: <PillIcon />,
      href: "/medicaments",
      show: true,
    },
    {
      id: "analyses",
      label: "Analyses",
      icon: <FlaskIcon />,
      href: "/analyses",
      show: true,
    },
  ]

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <div
      className={`${isCollapsed ? "w-16" : "w-64"} h-screen fixed top-0 left-0 shadow-xl flex flex-col transition-all duration-300 z-50 !text-white`}
      style={{ backgroundColor: "#007090" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b border-white/20 transition duration-200 !text-white"
        style={{ backgroundColor: "#007090" }}
      >
        <div
          className="w-10 h-10 rounded-full border-2 border-white/80 flex items-center justify-center shadow-md !text-white"
          style={{ backgroundColor: "#006080" }}
        >
          <UserIcon />
        </div>
        {!isCollapsed && <h2 className="text-lg font-bold tracking-wide !text-white">MediAssist</h2>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto p-1 !text-white !border-0 !bg-transparent hover:bg-white/10"
        >
          <MenuIcon />
        </Button>
      </div>

      {/* User Profile */}
      <div
        className="flex items-center px-5 py-3 border-b border-white/20 transition duration-200 !text-white hover:bg-white/10"
        style={{ backgroundColor: "#007090" }}
      >
        <Avatar className="w-10 h-10 border-2 border-white/80 shadow-md">
          <AvatarImage src={user.avatar || "/placeholder.svg"} />
          <AvatarFallback className="!text-white !border-0" style={{ backgroundColor: "#006080" }}>
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="ml-3">
            <h4 className="text-sm font-semibold truncate max-w-[150px] !text-white">{user.name}</h4>
            <span className="text-xs block mt-1 !text-white/80">
              {user.role === "admin" ? "Médecin" : "Assistante"}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <ul className="flex flex-col p-3 space-y-1 flex-grow overflow-y-auto" style={{ backgroundColor: "#007090" }}>
        {menuItems
          .filter((item) => item.show)
          .map((item) => (
            <li key={item.id}>
              <button
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all duration-200 !text-white !border-0 ${
                  isActiveRoute(item.href) ? "!text-white" : "!text-white/90 !bg-transparent hover:bg-white/10"
                }`}
                style={isActiveRoute(item.href) ? { backgroundColor: "#006080" } : {}}
              >
                <div className="w-5 h-5 flex items-center justify-center !text-white">{item.icon}</div>
                {!isCollapsed && <span className="text-sm font-medium !text-white">{item.label}</span>}
              </button>
            </li>
          ))}
      </ul>
    </div>
  )
}
