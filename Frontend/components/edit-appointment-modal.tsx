"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { apiClient, Appointment } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface EditAppointmentModalProps {
  appointment: Appointment | null
  onClose: () => void
  onSuccess: () => void
}

export default function EditAppointmentModal({ appointment, onClose, onSuccess }: EditAppointmentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const [appointmentFormData, setAppointmentFormData] = useState({
    patient_id: 0,
    type: "Consultation" as "Consultation" | "Control",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  })

  useEffect(() => {
    if (appointment) {
      setIsOpen(true)
      setError("")

      let date = ""
      let time = ""

      if (appointment.appointment_date) {
        const dateObj = new Date(appointment.appointment_date)
        date = dateObj.toISOString().split("T")[0]
        // Extract time manually to avoid timezone issues/zero padding if needed, 
        // but toISOString() is usually consistent for UTC. 
        // If the date string from backend is "YYYY-MM-DD HH:mm:ss", doing new Date() might be tricky depending on browser.
        // Let's stick to simple string parsing if it matches standard format, or Date object if robust.
        // Existing logic used Date object, let's keep it but formatted carefully.
        // Or better: use the date string directly if it's ISO like. 
        // Let's trust the existing logic's intent but maybe make it safer?
        // Actually, let's keep the existing logic exactly as it was which worked:
        try {
          date = dateObj.toISOString().split("T")[0]
          time = dateObj.toISOString().split("T")[1]?.substring(0, 5) || ""
        } catch (e) {
          console.error("Error parsing date", e)
        }
      }

      setAppointmentFormData({
        patient_id: appointment.ID_patient,
        type: appointment.type as "Consultation" | "Control",
        appointment_date: date,
        appointment_time: time,
        notes: appointment.notes || "",
      })
    }
  }, [appointment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      if (!appointment) return

      const result = await apiClient.updateAppointment(appointment.ID_RV, appointmentFormData)

      if (result.success) {
        toast({
          title: "Succès",
          description: "Rendez-vous mis à jour avec succès",
        })

        setIsOpen(false)
        onSuccess()

        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("appointmentUpdated", {
              detail: { appointmentId: appointment.ID_RV, updated: true },
            })
          )
        }, 100)
      } else {
        setError(result.message || "Erreur lors de la mise à jour")
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de la mise à jour",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("[v0] Update error:", err)
      setError("Erreur lors de la mise à jour du rendez-vous")
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du rendez-vous",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setError("")
    setAppointmentFormData({
      patient_id: 0,
      type: "Consultation",
      appointment_date: "",
      appointment_time: "",
      notes: "",
    })
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Modifier le Rendez-vous</DialogTitle>
          <DialogDescription className="sr-only">Formulaire de modification de rendez-vous</DialogDescription>
        </DialogHeader>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        {false ? (
          <div className="py-8 text-center text-gray-500">Chargement...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointmentDateEdit" className="text-gray-700">
                  Date
                </Label>
                <Input
                  id="appointmentDateEdit"
                  type="date"
                  value={appointmentFormData.appointment_date}
                  onChange={(e) => setAppointmentFormData({ ...appointmentFormData, appointment_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="appointmentTimeEdit" className="text-gray-700 block mb-2">
                  Heure
                </Label>
                <Input
                  id="appointmentTimeEdit"
                  type="time"
                  value={appointmentFormData.appointment_time}
                  onChange={(e) => setAppointmentFormData({ ...appointmentFormData, appointment_time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="appointmentTypeEdit" className="text-gray-700">
                Type de consultation
              </Label>
              <Select
                value={appointmentFormData.type}
                onValueChange={(value: "Consultation" | "Control") =>
                  setAppointmentFormData({ ...appointmentFormData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Control">Contrôle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="appointmentNotesEdit" className="text-gray-700">
                Notes
              </Label>
              <Textarea
                id="appointmentNotesEdit"
                placeholder="Notes additionnelles..."
                value={appointmentFormData.notes}
                onChange={(e) => setAppointmentFormData({ ...appointmentFormData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                Annuler
              </Button>
              <Button type="submit" className="bg-[#007090] text-white hover:bg-[#006080]" disabled={submitting}>
                {submitting ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}