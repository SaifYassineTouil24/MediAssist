"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Users, Settings as SettingsIcon, Save, Plus, Trash2, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "nurse"
  })

  useEffect(() => {
    fetchSettings()
    fetchUsers()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await apiClient.getUserSettings()
      if (response.success) {
        setSettings(response.data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await apiClient.getUsers()
      if (response.success && response.data) {
        // Handle nested data structure
        setUsers(Array.isArray(response.data) ? response.data : response.data.data || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await apiClient.updateUserSettings(settings)
      if (response.success) {
        toast({
          title: "Succès",
          description: "Paramètres enregistrés avec succès",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement des paramètres",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      const response = await apiClient.createUser(newUser)
      if (response.success) {
        toast({
          title: "Succès",
          description: "Utilisateur créé avec succès",
        })
        setShowUserDialog(false)
        setNewUser({ name: "", email: "", password: "", role: "nurse" })
        fetchUsers()
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de l'utilisateur",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return

    try {
      const response = await apiClient.deleteUser(id)
      if (response.success) {
        toast({
          title: "Succès",
          description: "Utilisateur supprimé avec succès",
        })
        fetchUsers()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      })
    }
  }

  const handleUserClick = (user: any) => {
    setSelectedUser(user)
    setShowPermissionsDialog(true)
  }

  const availableRoutes = [
    { id: "dashboard", label: "Tableau de Bord" },
    { id: "medecin", label: "Espace Médecin" },
    { id: "patients", label: "Patients" },
    { id: "medicaments", label: "Médicaments" },
    { id: "analyses", label: "Analyses" },
    { id: "statistics", label: "Statistiques" },
    { id: "settings", label: "Paramètres" },
  ]

  const togglePermission = (routeId: string) => {
    if (!selectedUser) return

    const currentPermissions = selectedUser.permissions ? JSON.parse(selectedUser.permissions) : []
    const newPermissions = currentPermissions.includes(routeId)
      ? currentPermissions.filter((p: string) => p !== routeId)
      : [...currentPermissions, routeId]

    setSelectedUser({
      ...selectedUser,
      permissions: JSON.stringify(newPermissions)
    })
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return

    try {
      const permissions = selectedUser.permissions ? JSON.parse(selectedUser.permissions) : []
      const response = await apiClient.updateUserPermissions(selectedUser.id, permissions)

      if (response.success) {
        toast({
          title: "Succès",
          description: "Permissions mises à jour avec succès",
        })
        setShowPermissionsDialog(false)
        fetchUsers()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour des permissions",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Paramètres</h1>
        <p className="text-gray-500 mt-2">Gérez vos préférences et utilisateurs</p>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="preferences">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Préférences
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
        </TabsList>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          {/* Case Description Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration de la Consultation</CardTitle>
              <CardDescription>Choisissez les paramètres médicaux à afficher lors de la consultation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      T
                    </div>
                    <Label className="cursor-pointer">Taille (cm)</Label>
                  </div>
                  <Switch
                    checked={settings?.show_height ?? true}
                    onCheckedChange={(checked) => setSettings({ ...settings, show_height: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                      P
                    </div>
                    <Label className="cursor-pointer">Poids (kg)</Label>
                  </div>
                  <Switch
                    checked={settings?.show_weight ?? true}
                    onCheckedChange={(checked) => setSettings({ ...settings, show_weight: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                      FC
                    </div>
                    <Label className="cursor-pointer">Fréquence Cardiaque (bpm)</Label>
                  </div>
                  <Switch
                    checked={settings?.show_pulse ?? true}
                    onCheckedChange={(checked) => setSettings({ ...settings, show_pulse: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                      °C
                    </div>
                    <Label className="cursor-pointer">Température (°C)</Label>
                  </div>
                  <Switch
                    checked={settings?.show_temperature ?? true}
                    onCheckedChange={(checked) => setSettings({ ...settings, show_temperature: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                      TA
                    </div>
                    <Label className="cursor-pointer">Tension Artérielle</Label>
                  </div>
                  <Switch
                    checked={settings?.show_pressure ?? true}
                    onCheckedChange={(checked) => setSettings({ ...settings, show_pressure: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold text-xs">
                      G
                    </div>
                    <Label className="cursor-pointer">Glycémie</Label>
                  </div>
                  <Switch
                    checked={settings?.show_glycemia ?? true}
                    onCheckedChange={(checked) => setSettings({ ...settings, show_glycemia: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Gérez vos préférences de notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-gray-500">Recevoir des emails pour les nouveaux rendez-vous</p>
                </div>
                <Switch
                  checked={settings?.email_notifications ?? true}
                  onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Rappels SMS aux patients</Label>
                  <p className="text-sm text-gray-500">Envoyer des rappels automatiques</p>
                </div>
                <Switch
                  checked={settings?.sms_reminders ?? true}
                  onCheckedChange={(checked) => setSettings({ ...settings, sms_reminders: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Timing des rappels</Label>
                <Select
                  value={settings?.reminder_timing || "1_day"}
                  onValueChange={(value) => setSettings({ ...settings, reminder_timing: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2_hours">2 heures avant</SelectItem>
                    <SelectItem value="1_day">1 jour avant</SelectItem>
                    <SelectItem value="2_days">2 jours avant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Affichage</CardTitle>
              <CardDescription>Personnalisez l'interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select
                    value={settings?.language || "fr"}
                    onValueChange={(value) => setSettings({ ...settings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Format de date</Label>
                  <Select
                    value={settings?.date_format || "DD/MM/YYYY"}
                    onValueChange={(value) => setSettings({ ...settings, date_format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Format d'heure</Label>
                  <Select
                    value={settings?.time_format || "24h"}
                    onValueChange={(value) => setSettings({ ...settings, time_format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 heures</SelectItem>
                      <SelectItem value="12h">12 heures (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer les paramètres
            </Button>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestion des Utilisateurs</CardTitle>
                  <CardDescription>Ajoutez et gérez les infirmières et le personnel</CardDescription>
                </div>
                <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Nouvel utilisateur
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Nom complet</Label>
                        <Input
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          placeholder="Jean Dupont"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          placeholder="jean@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mot de passe</Label>
                        <Input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rôle</Label>
                        <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nurse">Infirmière</SelectItem>
                            <SelectItem value="receptionist">Réceptionniste</SelectItem>
                            <SelectItem value="doctor">Médecin</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateUser} className="w-full bg-blue-600 hover:bg-blue-700">
                        Créer l'utilisateur
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users && users.length > 0 ? (
                  users.map((user) => {
                    const userPermissions = user.permissions ? JSON.parse(user.permissions) : []
                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleUserClick(user)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {userPermissions.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {userPermissions.slice(0, 3).map((permission: string) => (
                                  <span key={permission} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                    {permission}
                                  </span>
                                ))}
                                {userPermissions.length > 3 && (
                                  <span className="text-xs text-gray-500">+{userPermissions.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {user.role}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteUser(user.id)
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun utilisateur trouvé</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permissions Dialog */}
          <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Gérer les permissions - {selectedUser?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <p className="text-sm text-gray-600">Sélectionnez les routes auxquelles cet utilisateur peut accéder:</p>
                <div className="space-y-2">
                  {availableRoutes.map((route) => {
                    const currentPermissions = selectedUser?.permissions ? JSON.parse(selectedUser.permissions) : []
                    const isChecked = currentPermissions.includes(route.id)

                    return (
                      <label
                        key={route.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(route.id)}
                          className="w-4 h-4 text-blue-600 border-2 border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{route.label}</span>
                      </label>
                    )
                  })}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSavePermissions}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Enregistrer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPermissionsDialog(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}
