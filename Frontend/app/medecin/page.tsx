"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient, type Appointment } from "@/lib/api"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Loader2, AlertCircle, RefreshCw, DollarSign, TrendingUp, Clock, Users } from "lucide-react"

interface DashboardData {
  totalPatients: number
  todayPatients: number
  activeAppointments: number
  currentPatient: Appointment | null
  waitingPatients: Appointment[]
  preparingPatients: Appointment[]
  completedPatients: Appointment[]
  cancelledPatients: Appointment[]
  upcomingAppointments: Appointment[]
  averageConsultationTime: number
  dailyRevenue: number
  completedRevenue: number
  pendingRevenue: number
  paymentBreakdown: {
    cash: number
    card: number
    cheque: number
    mutuelle: number
    pending: number
  }
  revenueByType: {
    [key: string]: { count: number; amount: number }
  }
  statusCounts: {
    waiting: number
    preparing: number
    consulting: number
    completed: number
    cancelled: number
  }
}

const DoctorDashboard = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showMoreWaiting, setShowMoreWaiting] = useState(false)
  const [showMorePreparing, setShowMorePreparing] = useState(false)
  const [showMoreCompleted, setShowMoreCompleted] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    const response = await apiClient.getMedecinDashboard()

    if (response.success && response.data) {
      const rawData = response.data as any
      const actualData = rawData.data || rawData

      const transformedData: DashboardData = {
        totalPatients: Number(actualData.totalPatients || 0),
        todayPatients: Number(actualData.todayPatients || 0),
        activeAppointments: Number(actualData.activeAppointments || 0),
        currentPatient: actualData.currentPatient || null,
        waitingPatients: actualData.waitingPatients || [],
        preparingPatients: actualData.preparingPatients || [],
        completedPatients: actualData.completedTodayPatients || actualData.completedPatients || [],
        cancelledPatients: actualData.cancelledTodayPatients || actualData.cancelledPatients || [],
        upcomingAppointments: actualData.upcomingAppointments || [],
        averageConsultationTime: Number(actualData.averageConsultationTime || 0),
        dailyRevenue: Number(actualData.dailyRevenue || 0),
        completedRevenue: Number(actualData.completedRevenue || 0),
        pendingRevenue: Number(actualData.pendingRevenue || 0),
        paymentBreakdown: actualData.paymentBreakdown || {
          cash: 0,
          card: 0,
          cheque: 0,
          mutuelle: 0,
          pending: 0,
        },
        revenueByType: actualData.revenueByType || {},
        statusCounts: actualData.statusCounts || {
          waiting: actualData.waitingPatients?.length || 0,
          preparing: actualData.preparingPatients?.length || 0,
          consulting: actualData.currentPatient ? 1 : 0,
          completed: actualData.completedTodayPatients?.length || actualData.completedPatients?.length || 0,
          cancelled: actualData.cancelledTodayPatients?.length || actualData.cancelledPatients?.length || 0,
        },
      }

      setData(transformedData)
    } else {
      setError(response.message || "Impossible de se connecter au serveur backend")
    }
    setLoading(false)
  }

  const handleNavigatePatient = async (direction: "next" | "previous") => {
    const response = await apiClient.navigatePatient(direction)
    if (response.success) {
      await fetchDashboardData()
    }
  }

  const handleCompleteConsultation = async () => {
    if (!data?.currentPatient) return
    const response = await apiClient.updateMedecinStatus(data.currentPatient.ID_RV, "Terminé")
    if (response.success) {
      await fetchDashboardData()
    }
  }

  const handleCancelConsultation = async () => {
    if (!data?.currentPatient) return
    const response = await apiClient.updateMedecinStatus(data.currentPatient.ID_RV, "Annulé")
    if (response.success) {
      await fetchDashboardData()
    }
  }

  const handleViewPatient = (patientId: number) => {
    router.push(`/patients/${patientId}`)
  }

  const handleViewAppointment = (appointmentId: number) => {
    router.push(`/appointments/${appointmentId}`)
  }

  const handleReturnToConsultation = async (appointmentId: number) => {
    const response = await apiClient.returnToConsultation(appointmentId)
    if (response.success) {
      await fetchDashboardData()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen p-6">
        <Card className="max-w-2xl w-full border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertCircle className="w-6 h-6 mr-2" />
              Erreur de connexion au serveur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <p className="text-red-800 font-medium mb-2">Message d'erreur:</p>
              <p className="text-red-600">{error}</p>
            </div>
            <Button onClick={fetchDashboardData} className="w-full" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    )
  }

  const statusChartData = [
    { name: "En attente", value: data.statusCounts.waiting, color: "#fbbf24" },
    { name: "En préparation", value: data.statusCounts.preparing, color: "#fb923c" },
    { name: "Annulé", value: data.statusCounts.cancelled, color: "#ef4444" },
    { name: "Terminé", value: data.statusCounts.completed, color: "#22c55e" },
  ].filter((item) => item.value > 0)

  const paymentChartData = Object.entries(data.paymentBreakdown)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name:
        key === "cash"
          ? "Espèces"
          : key === "card"
            ? "Carte"
            : key === "cheque"
              ? "Chèque"
              : key === "mutuelle"
                ? "Mutuelle"
                : "En attente",
      amount: value,
      color:
        key === "cash"
          ? "#22c55e"
          : key === "card"
            ? "#3b82f6"
            : key === "cheque"
              ? "#f59e0b"
              : key === "mutuelle"
                ? "#8b5cf6"
                : "#ef4444",
    }))

  const revenueByTypeData = Object.entries(data.revenueByType || {})
    .filter(([_, info]) => info.count > 0)
    .map(([type, info]) => ({
      type,
      count: info.count,
      amount: info.amount,
    }))

  const PatientIcon = ({ gender }: { gender?: string }) => (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
      {gender === "Female" ? (
        <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM4 14a6 6 0 1112 0v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM4 14a6 6 0 1112 0v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1z" />
        </svg>
      )}
    </div>
  )

  const PatientItem = ({ appointment, showTime = true }: { appointment: Appointment; showTime?: boolean }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        <PatientIcon gender={appointment.patient.gender} />
        <div>
          <div className="font-medium text-gray-900">{`${appointment.patient.first_name} ${appointment.patient.last_name}`}</div>
          {showTime && <div className="text-sm text-gray-500">{appointment.type}</div>}
        </div>
      </div>
      <div className="flex space-x-2">
        <Button size="sm" variant="outline" onClick={() => handleViewPatient(appointment.ID_patient)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </Button>
        <Button size="sm" variant="default" onClick={() => handleViewAppointment(appointment.ID_RV)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Top Statistics Cards with Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Revenus du jour</p>
                  <p className="text-3xl font-bold text-green-900">{data.dailyRevenue.toFixed(2)} DH</p>
                  <p className="text-green-600 text-xs mt-1">Encaissé: {data.completedRevenue.toFixed(2)} DH</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Patients du jour</p>
                  <p className="text-3xl font-bold text-blue-900">{data.todayPatients || 0}</p>
                  <p className="text-blue-600 text-xs">Terminés: {data.statusCounts.completed}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Consultations actives</p>
                  <p className="text-3xl font-bold text-purple-900">{data.activeAppointments || 0}</p>
                  <p className="text-purple-600 text-xs">En attente: {data.statusCounts.waiting}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 text-sm font-medium">Temps moyen</p>
                  <p className="text-3xl font-bold text-orange-900">{data.averageConsultationTime}</p>
                  <p className="text-orange-600 text-xs">minutes / consultation</p>
                </div>
                <Clock className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
  <CardHeader>
    <CardTitle className="flex items-center">
      <DollarSign className="w-5 h-5 mr-2 text-green-600" />
      Derniers paiements
    </CardTitle>
  </CardHeader>

  <CardContent>
    {data.completedPatients.length > 0 ? (
      <div className="space-y-3">
        {data.completedPatients
          .slice(0, 6) // show 6 latest
          .map((appointment) => (
            <div
              key={appointment.ID_RV}
              className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200"
            >
              <div className="flex items-center space-x-3">
                <PatientIcon gender={appointment.patient.gender} />

                <div>
                  <div className="font-medium text-gray-900">
                    {appointment.patient.first_name} {appointment.patient.last_name}
                  </div>

                  <div className="text-xs text-gray-500">
                    {appointment.type} • {appointment.mutuelle || "Espèces"}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-green-700">
                  {Number(appointment.payement || 0).toFixed(2)} DH
                </div>

                <div className="text-xs text-gray-500">
                  {new Date(appointment.updated_at).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}
      </div>
    ) : (
      <div className="h-40 flex items-center justify-center text-gray-500">
        Aucun paiement aujourd'hui
      </div>
    )}
  </CardContent>
</Card>

        </div>

        {/* Patient Status Chart and Current Patient */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 118-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                Répartition des patients du jour
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusChartData.length > 0 ? (
                <ChartContainer
                  config={{
                    waiting: { label: "En salle d'attente", color: "#fbbf24" },
                    preparing: { label: "En préparation", color: "#fb923c" },
                    cancelled: { label: "Annulé", color: "#ef4444" },
                    completed: { label: "Terminé", color: "#22c55e" },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Aucune donnée disponible pour aujourd'hui
                </div>
              )}
            </CardContent>
          </Card>
          

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2v1a2 2 0 002 2h6a2 2 0 002-2V3a2 2 0 012 2v1.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 014 11.5V5zM7.5 6.5a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                Patient en consultation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.currentPatient ? (
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{`${data.currentPatient.patient.first_name} ${data.currentPatient.patient.last_name}`}</h3>
                  <p className="text-gray-600">
                    {data.currentPatient.patient.birth_day
                      ? `${new Date().getFullYear() - new Date(data.currentPatient.patient.birth_day).getFullYear()} ans`
                      : "N/A"}{" "}
                    • {data.currentPatient.patient.gender === "Female" ? "Femme" : "Homme"}
                  </p>
                  <div className="flex justify-center space-x-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNavigatePatient("previous")}
                      className="flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Précédent
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleCompleteConsultation}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Terminer
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleCancelConsultation}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Annuler
                    </Button>
                  </div>
                  <div className="flex justify-center space-x-2 mt-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleViewPatient(data.currentPatient!.ID_patient)}
                    >
                      Voir Patient
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleViewAppointment(data.currentPatient!.ID_RV)}
                    >
                      Voir RDV
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">Aucun patient en consultation</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Patient Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              Détails du Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-primary">Informations personnelles</h3>
                <div className="space-y-2 text-sm">
                  {data.currentPatient ? (
                    <>
                      <p>
                        <span className="font-medium">Nom:</span>{" "}
                        {`${data.currentPatient.patient.first_name} ${data.currentPatient.patient.last_name}`}
                      </p>
                      <p>
                        <span className="font-medium">Âge:</span>{" "}
                        {data.currentPatient.patient.birth_day
                          ? `${new Date().getFullYear() - new Date(data.currentPatient.patient.birth_day).getFullYear()} ans`
                          : "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Sexe:</span>{" "}
                        {data.currentPatient.patient.gender === "Female" ? "Femme" : "Homme"}
                      </p>
                      <p>
                        <span className="font-medium">Téléphone:</span> {data.currentPatient.patient.phone_num || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">CIN:</span> {data.currentPatient.patient.CIN || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Mutuelle:</span> {data.currentPatient.patient.mutuelle || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Allergies:</span>{" "}
                        {data.currentPatient.patient.allergies || "Aucune"}
                      </p>
                      <p>
                        <span className="font-medium">Maladies chroniques:</span>{" "}
                        {data.currentPatient.patient.chronic_conditions || "Aucune"}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">Aucun patient sélectionné</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-primary flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Consultation Actuelle
                </h3>
                <div className="space-y-2 text-sm">
                  {data.currentPatient ? (
                    <>
                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(data.currentPatient.appointment_date).toLocaleDateString("fr-FR")}
                      </p>
                      <p>
                        <span className="font-medium">Type:</span> {data.currentPatient.type}
                      </p>
                      <p>
                        <span className="font-medium">Statut:</span> {data.currentPatient.status}
                      </p>
                      {data.currentPatient.Diagnostic && (
                        <p>
                          <span className="font-medium">Diagnostic:</span> {data.currentPatient.Diagnostic}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">Aucune consultation en cours</p>
                  )}
                </div>
                <div className="mt-4 text-center">
                  {data.currentPatient && (
                    <Button variant="default" onClick={() => handleViewAppointment(data.currentPatient!.ID_RV)}>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 12a2 2 0 100-4 2 2 0 010 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Voir l'historique complet
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Lists by Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Waiting Room */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Salle d'attente
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {data.waitingPatients.length}
                </span>
              </CardTitle>
              {data.waitingPatients.length > 4 && (
                <Button variant="ghost" size="sm" onClick={() => setShowMoreWaiting(!showMoreWaiting)}>
                  {showMoreWaiting ? "Voir moins" : "Voir plus"}
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform ${showMoreWaiting ? "rotate-180" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.waitingPatients.length > 0 ? (
                  data.waitingPatients
                    .slice(0, showMoreWaiting ? undefined : 4)
                    .map((appointment) => <PatientItem key={appointment.ID_RV} appointment={appointment} />)
                ) : (
                  <p className="text-center text-gray-500 py-4">Aucun patient en attente</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Patients in Preparation */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                En préparation
                <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {data.preparingPatients.length}
                </span>
              </CardTitle>
              {data.preparingPatients.length > 3 && (
                <Button variant="ghost" size="sm" onClick={() => setShowMorePreparing(!showMorePreparing)}>
                  {showMorePreparing ? "Voir moins" : "Voir plus"}
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform ${showMorePreparing ? "rotate-180" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.preparingPatients.length > 0 ? (
                  data.preparingPatients
                    .slice(0, showMorePreparing ? undefined : 3)
                    .map((appointment) => <PatientItem key={appointment.ID_RV} appointment={appointment} />)
                ) : (
                  <p className="text-center text-gray-500 py-4">Aucun patient en préparation</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Completed Patients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Terminés aujourd'hui
                <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {data.completedPatients.length}
                </span>
              </CardTitle>
              {data.completedPatients.length > 2 && (
                <Button variant="ghost" size="sm" onClick={() => setShowMoreCompleted(!showMoreCompleted)}>
                  {showMoreCompleted ? "Voir moins" : "Voir plus"}
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform ${showMoreCompleted ? "rotate-180" : ""}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.completedPatients.length > 0 ? (
                  data.completedPatients.slice(0, showMoreCompleted ? undefined : 2).map((appointment) => (
                    <div key={appointment.ID_RV} className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200">
                        <div className="flex items-center space-x-3">
                          <PatientIcon gender={appointment.patient.gender} />
                          <div>
                            <div className="font-medium text-gray-900">{`${appointment.patient.first_name} ${appointment.patient.last_name}`}</div>
                            <div className="text-sm text-green-600 font-medium">✓ Consultation terminée</div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewPatient(appointment.ID_patient)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </Button>
                          <Button size="sm" variant="default" onClick={() => handleViewAppointment(appointment.ID_RV)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => handleReturnToConsultation(appointment.ID_RV)}
                      >
                        Retourner à la consultation
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">Aucune consultation terminée</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard