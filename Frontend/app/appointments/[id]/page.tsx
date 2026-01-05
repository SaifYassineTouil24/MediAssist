"use client"

import type React from "react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Badge } from "../../../components/ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from "../../../components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../../../components/ui/command"
import {
  Calendar,
  Clock,
  User,
  FileText,
  Pill as Pills,
  Flag as Flask,
  Save,
  Plus,
  Trash2,
  History,
  Printer as Print,
  Edit3,
  Loader2,
  ChevronsUpDown,
  Check,
} from "lucide-react"
import { cn } from "../../../lib/utils"
import { apiClient, type Appointment, type Medicament, type Analysis } from "../../../lib/api"

interface MedicationForm {
  ID_Medicament: number | string
  name?: string
  pivot: {
    dosage: string
    frequence: string
    duree: string
  }
}

interface AnalysisForm {
  ID_Analyse: number | string
  name: string
}

interface LastAppointmentData {
  date: string
  medicaments: Array<{
    id: number
    name: string
    dosage?: string
    frequence?: string
    duree?: string
  }>
  analyses: Array<{
    id: number
    name: string
  }>
  case_description?: string
}

export default function AppointmentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const appointmentId = params.id as string

  const hasFetchedRef = useRef(false)
  const isLoadingRef = useRef(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [lastAppointment, setLastAppointment] = useState<LastAppointmentData | null>(null)
  const [availableMedicaments, setAvailableMedicaments] = useState<Medicament[]>([])
  const [availableAnalyses, setAvailableAnalyses] = useState<Analysis[]>([])

  const [caseDescription, setCaseDescription] = useState("")
  const [diagnostic, setDiagnostic] = useState("")
  const [medications, setMedications] = useState<MedicationForm[]>([])
  const [analyses, setAnalyses] = useState<AnalysisForm[]>([])
  const [openMedicationDropdown, setOpenMedicationDropdown] = useState<number | null>(null)
  const [openAnalysisDropdown, setOpenAnalysisDropdown] = useState<number | null>(null)
  const [medicationSearchQuery, setMedicationSearchQuery] = useState("")

  const [vitalSigns, setVitalSigns] = useState({
    weight: "",
    pulse: "",
    temperature: "",
    blood_pressure: "",
    tall: "",
    k: null,
    p: null,
    sang: null,
    glycimide: "",
    notes: "",
  })

  const handlePrintOrdonnance = useCallback(() => {
    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        toast({
          title: "Erreur",
          description: "Impossible d'ouvrir la fenêtre d'impression",
        })
        return
      }

      const medicationsPerPage = 8
      const page1Medications = medications.slice(0, medicationsPerPage)
      const page2Medications = medications.slice(medicationsPerPage)
      const hasMultiplePages = medications.length > medicationsPerPage

      const generateMedicationList = (meds: MedicationForm[]) => {
        return meds.length > 0
          ? meds
              .map((med) => {
                const dosage = med.pivot?.dosage ? ` - ${med.pivot.dosage}` : ""
                const frequence = med.pivot?.frequence ? ` - ${med.pivot.frequence}` : ""
                const duree = med.pivot?.duree ? ` - ${med.pivot.duree}` : ""
                return `
                  <div class="medication-item">• ${med.name || "Médicament"}${dosage}${frequence}${duree}</div>
                `
              })
              .join("")
          : '<div class="medication-item" style="color: #999;">Aucun médicament prescrit</div>'
      }

      const ordonnanceHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Ordonnance</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: Arial, sans-serif; 
        font-size: 7px;
        display: flex; 
        justify-content: center; 
        align-items: center; 
        min-height: 100vh; 
      }
      .print-container { max-width: 800px; width: 100%; }
      .medication-list { display: flex; flex-direction: column; gap: 15px; }
      .medication-item { font-size: 12px; text-align: left; padding: 5px 10px; bold }
      .page-break { page-break-after: always; }
      .page { padding-top: 80px; }
      @media print {
        body { 
          padding: 20px; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          min-height: 100vh;
        }
        .print-container { max-width: 100%; }
        .page-break { page-break-after: always; }
        .page { padding-top: 80px; }
      }
    </style>
  </head>
  <body>
    <div class="print-container">
      <div class="page">
        <div class="medication-list">
          ${generateMedicationList(page1Medications)}
        </div>
      </div>
      ${
        hasMultiplePages
          ? `
        <div class="page-break"></div>
        <div class="page">
          <div class="medication-list">
            ${generateMedicationList(page2Medications)}
          </div>
        </div>
      `
          : ""
      }
    </div>
  </body>
</html>
      `

      printWindow.document.write(ordonnanceHTML)
      printWindow.document.close()

      setTimeout(() => {
        printWindow.print()
      }, 250)
    } catch (error) {
      console.error("[v0] Error printing ordonnance:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'impression de l'ordonnance",
      })
    }
  }, [medications, toast])

  const filteredMedicaments = useMemo(() => {
  if (!medicationSearchQuery) return availableMedicaments
  const query = medicationSearchQuery.toLowerCase()
  return availableMedicaments.filter(m => 
    m.name.toLowerCase().includes(query)
  )
}, [availableMedicaments, medicationSearchQuery])


  const handlePrintAnalyses = useCallback(() => {
    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        toast({
          title: "Erreur",
          description: "Impossible d'ouvrir la fenêtre d'impression",
        })
        return
      }

      const analysesHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Demandes d'Analyses</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: Arial, sans-serif; 
        padding: 40px; 
        font-size: 7px;
        display: flex; 
        justify-content: center; 
        align-items: center; 
        min-height: 100vh; 
        padding-top: px;
      }
      .print-container { max-width: 800px; width: 100%; }
      .analysis-list { display: flex; flex-direction: column; gap: 15px; }
      .analysis-item { font-size: 12px; text-align: left; padding: 5px 10px; font-weight: bold; }
      @media print {
        body { 
          padding: 20px; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          min-height: 100vh;
          padding-top: 80px;
        }
        .print-container { max-width: 100%; }
      }
    </style>
  </head>
  <body>
    <div class="print-container">
      <div class="analysis-list">
        ${
          analyses.length > 0
            ? analyses
                .map(
                  (analysis) => `
                  <div class="analysis-item">• ${analysis.name || "Analyse"}</div>
                `,
                )
                .join("")
            : '<div class="analysis-item" style="color: #999;">Aucune analyse demandée</div>'
        }
      </div>
    </div>
  </body>
</html>
`

      printWindow.document.write(analysesHTML)
      printWindow.document.close()

      setTimeout(() => {
        printWindow.print()
      }, 250)
    } catch (error) {
      console.error("[v0] Error printing analyses:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de l'impression des analyses",
      })
    }
  }, [analyses, toast])

  useEffect(() => {
    if (hasFetchedRef.current || isLoadingRef.current) {
      return
    }

    const fetchData = async () => {
      try {
        isLoadingRef.current = true
        setLoading(true)
        setError(null)

        console.log("[v0] Fetching appointment data for ID:", appointmentId)

        const response = await apiClient.getEditData(Number(appointmentId))

        console.log("[v0] getEditData response:", response)

        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to load appointment data")
        }

        let appt = response.data.appointment || response.data.data?.appointment || response.data
        const available_medicaments =
          response.data.available_medicaments ||
          response.data.data?.available_medicaments ||
          response.data.availableMedicaments ||
          []
        const available_analyses =
          response.data.available_analyses ||
          response.data.data?.available_analyses ||
          response.data.availableAnalyses ||
          []

        if (!appt || !appt.ID_RV) {
          if (response.data.ID_RV) {
            appt = response.data
          } else {
            throw new Error("Appointment data not found in response")
          }
        }

        setAppointment(appt)
        setAvailableMedicaments(available_medicaments || [])
        setAvailableAnalyses(available_analyses || [])

        const caseDescValue = appt?.case_description?.case_description || ""
        setCaseDescription(caseDescValue)

        setDiagnostic(appt?.diagnostic || "")
        setVitalSigns({
          weight: appt?.case_description?.weight?.toString() || "",
          pulse: appt?.case_description?.pulse?.toString() || "",
          temperature: appt?.case_description?.temperature?.toString() || "",
          blood_pressure: appt?.case_description?.blood_pressure || "",
          tall: appt?.case_description?.tall?.toString() || "",
          k: appt?.case_description?.k || null,
          p: appt?.case_description?.p || null,
          sang: appt?.case_description?.sang || null,
          glycimide: appt?.case_description?.glycimide?.toString() || "",
          notes: appt?.case_description?.notes || "",
        })

        if (appt?.medicaments && Array.isArray(appt.medicaments) && appt.medicaments.length > 0) {
          setMedications(
            appt.medicaments.map((med) => ({
              ID_Medicament: med?.ID_Medicament || "",
              name: med?.name || "",
              pivot: {
                dosage: med?.pivot?.dosage || "",
                frequence: med?.pivot?.frequence || "",
                duree: med?.pivot?.duree || "",
              },
            })),
          )
        }

        if (appt?.analyses && Array.isArray(appt.analyses) && appt.analyses.length > 0) {
          setAnalyses(
            appt.analyses.map((analysis) => ({
              ID_Analyse: analysis?.ID_Analyse || "",
              name: analysis?.type_analyse || "",
            })),
          )
        }

        try {
          const lastResponse = await apiClient.getLastAppointmentInfo(Number(appointmentId))

          if (lastResponse.success && lastResponse.data) {
            const rawData = lastResponse.data as any

            const date = rawData.date || rawData.appointment_date || rawData.appointment?.appointment_date || ""
            const caseDesc = rawData.case_description || rawData.caseDescription || rawData.case?.case_description || ""

            let medicaments = []
            if (Array.isArray(rawData.medicaments)) {
              medicaments = rawData.medicaments.map((med: any) => ({
                id: med.id || med.ID_Medicament,
                name: med.name,
                dosage: med.pivot?.dosage || med.dosage || "",
                frequence: med.pivot?.frequence || med.frequence || "",
                duree: med.pivot?.duree || med.duree || "",
              }))
            } else if (rawData.data?.medicaments && Array.isArray(rawData.data.medicaments)) {
              medicaments = rawData.data.medicaments.map((med: any) => ({
                id: med.id || med.ID_Medicament,
                name: med.name,
                dosage: med.pivot?.dosage || med.dosage || "",
                frequence: med.pivot?.frequence || med.frequence || "",
                duree: med.pivot?.duree || med.duree || "",
              }))
            }

            let analyses = []
            if (Array.isArray(rawData.analyses)) {
              analyses = rawData.analyses
            } else if (rawData.data?.analyses && Array.isArray(rawData.data.analyses)) {
              analyses = rawData.data.analyses
            }

            setLastAppointment({
              date,
              case_description: caseDesc,
              medicaments,
              analyses,
            })
          }
        } catch (err) {
          console.error("[v0] Error fetching last appointment:", err)
        }

        hasFetchedRef.current = true
      } catch (err) {
        console.error("[v0] Error fetching appointment data:", err)
        setError(err instanceof Error ? err.message : "Failed to load appointment data")
      } finally {
        setLoading(false)
        isLoadingRef.current = false
      }
    }

    fetchData()
  }, [appointmentId])

  const addMedication = useCallback(() => {
    const newMedication: MedicationForm = {
      ID_Medicament: "",
      name: "",
      pivot: {
        dosage: "",
        frequence: "",
        duree: "",
      },
    }
    setMedications((prev) => [...prev, newMedication])
  }, [])

  const copyMedicamentFromLast = useCallback((medicament: LastAppointmentData["medicaments"][0]) => {
    const newMedication: MedicationForm = {
      ID_Medicament: medicament.id,
      name: medicament.name,
      pivot: {
        dosage: medicament.dosage || "",
        frequence: medicament.frequence || "",
        duree: medicament.duree || "",
      },
    }
    setMedications((prev) => [...prev, newMedication])
  }, [])

  const removeMedication = useCallback((index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateMedication = useCallback(
    (index: number, field: string, value: string) => {
      setMedications((prevMedications) => {
        const updated = [...prevMedications]
        if (field === "ID_Medicament") {
          updated[index].ID_Medicament = value
          const med = availableMedicaments.find((m) => m.ID_Medicament.toString() === value)
          if (med) {
            updated[index].name = med.name
          }
        } else if (field === "name") {
          updated[index].name = value
        } else {
          updated[index].pivot = { ...updated[index].pivot, [field]: value }
        }
        return updated
      })
    },
    [availableMedicaments],
  )

  const addAnalysis = useCallback(() => {
    const newAnalysis: AnalysisForm = {
      ID_Analyse: "",
      name: "",
    }
    setAnalyses((prev) => [...prev, newAnalysis])
  }, [])

  const copyAnalysisFromLast = useCallback((analysis: LastAppointmentData["analyses"][0]) => {
    const newAnalysis: AnalysisForm = {
      ID_Analyse: analysis.id,
      name: analysis.name,
    }
    setAnalyses((prev) => [...prev, newAnalysis])
  }, [])

  const removeAnalysis = useCallback((index: number) => {
    setAnalyses((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateAnalysis = useCallback(
    (index: number, field: string, value: string) => {
      setAnalyses((prevAnalyses) => {
        const updated = [...prevAnalyses]
        if (field === "ID_Analyse") {
          updated[index].ID_Analyse = value
          const analysis = availableAnalyses.find((a) => a.ID_Analyse.toString() === value)
          if (analysis) {
            updated[index].name = analysis.type_analyse
          }
        } else {
          updated[index] = { ...updated[index], [field]: value }
        }
        return updated
      })
    },
    [availableAnalyses],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      try {
        setSaving(true)
        setError(null)

        const medicamentsData = medications
          .filter((med) => med.ID_Medicament && med.ID_Medicament !== "")
          .map((med) => ({
            ID_Medicament: Number(med.ID_Medicament),
            dosage: med.pivot.dosage,
            frequence: med.pivot.frequence,
            duree: med.pivot.duree,
          }))

        const analysesData = analyses
          .filter((analysis) => analysis.ID_Analyse && analysis.ID_Analyse !== "")
          .map((analysis) => ({
            ID_Analyse: Number(analysis.ID_Analyse),
          }))

        const requestData = {
          case_description: caseDescription || "",
          weight: vitalSigns.weight ? Number(vitalSigns.weight) : undefined,
          pulse: vitalSigns.pulse ? Number(vitalSigns.pulse) : undefined,
          temperature: vitalSigns.temperature ? Number(vitalSigns.temperature) : undefined,
          blood_pressure: vitalSigns.blood_pressure || undefined,
          tall: vitalSigns.tall ? Number(vitalSigns.tall) : undefined,
          spo2: null,
          k: vitalSigns.k || null,
          p: vitalSigns.p || null,
          sang: vitalSigns.sang || null,
          glycimide: vitalSigns.glycimide ? Number(vitalSigns.glycimide) : undefined,
          notes: vitalSigns.notes || undefined,
          diagnostic: diagnostic || "",
          medicaments: medicamentsData,
          analyses: analysesData,
        }

        const response = await apiClient.updateAppointmentDetails(Number(appointmentId), requestData)

        if (!response.success) {
          throw new Error(response.message || "Failed to save appointment details")
        }

        const cacheKey = `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"}/appointments/${appointmentId}/edit-data`
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(`api-cache-${cacheKey}`)
        }

        toast({
          title: "Succès",
          description: "Détails du rendez-vous sauvegardés avec succès!",
        })

        setTimeout(() => {
          router.push("/medecin")
        }, 500)
      } catch (err) {
        console.error("[v0] Error saving appointment:", err)
        setError(err instanceof Error ? err.message : "Failed to save appointment details")
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
          variant: "destructive",
        })
      } finally {
        setSaving(false)
      }
    },
    [appointmentId, medications, analyses, caseDescription, vitalSigns, diagnostic, toast, router],
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getBorderColor = (value: string | null) => {
    switch (value) {
      case "-+":
        return "border-green-500 bg-green-50"
      case "+":
        return "border-yellow-500 bg-yellow-50"
      case "++":
        return "border-orange-500 bg-orange-50"
      case "+++":
        return "border-red-500 bg-red-50"
      default:
        return "border-gray-300"
    }
  }

  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height || height === 0) return null
    const heightInMeters = height / 100
    return weight / (heightInMeters * heightInMeters)
  }

  const getBMIColor = useCallback((bmi: number | null) => {
    if (!bmi) return "text-gray-500"
    if (bmi < 18.5) return "text-blue-600"
    if (bmi < 25) return "text-green-600"
    if (bmi < 30) return "text-orange-600"
    return "text-red-600"
  }, [])

  const getBMIStatus = (bmi: number | null) => {
    if (!bmi) return "N/A"
    if (bmi < 18.5) return "Insuffisance pondérale"
    if (bmi < 25) return "Normal"
    if (bmi < 30) return "Surpoids"
    return "Obésité"
  }

  const getTemperatureColor = useCallback((temp: number | null) => {
    if (!temp) return "border-gray-300"
    if (temp >= 36.5 && temp <= 37.5) return "border-green-500 bg-green-50"
    if ((temp >= 36 && temp < 36.5) || (temp > 37.5 && temp <= 38)) return "border-yellow-500 bg-yellow-50"
    if ((temp >= 35.5 && temp < 36) || (temp > 38 && temp <= 38.5)) return "border-orange-500 bg-orange-50"
    return "border-red-500 bg-red-50"
  }, [])

  const getPulseColor = useCallback((pulse: number | null) => {
    if (!pulse) return "border-gray-300"
    if (pulse >= 60 && pulse <= 100) return "border-green-500 bg-green-50"
    if ((pulse >= 50 && pulse < 60) || (pulse > 100 && pulse <= 110)) return "border-yellow-500 bg-yellow-50"
    if ((pulse >= 40 && pulse < 50) || (pulse > 110 && pulse <= 120)) return "border-orange-500 bg-orange-50"
    return "border-red-500 bg-red-50"
  }, [])

  const getTensionColor = useCallback((bloodPressure: string | null) => {
    if (!bloodPressure) return "border-gray-300"

    const [systolic, diastolic] = bloodPressure.split("/").map(Number)
    if (!systolic || !diastolic) return "border-gray-300"

    if (systolic < 120 && diastolic < 80) return "border-green-500 bg-green-50"
    if (systolic >= 120 && systolic <= 129 && diastolic < 80) return "border-yellow-500 bg-yellow-50"
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89))
      return "border-orange-500 bg-orange-50"
    return "border-red-500 bg-red-50"
  }, [])

  const getGlycimideColor = useCallback((value: number | null) => {
    if (!value) return "border-gray-300"
    if (value < 70) return "border-blue-500 bg-blue-50"
    if (value >= 70 && value <= 99) return "border-green-500 bg-green-50"
    if (value >= 100 && value <= 125) return "border-orange-500 bg-orange-50"
    return "border-red-500 bg-red-50"
  }, [])

  const getGlycimideStatus = (value: number | null) => {
    if (!value) return "N/A"
    if (value < 70) return "Basse (hypoglycémie)"
    if (value >= 70 && value <= 99) return "Normale"
    if (value >= 100 && value <= 125) return "Élevée (pré-diabète)"
    return "Très élevée (diabète)"
  }

  const bmi = useMemo(
    () =>
      calculateBMI(vitalSigns.weight ? Number(vitalSigns.weight) : 0, vitalSigns.tall ? Number(vitalSigns.tall) : 0),
    [vitalSigns.weight, vitalSigns.tall],
  )


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des détails du rendez-vous...</p>
        </div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Rendez-vous introuvable"}</p>
          <Button onClick={() => router.push("/medecin")}>Retour au tableau de bord</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Détails du Rendez-vous</h1>
          <div className="flex items-center mt-2 text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium">{`${appointment.patient.first_name} ${appointment.patient.last_name}`}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(appointment.appointment_date)}
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(appointment.updated_at || appointment.appointment_date)}
          </Badge>
        </div>
      </div>

      {lastAppointment && (
        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
            <CardTitle className="text-lg text-blue-700 flex items-center">
              <History className="w-5 h-5 mr-3" />
              Rendez-vous précédent - {lastAppointment.date}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!lastAppointment.case_description &&
            (!lastAppointment.medicaments || lastAppointment.medicaments.length === 0) &&
            (!lastAppointment.analyses || lastAppointment.analyses.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Aucune donnée disponible pour le rendez-vous précédent</p>
              </div>
            ) : (
              <div className="text-sm text-gray-600 space-y-4">
                {lastAppointment.case_description && (
                  <p>
                    <strong>Notes du cas:</strong> {lastAppointment.case_description}
                  </p>
                )}
                {lastAppointment.medicaments && lastAppointment.medicaments.length > 0 && (
                  <div>
                    <strong className="block mb-2">Médicaments:</strong>
                    <div className="space-y-2">
                      {lastAppointment.medicaments.map((med) => (
                        <div key={med.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                          <span>
                            {med.name} - {med.dosage} - {med.frequence} - {med.duree}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => copyMedicamentFromLast(med)}
                            className="ml-2 bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {lastAppointment.analyses && lastAppointment.analyses.length > 0 && (
                  <div>
                    <strong className="block mb-2">Analyses:</strong>
                    <div className="space-y-2">
                      {lastAppointment.analyses.map((analysis) => (
                        <div
                          key={analysis.id}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded border"
                        >
                          <span>{analysis.name}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => copyAnalysisFromLast(analysis)}
                            className="ml-2 bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-700 flex items-center">
                <FileText className="w-5 h-5 mr-3" />
                Description du Cas
              </CardTitle>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                OBLIGATOIRE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Textarea
              value={caseDescription}
              onChange={(e) => setCaseDescription(e.target.value)}
              placeholder="Décrivez les plaintes et symptômes du patient..."
              className="min-h-[120px] resize-y"
              rows={4}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitalSigns.weight}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                  placeholder="70.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pouls (bpm)</label>
                <Input
                  type="number"
                  value={vitalSigns.pulse}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, pulse: e.target.value })}
                  placeholder="72"
                  className={`border-2 ${getPulseColor(vitalSigns.pulse ? Number(vitalSigns.pulse) : null)}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Température (°C)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitalSigns.temperature}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                  placeholder="36.6"
                  className={`border-2 ${getTemperatureColor(vitalSigns.temperature ? Number(vitalSigns.temperature) : null)}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tension artérielle</label>
                <Input
                  value={vitalSigns.blood_pressure}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, blood_pressure: e.target.value })}
                  placeholder="120/80"
                  className={`border-2 ${getTensionColor(vitalSigns.blood_pressure)}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taille (cm)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={vitalSigns.tall}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, tall: e.target.value })}
                  placeholder="175"
                />
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">IMC</label>
                <div className={`w-full px-3 py-2 border-2 rounded-md bg-gray-50 font-semibold ${getBMIColor(bmi)}`}>
                  {bmi ? bmi.toFixed(1) : "N/A"}
                </div>
                {bmi && <p className={`text-xs mt-1 font-medium ${getBMIColor(bmi)}`}>{getBMIStatus(bmi)}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Glycimide (mg/dL)</label>
                <Input
                  type="number"
                  value={vitalSigns.glycimide}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, glycimide: e.target.value })}
                  placeholder="100"
                  className={`border-2 ${getGlycimideColor(vitalSigns.glycimide ? Number(vitalSigns.glycimide) : null)}`}
                />
                {vitalSigns.glycimide && (
                  <p
                    className={`text-xs mt-1 font-medium ${getGlycimideColor(vitalSigns.glycimide ? Number(vitalSigns.glycimide) : null)}`}
                  >
                    {getGlycimideStatus(vitalSigns.glycimide ? Number(vitalSigns.glycimide) : null)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">K</label>
                <select
                  value={vitalSigns.k || ""}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, k: e.target.value || null })}
                  className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    vitalSigns.k ? getBorderColor(vitalSigns.k) : "border-gray-300 bg-gray-100 text-gray-400"
                  }`}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="-+">-+</option>
                  <option value="+">+</option>
                  <option value="++">++</option>
                  <option value="+++">+++</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">P</label>
                <select
                  value={vitalSigns.p || ""}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, p: e.target.value || null })}
                  className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    vitalSigns.p ? getBorderColor(vitalSigns.p) : "border-gray-300 bg-gray-100 text-gray-400"
                  }`}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="-+">-+</option>
                  <option value="+">+</option>
                  <option value="++">++</option>
                  <option value="+++">+++</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sang</label>
                <select
                  value={vitalSigns.sang || ""}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, sang: e.target.value || null })}
                  className={`w-full px-3 py-2 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    vitalSigns.sang ? getBorderColor(vitalSigns.sang) : "border-gray-300 bg-gray-100 text-gray-400"
                  }`}
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="-+">-+</option>
                  <option value="+">+</option>
                  <option value="++">++</option>
                  <option value="+++">+++</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <Input
                  value={vitalSigns.notes}
                  onChange={(e) => setVitalSigns({ ...vitalSigns, notes: e.target.value })}
                  placeholder="Observations supplémentaires"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnostic</label>
              <Textarea
                value={diagnostic}
                onChange={(e) => setDiagnostic(e.target.value)}
                placeholder="Diagnostic du patient..."
                className="min-h-[100px] resize-y"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-700 flex items-center">
                <Pills className="w-5 h-5 mr-3" />
                Plan de Traitement
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => router.push(`/appointments/${appointmentId}/ordonnance`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Créer Ordonnance
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-green-500 text-white hover:bg-green-600"
                  onClick={handlePrintOrdonnance}
                >
                  <Print className="w-4 h-4 mr-2" />
                  Imprimer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-4">
                {medications.map((med, medIndex) => (
  <div key={medIndex} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg border">
    <div className="col-span-12 md:col-span-5">
      <Popover
        open={openMedicationDropdown === medIndex}
        onOpenChange={(open) => {
          setOpenMedicationDropdown(open ? medIndex : null)
          if (!open) setMedicationSearchQuery("")
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-left bg-white hover:bg-gray-50"
          >
            <span className="text-gray-700">
              {med.ID_Medicament
                ? availableMedicaments.find(
                    (m) => m.ID_Medicament.toString() === med.ID_Medicament.toString(),
                  )?.name || med.name
                : "Sélectionner un médicament"}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Rechercher un médicament..." 
              value={medicationSearchQuery}
              onValueChange={setMedicationSearchQuery}
            />
            <CommandList>
              <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-y-auto">
                {filteredMedicaments.slice(0, 100).map((medicament) => (
                  <CommandItem
                    key={medicament.ID_Medicament}
                    onSelect={() => {
                      updateMedication(medIndex, "ID_Medicament", medicament.ID_Medicament.toString())
                      setOpenMedicationDropdown(null)
                      setMedicationSearchQuery("")
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        medicament.ID_Medicament.toString() === med.ID_Medicament.toString()
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {medicament.name}
                  </CommandItem>
                ))}
                {filteredMedicaments.length > 100 && (
                  <div className="px-2 py-1 text-xs text-gray-500 text-center">
                    {filteredMedicaments.length - 100} autres résultats... Affinez votre recherche
                  </div>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
    <div className="col-span-12 md:col-span-2">
      <Input
        value={med.pivot.dosage}
        onChange={(e) => updateMedication(medIndex, "dosage", e.target.value)}
        placeholder="Dosage"
      />
    </div>
    <div className="col-span-12 md:col-span-2">
      <Input
        value={med.pivot.frequence}
        onChange={(e) => updateMedication(medIndex, "frequence", e.target.value)}
        placeholder="Fréquence"
      />
    </div>
    <div className="col-span-12 md:col-span-2">
      <Input
        value={med.pivot.duree}
        onChange={(e) => updateMedication(medIndex, "duree", e.target.value)}
        placeholder="Durée"
      />
    </div>
    <div className="col-span-12 md:col-span-1 flex items-center justify-center">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => removeMedication(medIndex)}
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  </div>
))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addMedication}
                className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un Médicament
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-700 flex items-center">
                <Flask className="w-5 h-5 mr-3" />
                Demandes d'Analyses
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-green-500 text-white hover:bg-green-600"
                onClick={handlePrintAnalyses}
              >
                <Print className="w-4 h-4 mr-2" />
                Imprimer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-3">
                {analyses.map((analysis, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                    <div className="flex-grow">
                      <Popover
                        open={openAnalysisDropdown === index}
                        onOpenChange={(open) => {
                          setOpenAnalysisDropdown(open ? index : null)
                        }}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-left bg-white hover:bg-gray-50"
                          >
                            <span className="text-gray-700">
                              {analysis.ID_Analyse
                                ? availableAnalyses.find(
                                    (a) => a.ID_Analyse.toString() === analysis.ID_Analyse.toString(),
                                  )?.type_analyse || analysis.name
                                : "Sélectionner une analyse"}
                            </span>
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Rechercher une analyse..." />
                            <CommandList>
                              <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                              <CommandGroup>
                                {availableAnalyses.map((availableAnalysis) => (
                                  <CommandItem
                                    key={availableAnalysis.ID_Analyse}
                                    onSelect={() => {
                                      updateAnalysis(index, "ID_Analyse", availableAnalysis.ID_Analyse.toString())
                                      setOpenAnalysisDropdown(null)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        availableAnalysis.ID_Analyse.toString() === analysis.ID_Analyse.toString()
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {availableAnalysis.type_analyse}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnalysis(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addAnalysis}
                className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une Analyse
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/medecin")}>
            Annuler
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}