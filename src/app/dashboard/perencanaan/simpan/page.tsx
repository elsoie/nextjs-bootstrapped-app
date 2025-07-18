"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface RencanaTanam {
  id: string
  namaRencana: string
  jenisTanaman: string
  luasLahanDibutuhkan: number
  tanggalTanamRencana: string
  status: string
  estimasiBiaya: number
}

interface SavedDraft {
  id: string
  cropType: string
  landArea: number
  draft: string
  status?: string
  verifiedDraft?: string
}

interface FinalPlan {
  id: string
  namaRencana: string
  jenisTanaman: string
  luasLahan: number
  tanggalTanam: string
  draftKebutuhan: string
  estimasiBiaya: number
  catatanPersetujuan: string
  status: "draft" | "approved" | "rejected"
  approvedBy?: string
  approvedAt?: string
  createdAt: string
}

export default function SimpanRencanaPage() {
  const [rencanaData, setRencanaData] = useState<RencanaTanam[]>([])
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([])
  const [finalPlans, setFinalPlans] = useState<FinalPlan[]>([])
  const [selectedRencana, setSelectedRencana] = useState<RencanaTanam | null>(null)
  const [selectedDraft, setSelectedDraft] = useState<SavedDraft | null>(null)
  const [catatanPersetujuan, setCatatanPersetujuan] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    // Load data
    const rencana = localStorage.getItem("rencanaData")
    if (rencana) {
      setRencanaData(JSON.parse(rencana))
    }

    const drafts = localStorage.getItem("savedDrafts")
    if (drafts) {
      setSavedDrafts(JSON.parse(drafts))
    }

    const plans = localStorage.getItem("finalPlans")
    if (plans) {
      setFinalPlans(JSON.parse(plans))
    }
  }, [])

  const handleSaveFinalPlan = () => {
    if (!selectedRencana) {
      setError("Pilih rencana tanam terlebih dahulu")
      return
    }

    if (!selectedDraft) {
      setError("Pilih draft kebutuhan terlebih dahulu")
      return
    }

    if (!catatanPersetujuan.trim()) {
      setError("Catatan persetujuan harus diisi")
      return
    }

    const newFinalPlan: FinalPlan = {
      id: Date.now().toString(),
      namaRencana: selectedRencana.namaRencana,
      jenisTanaman: selectedRencana.jenisTanaman,
      luasLahan: selectedRencana.luasLahanDibutuhkan,
      tanggalTanam: selectedRencana.tanggalTanamRencana,
      draftKebutuhan: selectedDraft.verifiedDraft || selectedDraft.draft || "",
      estimasiBiaya: selectedRencana.estimasiBiaya,
      catatanPersetujuan: catatanPersetujuan,
      status: "draft",
      createdAt: new Date().toISOString()
    }

    const updatedPlans = [newFinalPlan, ...finalPlans]
    setFinalPlans(updatedPlans)
    localStorage.setItem("finalPlans", JSON.stringify(updatedPlans))

    // Reset form
    setSelectedRencana(null)
    setSelectedDraft(null)
    setCatatanPersetujuan("")
    setSuccess("Rencana final berhasil disimpan!")
    setError("")
  }

  const handleApprovePlan = (planId: string) => {
    const updatedPlans = finalPlans.map(plan => 
      plan.id === planId 
        ? { 
            ...plan, 
            status: "approved" as const,
            approvedBy: "Admin", // In real app, get from auth context
            approvedAt: new Date().toISOString()
          }
        : plan
    )
    setFinalPlans(updatedPlans)
    localStorage.setItem("finalPlans", JSON.stringify(updatedPlans))
    setSuccess("Rencana berhasil disetujui!")
  }

  const handleRejectPlan = (planId: string) => {
    if (confirm("Apakah Anda yakin ingin menolak rencana ini?")) {
      const updatedPlans = finalPlans.map(plan => 
        plan.id === planId 
          ? { 
              ...plan, 
              status: "rejected" as const,
              approvedBy: "Admin",
              approvedAt: new Date().toISOString()
            }
          : plan
      )
      setFinalPlans(updatedPlans)
      localStorage.setItem("finalPlans", JSON.stringify(updatedPlans))
      setSuccess("Rencana telah ditolak")
    }
  }

  const handleDeletePlan = (planId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus rencana ini?")) {
      const updatedPlans = finalPlans.filter(plan => plan.id !== planId)
      setFinalPlans(updatedPlans)
      localStorage.setItem("finalPlans", JSON.stringify(updatedPlans))
      setSuccess("Rencana berhasil dihapus!")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Disetujui</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Ditolak</Badge>
      default:
        return <Badge variant="outline">Draft</Badge>
    }
  }

  const approvedDrafts = savedDrafts.filter(draft => draft.status === "approved" || draft.status === "verified")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Simpan & Mengesahkan Rencana</h1>
        <p className="text-gray-600">Finalisasi dan setujui rencana pertanian</p>
      </div>

      {/* Create Final Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Buat Rencana Final</CardTitle>
          <CardDescription>
            Gabungkan rencana tanam dengan draft kebutuhan yang telah diverifikasi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="grid md:grid-cols-2 gap-6">
            {/* Select Rencana Tanam */}
            <div className="space-y-3">
              <Label>Pilih Rencana Tanam</Label>
              {rencanaData.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border rounded-lg">
                  <p>Belum ada rencana tanam.</p>
                  <p className="text-sm">Buat rencana tanam terlebih dahulu.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {rencanaData.map((rencana) => (
                    <div 
                      key={rencana.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedRencana?.id === rencana.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRencana(rencana)}
                    >
                      <div className="font-medium">{rencana.namaRencana}</div>
                      <div className="text-sm text-gray-600">
                        {rencana.jenisTanaman} - {rencana.luasLahanDibutuhkan} ha
                      </div>
                      <div className="text-sm text-gray-500">
                        Tanam: {new Date(rencana.tanggalTanamRencana).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Select Draft */}
            <div className="space-y-3">
              <Label>Pilih Draft Kebutuhan</Label>
              {approvedDrafts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border rounded-lg">
                  <p>Belum ada draft yang disetujui.</p>
                  <p className="text-sm">Verifikasi draft terlebih dahulu.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {approvedDrafts.map((draft) => (
                    <div 
                      key={draft.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedDraft?.id === draft.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDraft(draft)}
                    >
                      <div className="font-medium">{draft.cropType} - {draft.landArea} ha</div>
                      <div className="text-sm text-gray-600">
                        Status: {getStatusBadge(draft.status)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {(draft.draft || "").substring(0, 80)}...
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="catatanPersetujuan">Catatan Persetujuan *</Label>
            <Textarea
              id="catatanPersetujuan"
              value={catatanPersetujuan}
              onChange={(e) => setCatatanPersetujuan(e.target.value)}
              placeholder="Masukkan catatan persetujuan, pertimbangan khusus, atau instruksi tambahan..."
              rows={4}
            />
          </div>

          <Button 
            onClick={handleSaveFinalPlan}
            disabled={!selectedRencana || !selectedDraft || !catatanPersetujuan.trim()}
          >
            Simpan Rencana Final
          </Button>
        </CardContent>
      </Card>

      {/* Final Plans List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Rencana Final</CardTitle>
          <CardDescription>
            Rencana yang telah disimpan dan menunggu persetujuan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {finalPlans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada rencana final.</p>
              <p className="text-sm">Buat rencana final menggunakan form di atas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Rencana</TableHead>
                    <TableHead>Tanaman</TableHead>
                    <TableHead>Luas (ha)</TableHead>
                    <TableHead>Tanggal Tanam</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finalPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.namaRencana}</TableCell>
                      <TableCell>{plan.jenisTanaman}</TableCell>
                      <TableCell>{plan.luasLahan}</TableCell>
                      <TableCell>{new Date(plan.tanggalTanam).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{getStatusBadge(plan.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {plan.status === "draft" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprovePlan(plan.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Setujui
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectPlan(plan.id)}
                                className="border-red-200 text-red-700 hover:bg-red-50"
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Rencana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{finalPlans.length}</div>
              <div className="text-sm text-gray-600">Total Rencana</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {finalPlans.filter(p => p.status === 'draft').length}
              </div>
              <div className="text-sm text-yellow-600">Menunggu Persetujuan</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {finalPlans.filter(p => p.status === 'approved').length}
              </div>
              <div className="text-sm text-green-600">Disetujui</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {finalPlans.filter(p => p.status === 'rejected').length}
              </div>
              <div className="text-sm text-red-600">Ditolak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
