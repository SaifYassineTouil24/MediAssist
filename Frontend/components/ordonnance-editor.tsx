"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit3, Save, X, Plus, Download } from "lucide-react"
import apiClient from "@/components/apiclient"
import { useParams } from "react-router-dom"

export default function OrdonnanceEditor() {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [texts, setTexts] = useState([])
  const [selectedTextId, setSelectedTextId] = useState(null)
  const [editingTextId, setEditingTextId] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [isAddingMode, setIsAddingMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [patient, setPatient] = useState({ nom: "Inconnu", prenom: "" })

  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const { rendezVousId } = useParams()

  // 🔹 Fetch rendez-vous depuis le backend
  useEffect(() => {
    const fetchRendezVous = async () => {
      try {
        const response = await apiClient.get(`/rendez_vouses/${rendezVousId}`)
        const rdv = response.data

        const fetchedPatient = rdv.patient ?? { nom: "Inconnu", prenom: "" }
        setPatient(fetchedPatient)

        const medicaments = rdv.medicaments ?? []

        const newTexts = [
          { id: "nom", x: 200, y: 200, content: fetchedPatient.nom, fontSize: 18, color: "black" },
          ...medicaments.map((m, i) => ({
            id: `med-${i}`,
            x: 100,
            y: 250 + i * 40,
            content: `${m.nom ?? ""} — ${m.dosage ?? ""} mg, ${m.frequence ?? ""} fois/jour, pendant ${m.duration ?? ""} jours`,
            fontSize: 16,
            color: "black",
          })),
        ]
        setTexts(newTexts)
      } catch (err) {
        console.error("Erreur fetch rendez-vous:", err)
        setError("Impossible de récupérer le rendez-vous")
      } finally {
        setLoading(false)
      }
    }

    if (rendezVousId) fetchRendezVous()
  }, [rendezVousId])

  // 🔹 Redessiner le canvas
  useEffect(() => {
    if (imageLoaded) drawCanvas()
  }, [imageLoaded, texts, selectedTextId])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !imgRef.current) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(imgRef.current, 0, 0)

    texts.forEach((t) => {
      ctx.font = `${t.fontSize}px Arial`
      ctx.fillStyle = t.color

      if (t.id === selectedTextId) {
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)"
        const metrics = ctx.measureText(t.content)
        ctx.fillRect(t.x - 2, t.y - t.fontSize, metrics.width + 4, t.fontSize + 4)
        ctx.fillStyle = t.color
      }

      ctx.fillText(t.content, t.x, t.y)
    })

    canvas.style.cursor = isAddingMode ? "crosshair" : "pointer"
  }

  // 🔹 Gestion clic sur canvas
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isAddingMode) {
      const newText = {
        id: Date.now().toString(),
        x,
        y,
        content: "Nouveau texte",
        fontSize: 16,
        color: "black",
      }
      setTexts([...texts, newText])
      setSelectedTextId(newText.id)
      setIsAddingMode(false)
      startEditing(newText.id, newText.content)
    } else {
      const clickedText = findTextAtPosition(x, y)
      setSelectedTextId(clickedText?.id || null)
    }
  }

  const findTextAtPosition = (x, y) => {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return null

    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i]
      ctx.font = `${t.fontSize}px Arial`
      const metrics = ctx.measureText(t.content)
      if (x >= t.x && x <= t.x + metrics.width && y >= t.y - t.fontSize && y <= t.y) {
        return t
      }
    }
    return null
  }

  // 🔹 Drag & Drop
  const handleMouseDown = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clickedText = findTextAtPosition(x, y)
    if (clickedText) {
      setSelectedTextId(clickedText.id)
      setDragging(true)
      setDragOffset({ x: x - clickedText.x, y: y - clickedText.y })
    }
  }

  const handleMouseMove = (e) => {
    if (!dragging || !selectedTextId) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setTexts((prev) =>
      prev.map((t) => (t.id === selectedTextId ? { ...t, x: x - dragOffset.x, y: y - dragOffset.y } : t)),
    )
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  // 🔹 Gestion édition
  const startEditing = (id, content) => {
    setEditingTextId(id)
    setEditValue(content)
  }

  const saveEdit = () => {
    if (!editingTextId) return
    setTexts(texts.map((t) => (t.id === editingTextId ? { ...t, content: editValue } : t)))
    setEditingTextId(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingTextId(null)
    setEditValue("")
  }

  const deleteText = (id) => {
    setTexts(texts.filter((t) => t.id !== id))
    if (selectedTextId === id) setSelectedTextId(null)
  }

  const updateTextProperty = (id, prop, value) => {
    setTexts(texts.map((t) => (t.id === id ? { ...t, [prop]: value } : t)))
  }

  // 🔹 Télécharger le canvas en PNG
  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = `${patient.nom || "ordonnance"}.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  const selectedText = texts.find((t) => t.id === selectedTextId)

  if (loading) return <p>Chargement du rendez-vous...</p>
  if (error) return <p>{error}</p>

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" /> Éditeur d'Ordonnance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setIsAddingMode(!isAddingMode)}
              variant={isAddingMode ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isAddingMode ? "Annuler ajout" : "Ajouter texte"}
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="w-4 h-4" /> Télécharger
            </Button>
            {selectedText && (
              <Button
                onClick={() => deleteText(selectedText.id)}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </Button>
            )}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col items-center">
            <img
              ref={imgRef}
              src="/images/ordonnance.png"
              alt="Ordonnance vierge"
              className="hidden"
              onLoad={() => {
                const canvas = canvasRef.current
                if (canvas && imgRef.current) {
                  canvas.width = imgRef.current.width
                  canvas.height = imgRef.current.height
                  setImageLoaded(true)
                }
              }}
            />
            <canvas
              ref={canvasRef}
              className="border border-gray-300 rounded shadow-sm max-w-full"
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
          </div>

          {selectedText && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Propriétés du texte sélectionné</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingTextId === selectedText.id ? (
                  <div className="flex gap-2">
                    <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="flex-1" />
                    <Button onClick={saveEdit} size="sm">
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button onClick={cancelEdit} variant="outline" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <span className="flex-1 p-2 bg-gray-50 rounded">{selectedText.content}</span>
                    <Button
                      onClick={() => startEditing(selectedText.id, selectedText.content)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Taille de police</label>
                    <Input
                      type="number"
                      min="8"
                      max="72"
                      value={selectedText.fontSize}
                      onChange={(e) => updateTextProperty(selectedText.id, "fontSize", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Couleur</label>
                    <Input
                      type="color"
                      value={selectedText.color}
                      onChange={(e) => updateTextProperty(selectedText.id, "color", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
