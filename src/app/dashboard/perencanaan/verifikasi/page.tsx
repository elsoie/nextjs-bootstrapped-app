"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface SavedDraft {
  id: string
  cropType: string
  landArea: number
  draft: string
  createdAt: string
  status?: string
  verifiedAt?: string
  verifiedDraft?: string
}

export default function VerifikasiDraftPage() {
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([])
  const [selectedDraft, setSelectedDraft] = useState<SavedDraft | null>(null)
  const [editedDraft, setEditedDraft] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    // Load saved drafts
    const saved = localStorage.getItem("savedDrafts")
    if (saved) {
      setSavedDrafts(JSON.parse(saved))
    }
  }, [])

  const handleSelectDraft = (draft: SavedDraft) => {
    setSelectedDraft(draft)
    setEditedDraft(draft.verifiedDraft || draft.draft)
    setSuccess("")
    setError("")
  }

  const handleSaveVerification = () => {
    if (!selectedDraft) return

    if (!editedDraft.trim()) {
      setError("Draft yang telah diedit tidak boleh kosong")
      return
    }

    const updatedDraft: SavedDraft = {
      ...selectedDraft,
      verifiedDraft: editedDraft,
      verifiedAt: new Date().toISOString(),
      status: "verified"
    }

    const updatedDrafts = savedDrafts.map(draft => 
      draft.id === selectedDraft.id ? updatedDraft : draft
    )

    setSavedDrafts(updatedDrafts)
    localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts))
    setSelectedDraft(updatedDraft)
    setSuccess("Draft berhasil diverifikasi dan disimpan!")
  }

  const handleApproveDraft = () => {
    if (!selectedDraft) return

    const approvedDraft: SavedDraft = {
      ...selectedDraft,
      status: "approved",
      verifiedAt: new Date().toISOString()
    }

    const updatedDrafts = savedDrafts.map(draft => 
      draft.id === selectedDraft.id ? approvedDraft : draft
    )

    setSavedDrafts(updatedDrafts)
    localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts))
    setSelectedDraft(approvedDraft)
    setSuccess("Draft berhasil disetujui!")
  }

  const handleRejectDraft = () => {
    if (!selectedDraft) return

    if (confirm("Apakah Anda yakin ingin menolak draft ini?")) {
      const rejectedDraft: SavedDraft = {
        ...selectedDraft,
        status: "rejected",
        verifiedAt: new Date().toISOString()
      }

      const updatedDrafts = savedDrafts.map(draft => 
        draft.id === selectedDraft.id ? rejectedDraft : draft
      )

      setSavedDrafts(updatedDrafts)
      localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts))
      setSelectedDraft(rejectedDraft)
      setSuccess("Draft telah ditolak")
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-blue-100 text-blue-800">Terverifikasi</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Disetujui</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>
      default:
        return <Badge variant="outline">Belum Diverifikasi</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verifikasi & Edit Draft</h1>
        <p className="text-gray-600">Tinjau, edit, dan setujui draft kebutuhan pertanian</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Draft List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Draft</CardTitle>
            <CardDescription>
              Pilih draft yang ingin diverifikasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {savedDrafts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada draft tersimpan.</p>
                <p className="text-sm">Buat draft terlebih dahulu di halaman Generate Draft.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedDrafts.map((draft) => (
                  <div 
                    key={draft.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDraft?.id === draft.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectDraft(draft)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{draft.cropType} - {draft.landArea} ha</h4>
                        <p className="text-sm text-gray-500">
                          Dibuat: {new Date(draft.createdAt).toLocaleDateString('id-ID')}
                        </p>
                        {draft.verifiedAt && (
                          <p className="text-sm text-gray-500">
                            Diverifikasi: {new Date(draft.verifiedAt).toLocaleDateString('id-ID')}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(draft.status)}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {draft.draft.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Draft Editor */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDraft ? `Edit Draft: ${selectedDraft.cropType}` : "Pilih Draft"}
            </CardTitle>
            <CardDescription>
              {selectedDraft 
                ? "Edit dan verifikasi draft kebutuhan pertanian"
                : "Pilih draft dari daftar untuk mulai verifikasi"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDraft ? (
              <div className="text-center py-12 text-gray-500">
                <p>Pilih draft dari daftar di sebelah kiri untuk mulai verifikasi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Draft Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Informasi Draft</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tanaman:</span>
                      <span className="ml-2 font-medium">{selectedDraft.cropType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Luas Lahan:</span>
                      <span className="ml-2 font-medium">{selectedDraft.landArea} ha</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedDraft.status)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Dibuat:</span>
                      <span className="ml-2">{new Date(selectedDraft.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Original Draft (Read-only) */}
                <div className="space-y-2">
                  <Label>Draft Asli (AI Generated)</Label>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{selectedDraft.draft}</pre>
                  </div>
                </div>

                {/* Editable Draft */}
                <div className="space-y-2">
                  <Label htmlFor="editedDraft">Draft yang Diedit</Label>
                  <Textarea
                    id="editedDraft"
                    value={editedDraft}
                    onChange={(e) => setEditedDraft(e.target.value)}
                    rows={12}
                    placeholder="Edit draft kebutuhan pertanian di sini..."
                    className="font-mono text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={handleSaveVerification}>
                    Simpan Verifikasi
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                    onClick={handleApproveDraft}
                  >
                    Setujui Draft
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    onClick={handleRejectDraft}
                  >
                    Tolak Draft
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigator.clipboard.writeText(editedDraft)}
                  >
                    Copy ke Clipboard
                  </Button>
                </div>

                {/* Comparison View */}
                {selectedDraft.verifiedDraft && selectedDraft.verifiedDraft !== selectedDraft.draft && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-800">Perubahan yang Dibuat</h4>
                    <p className="text-sm text-blue-700">
                      Draft telah dimodifikasi dari versi asli AI. Gunakan tombol di atas untuk melihat perbandingan lengkap.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Verifikasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{savedDrafts.length}</div>
              <div className="text-sm text-gray-600">Total Draft</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {savedDrafts.filter(d => d.status === 'verified').length}
              </div>
              <div className="text-sm text-blue-600">Terverifikasi</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {savedDrafts.filter(d => d.status === 'approved').length}
              </div>
              <div className="text-sm text-green-600">Disetujui</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {savedDrafts.filter(d => d.status === 'rejected').length}
              </div>
              <div className="text-sm text-red-600">Ditolak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
