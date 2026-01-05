"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Icons
const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m11-7a4 4 0 0 1 0 8m0-8a4 4 0 0 0 0 8" />
  </svg>
)

const UserPlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

interface Nurse {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  status: "active" | "inactive"
  avatar?: string
}

export default function SettingsPage() {
  // Preferences state
  const [preferences, setPreferences] = useState({
    showPatientPhotos: true,
    showAppointmentReminders: true,
    showMedicationAlerts: true,
    showVitalSignsAlerts: false,
    autoSaveNotes: true,
    darkMode: false,
    emailNotifications: true,
    smsNotifications: false,
    language: "fr",
  })

  // Nurses state
  const [nurses, setNurses] = useState<Nurse[]>([
    {
      id: "1",
      name: "Marie Dubois",
      email: "marie.dubois@mediassist.com",
      phone: "+33 1 23 45 67 89",
      specialization: "Soins généraux",
      status: "active",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Sophie Martin",
      email: "sophie.martin@mediassist.com",
      phone: "+33 1 98 76 54 32",
      specialization: "Pédiatrie",
      status: "active",
    },
    {
      id: "3",
      name: "Claire Bernard",
      email: "claire.bernard@mediassist.com",
      phone: "+33 1 11 22 33 44",
      specialization: "Cardiologie",
      status: "inactive",
    },
  ])

  // Add nurse form state
  const [isAddNurseOpen, setIsAddNurseOpen] = useState(false)
  const [newNurse, setNewNurse] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    status: "active" as "active" | "inactive",
  })

  const handlePreferenceChange = (key: string, value: boolean | string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleAddNurse = () => {
    if (newNurse.name && newNurse.email) {
      const nurse: Nurse = {
        id: Date.now().toString(),
        ...newNurse,
      }
      setNurses((prev) => [...prev, nurse])
      setNewNurse({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        status: "active",
      })
      setIsAddNurseOpen(false)
    }
  }

  const handleDeleteNurse = (id: string) => {
    setNurses((prev) => prev.filter((nurse) => nurse.id !== id))
  }

  const handleToggleNurseStatus = (id: string) => {
    setNurses((prev) =>
      prev.map((nurse) =>
        nurse.id === id ? { ...nurse, status: nurse.status === "active" ? "inactive" : "active" } : nurse,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pl-64">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon />
            Paramètres
          </h1>
          <p className="text-gray-600 mt-2">Gérez vos préférences et les comptes infirmières</p>
        </div>

        <Tabs defaultValue="preferences" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
            <TabsTrigger value="nurses">Gestion des Infirmières</TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences d'affichage</CardTitle>
                <CardDescription>Personnalisez l'affichage des informations dans l'application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Afficher les photos des patients</Label>
                    <p className="text-sm text-muted-foreground">
                      Affiche les photos de profil dans la liste des patients
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showPatientPhotos}
                    onCheckedChange={(checked) => handlePreferenceChange("showPatientPhotos", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Rappels de rendez-vous</Label>
                    <p className="text-sm text-muted-foreground">Affiche les notifications de rappel de rendez-vous</p>
                  </div>
                  <Switch
                    checked={preferences.showAppointmentReminders}
                    onCheckedChange={(checked) => handlePreferenceChange("showAppointmentReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertes médicaments</Label>
                    <p className="text-sm text-muted-foreground">
                      Affiche les alertes pour les interactions médicamenteuses
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showMedicationAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange("showMedicationAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertes signes vitaux</Label>
                    <p className="text-sm text-muted-foreground">Affiche les alertes pour les signes vitaux anormaux</p>
                  </div>
                  <Switch
                    checked={preferences.showVitalSignsAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange("showVitalSignsAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Sauvegarde automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Sauvegarde automatiquement les notes et observations
                    </p>
                  </div>
                  <Switch
                    checked={preferences.autoSaveNotes}
                    onCheckedChange={(checked) => handlePreferenceChange("autoSaveNotes", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configurez vos préférences de notification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">Recevez des notifications par email</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications SMS</Label>
                    <p className="text-sm text-muted-foreground">Recevez des notifications par SMS</p>
                  </div>
                  <Switch
                    checked={preferences.smsNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange("smsNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Langue et région</CardTitle>
                <CardDescription>Configurez la langue de l'interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => handlePreferenceChange("language", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionnez une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button>Sauvegarder les préférences</Button>
            </div>
          </TabsContent>

          <TabsContent value="nurses" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestion des Infirmières</CardTitle>
                  <CardDescription>Ajoutez et gérez les comptes des infirmières</CardDescription>
                </div>
                <Dialog open={isAddNurseOpen} onOpenChange={setIsAddNurseOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <UserPlusIcon />
                      Ajouter une infirmière
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Ajouter une nouvelle infirmière</DialogTitle>
                      <DialogDescription>
                        Remplissez les informations pour créer un nouveau compte infirmière.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nom complet</Label>
                        <Input
                          id="name"
                          value={newNurse.name}
                          onChange={(e) => setNewNurse((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Marie Dubois"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newNurse.email}
                          onChange={(e) => setNewNurse((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="marie.dubois@mediassist.com"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={newNurse.phone}
                          onChange={(e) => setNewNurse((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="specialization">Spécialisation</Label>
                        <Input
                          id="specialization"
                          value={newNurse.specialization}
                          onChange={(e) => setNewNurse((prev) => ({ ...prev, specialization: e.target.value }))}
                          placeholder="Soins généraux"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Statut</Label>
                        <Select
                          value={newNurse.status}
                          onValueChange={(value: "active" | "inactive") =>
                            setNewNurse((prev) => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleAddNurse}>
                        Ajouter l'infirmière
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nurses.map((nurse) => (
                    <div key={nurse.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={nurse.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {nurse.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{nurse.name}</h4>
                          <p className="text-sm text-gray-600">{nurse.email}</p>
                          <p className="text-sm text-gray-500">{nurse.specialization}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={nurse.status === "active" ? "default" : "secondary"}>
                          {nurse.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleToggleNurseStatus(nurse.id)}>
                          <EditIcon />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteNurse(nurse.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
