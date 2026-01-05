"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface EditAppointmentModalProps {
  appointmentId: number | null
  onClose: () => void
  onSuccess: () => void
}

export default function EditAppointmentModal({ appointmentId, onClose, onSuccess }: EditAppointmentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
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

  const fetchAppointmentData = async () => {
    try {
      if (!appointmentId) return

      const result = await apiClient.getEditData(appointmentId)

      if (result.success && result.data?.appointment) {
        const appointment = result.data.appointment
        let date = ""
        let time = ""

        if (appointment.appointment_date) {
          const dateObj = new Date(appointment.appointment_date)
          date = dateObj.toISOString().split("T")[0]
          time = dateObj.toISOString().split("T")[1]?.substring(0, 5) || ""
        }

        setAppointmentFormData({
          patient_id: appointment.ID_patient,
          type: appointment.type as "Consultation" | "Control",
          appointment_date: date,
          appointment_time: time,
          notes: appointment.notes || "",
        })
        setError("")
        setLoading(false)
      } else {
        setError("Impossible de charger les données du rendez-vous")
        setLoading(false)
      }
    } catch (err) {
      console.error("[v0] Error fetching appointment:", err)
      setError("Erreur lors du chargement des données")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (appointmentId) {
      setIsOpen(true)
      setLoading(true)
      setError("")
      setAppointmentFormData({
        patient_id: 0,
        type: "Consultation",
        appointment_date: "",
        appointment_time: "",
        notes: "",
      })
      fetchAppointmentData()
    }
  }, [appointmentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      if (!appointmentId) return

      const result = await apiClient.updateAppointment(appointmentId, appointmentFormData)

      if (result.success) {
        toast({
          title: "Succès",
          description: "Rendez-vous mis à jour avec succès",
        })
        
        // Fermer le modal d'abord
        setIsOpen(false)
        
        // Appeler onSuccess qui va faire le refetch
        onSuccess()
        
        // Dispatcher l'événement APRÈS pour que les autres composants soient notifiés
        // Utiliser un petit délai pour laisser le refetch se terminer
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("appointmentUpdated", {
              detail: { appointmentId, updated: true },
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
        {loading ? (
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