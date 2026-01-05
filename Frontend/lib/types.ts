export interface Patient {
  ID_patient: number
  name: string
  phone_num?: string
  notes?: string
  archived: boolean
}

export interface Appointment {
  ID_RV: number
  ID_patient: number
  patient: Patient
  appointment_date: string
  type: string
  status: string
  diagnostic?: string
  mutuelle: boolean
  payement?: number
  notes?: string
  caseDescription?: CaseDescription
  medicaments?: Medicament[]
  analyses?: Analysis[]
}

export interface CaseDescription {
  case_description?: string
  weight?: number
  pulse?: number
  temperature?: number
  blood_pressure?: string
  tall?: number
  spo2?: number
  k?: string
  p?: string
  sang?: string
  notes?: string
}

export interface Medicament {
  ID_Medicament: number
  name: string
  pivot?: {
    dosage?: string
    frequence?: string
    duree?: string
  }
}

export interface Analysis {
  ID_Analyse: number
  type_analyse: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export type AppointmentStatus =
  | "Programmé"
  | "Salle dattente"
  | "En préparation"
  | "En consultation"
  | "Terminé"
  | "Annulé"

export type AppointmentStatusKey = "scheduled" | "waiting" | "preparing" | "consulting" | "completed" | "canceled"
