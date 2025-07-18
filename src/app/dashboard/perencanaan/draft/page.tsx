"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { generateDraftKebutuhan, validateAIPrompt, DEFAULT_SYSTEM_PROMPT, type AIPrompt } from "@/lib/ai"

export default function GenerateDraftPage() {
  const [formData, setFormData] = useState({
    cropType: "",
    landArea: "",
    soilType: "",
    season: "",
    location: ""
  })
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [generatedDraft, setGeneratedDraft] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)

  // Load saved drafts from localStorage
  const [savedDrafts, setSavedDrafts] = useState<Array<{
    id: string
    cropType: string
    landArea: number
    draft: string
    createdAt: string
  }>>([])

  useEffect(() => {
    const saved = localStorage.getItem("savedDrafts")
    if (saved) {
      setSavedDrafts(JSON.parse(saved))
    }
  }, [])

  const handleGenerate = async () => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Validate input
      const prompt: AIPrompt = {
        cropType: formData.cropType,
        landArea: parseFloat(formData.landArea),
        soilType: formData.soilType,
        season: formData.season,
        location: formData.location
      }

      const validationError = validateAIPrompt(prompt)
      if (validationError) {
        setError(validationError)
        setIsLoading(false)
        return
      }

      // Generate draft using AI
      const draft = await generateDraftKebutuhan(prompt)
      setGeneratedDraft(draft)
      setSuccess("Draft kebutuhan berhasil dihasilkan!")

    } catch (err) {
      console.error("Error generating draft:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Terjadi kesalahan saat menggenerate draft. Silakan coba lagi.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = () => {
    if (!generatedDraft) {
      setError("Tidak ada draft untuk disimpan")
      return
    }

    const newDraft = {
      id: Date.now().toString(),
      cropType: formData.cropType,
      landArea: parseFloat(formData.landArea),
      draft: generatedDraft,
      createdAt: new Date().toISOString()
    }

    const updatedDrafts = [newDraft, ...savedDrafts]
    setSavedDrafts(updatedDrafts)
    localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts))
    setSuccess("Draft berhasil disimpan!")
  }

  const handleDeleteDraft = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus draft ini?")) {
      const updatedDrafts = savedDrafts.filter(draft => draft.id !== id)
      setSavedDrafts(updatedDrafts)
      localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts))
      setSuccess("Draft berhasil dihapus!")
    }
  }

  const handleLoadDraft = (draft: typeof savedDrafts[0]) => {
    setGeneratedDraft(draft.draft)
    setFormData({
      cropType: draft.cropType,
      landArea: draft.landArea.toString(),
      soilType: "",
      season: "",
      location: ""
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generate Draft Kebutuhan</h1>
        <p className="text-gray-600">Gunakan AI untuk menghasilkan draft kebutuhan pertanian</p>
      </div>

      {/* API Key Warning */}
      <Alert>
        <AlertDescription>
          <strong>Catatan:</strong> Fitur ini memerlukan API key OpenRouter. 
          Pastikan Anda telah menambahkan <code>NEXT_PUBLIC_OPENROUTER_API_KEY</code> ke file .env.local Anda.
        </AlertDescription>
      </Alert>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Parameter Input</CardTitle>
          <CardDescription>
            Masukkan informasi untuk menghasilkan draft kebutuhan pertanian
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cropType">Jenis Tanaman *</Label>
              <Input
                id="cropType"
                value={formData.cropType}
                onChange={(e) => setFormData({...formData, cropType: e.target.value})}
                placeholder="Contoh: Padi, Jagung, Cabai"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="landArea">Luas Lahan (hektar) *</Label>
              <Input
                id="landArea"
                type="number"
                step="0.01"
                value={formData.landArea}
                onChange={(e) => setFormData({...formData, landArea: e.target.value})}
                placeholder="Contoh: 2.5"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="soilType">Jenis Tanah (opsional)</Label>
              <Select value={formData.soilType} onValueChange={(value) => setFormData({...formData, soilType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis tanah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alluvial">Alluvial</SelectItem>
                  <SelectItem value="latosol">Latosol</SelectItem>
                  <SelectItem value="podsolik">Podsolik</SelectItem>
                  <SelectItem value="regosol">Regosol</SelectItem>
                  <SelectItem value="andosol">Andosol</SelectItem>
                  <SelectItem value="grumusol">Grumusol</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Musim Tanam (opsional)</Label>
              <Select value={formData.season} onValueChange={(value) => setFormData({...formData, season: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih musim tanam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hujan">Musim Hujan</SelectItem>
                  <SelectItem value="kemarau">Musim Kemarau</SelectItem>
                  <SelectItem value="gadu">Gadu (Musim Kering)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Lokasi (opsional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Contoh: Jawa Barat, Sumatera Utara"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={isLoading || !formData.cropType || !formData.landArea}
            >
              {isLoading ? "Menghasilkan..." : "Generate Draft"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            >
              {showSystemPrompt ? "Sembunyikan" : "Tampilkan"} System Prompt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Prompt Customization */}
      {showSystemPrompt && (
        <Card>
          <CardHeader>
            <CardTitle>Kustomisasi System Prompt</CardTitle>
            <CardDescription>
              Sesuaikan instruksi untuk AI agar menghasilkan output sesuai kebutuhan Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setSystemPrompt(DEFAULT_SYSTEM_PROMPT)}
              >
                Reset ke Default
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Draft */}
      {generatedDraft && (
        <Card>
          <CardHeader>
            <CardTitle>Draft Kebutuhan yang Dihasilkan</CardTitle>
            <CardDescription>
              Hasil AI untuk kebutuhan pertanian {formData.cropType} seluas {formData.landArea} hektar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{generatedDraft}</pre>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveDraft}>
                  Simpan Draft
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigator.clipboard.writeText(generatedDraft)}
                >
                  Copy ke Clipboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Drafts */}
      {savedDrafts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Draft Tersimpan</CardTitle>
            <CardDescription>
              Draft kebutuhan yang telah disimpan sebelumnya
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedDrafts.map((draft) => (
                <div key={draft.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{draft.cropType} - {draft.landArea} ha</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(draft.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleLoadDraft(draft)}
                      >
                        Muat
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteDraft(draft.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{draft.draft.substring(0, 200)}...</pre>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
