"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PanenData {
  id: string
  namaLahan: string
  jenisTanaman: string
  varietasTanaman: string
  luasLahan: number
  tanggalTanam: string
  tanggalPanen: string
  jumlahPanen: number
  satuanPanen: string
  kualitasPanen: string
  hargaJual: number
  totalPenjualan: number
  biayaPanen: number
  cuaca: string
  kondisiTanaman: string
  metodePanen: string
  keterangan: string
  tanggalInput: string
}

export default function InputDataPanenPage() {
  const [formData, setFormData] = useState({
    namaLahan: "",
    jenisTanaman: "",
    varietasTanaman: "",
    luasLahan: "",
    tanggalTanam: "",
    tanggalPanen: "",
    jumlahPanen: "",
    satuanPanen: "",
    kualitasPanen: "",
    hargaJual: "",
    biayaPanen: "",
    cuaca: "",
    kondisiTanaman: "",
    metodePanen: "",
    keterangan: ""
  })
  const [panenData, setPanenData] = useState<PanenData[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isEditing, setIsEditing] = useState<string | null>(null)

  // Load data lahan untuk dropdown
  const [dataLahan, setDataLahan] = useState<any[]>([])

  useEffect(() => {
    // Load panen data
    const savedPanen = localStorage.getItem("panenData")
    if (savedPanen) {
      setPanenData(JSON.parse(savedPanen))
    }

    // Load data lahan untuk dropdown
    const savedLahan = localStorage.getItem("dataLahan")
    if (savedLahan) {
      setDataLahan(JSON.parse(savedLahan))
    }
  }, [])

  const saveToLocalStorage = (data: PanenData[]) => {
    localStorage.setItem("panenData", JSON.stringify(data))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!formData.namaLahan || !formData.jenisTanaman || !formData.tanggalPanen || !formData.jumlahPanen) {
      setError("Nama lahan, jenis tanaman, tanggal panen, dan jumlah panen harus diisi")
      return
    }

    if (parseFloat(formData.jumlahPanen) <= 0) {
      setError("Jumlah panen harus lebih dari 0")
      return
    }

    const jumlahPanen = parseFloat(formData.jumlahPanen)
    const hargaJual = parseFloat(formData.hargaJual) || 0
    const totalPenjualan = jumlahPanen * hargaJual

    const newData: PanenData = {
      id: isEditing || Date.now().toString(),
      namaLahan: formData.namaLahan,
      jenisTanaman: formData.jenisTanaman,
      varietasTanaman: formData.varietasTanaman,
      luasLahan: parseFloat(formData.luasLahan) || 0,
      tanggalTanam: formData.tanggalTanam,
      tanggalPanen: formData.tanggalPanen,
      jumlahPanen: jumlahPanen,
      satuanPanen: formData.satuanPanen,
      kualitasPanen: formData.kualitasPanen,
      hargaJual: hargaJual,
      totalPenjualan: totalPenjualan,
      biayaPanen: parseFloat(formData.biayaPanen) || 0,
      cuaca: formData.cuaca,
      kondisiTanaman: formData.kondisiTanaman,
      metodePanen: formData.metodePanen,
      keterangan: formData.keterangan,
      tanggalInput: isEditing ? 
        panenData.find(d => d.id === isEditing)?.tanggalInput || new Date().toISOString() :
        new Date().toISOString()
    }

    let updatedData: PanenData[]
    if (isEditing) {
      updatedData = panenData.map(item => item.id === isEditing ? newData : item)
      setSuccess("Data panen berhasil diperbarui")
    } else {
      updatedData = [...panenData, newData]
      setSuccess("Data panen berhasil ditambahkan")
    }

    setPanenData(updatedData)
    saveToLocalStorage(updatedData)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      namaLahan: "",
      jenisTanaman: "",
      varietasTanaman: "",
      luasLahan: "",
      tanggalTanam: "",
      tanggalPanen: "",
      jumlahPanen: "",
      satuanPanen: "",
      kualitasPanen: "",
      hargaJual: "",
      biayaPanen: "",
      cuaca: "",
      kondisiTanaman: "",
      metodePanen: "",
      keterangan: ""
    })
    setIsEditing(null)
  }

  const handleEdit = (data: PanenData) => {
    setFormData({
      namaLahan: data.namaLahan,
      jenisTanaman: data.jenisTanaman,
      varietasTanaman: data.varietasTanaman,
      luasLahan: data.luasLahan.toString(),
      tanggalTanam: data.tanggalTanam,
      tanggalPanen: data.tanggalPanen,
      jumlahPanen: data.jumlahPanen.toString(),
      satuanPanen: data.satuanPanen,
      kualitasPanen: data.kualitasPanen,
      hargaJual: data.hargaJual.toString(),
      biayaPanen: data.biayaPanen.toString(),
      cuaca: data.cuaca,
      kondisiTanaman: data.kondisiTanaman,
      metodePanen: data.metodePanen,
      keterangan: data.keterangan
    })
    setIsEditing(data.id)
    setError("")
    setSuccess("")
  }

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      const updatedData = panenData.filter(item => item.id !== id)
      setPanenData(updatedData)
      saveToLocalStorage(updatedData)
      setSuccess("Data panen berhasil dihapus")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Input Data Panen</h1>
        <p className="text-gray-600">Catat hasil panen dan informasi terkait</p>
      </div>

      {/* Form Input */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Data Panen" : "Tambah Data Panen"}</CardTitle>
          <CardDescription>
            Masukkan informasi detail tentang hasil panen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="namaLahan">Nama Lahan *</Label>
                <Select value={formData.namaLahan} onValueChange={(value) => setFormData({...formData, namaLahan: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lahan" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataLahan.map((lahan) => (
                      <SelectItem key={lahan.id} value={lahan.namaLahan}>
                        {lahan.namaLahan} ({lahan.luasLahan} ha)
                      </SelectItem>
                    ))}
                    <SelectItem value="lainnya">Lahan Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jenisTanaman">Jenis Tanaman *</Label>
                <Input
                  id="jenisTanaman"
                  value={formData.jenisTanaman}
                  onChange={(e) => setFormData({...formData, jenisTanaman: e.target.value})}
                  placeholder="Contoh: Padi, Jagung, Cabai"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="varietasTanaman">Varietas</Label>
                <Input
                  id="varietasTanaman"
                  value={formData.varietasTanaman}
                  onChange={(e) => setFormData({...formData, varietasTanaman: e.target.value})}
                  placeholder="Contoh: IR64, Hibrida"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="luasLahan">Luas Lahan (ha)</Label>
                <Input
                  id="luasLahan"
                  type="number"
                  step="0.01"
                  value={formData.luasLahan}
                  onChange={(e) => setFormData({...formData, luasLahan: e.target.value})}
                  placeholder="2.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggalTanam">Tanggal Tanam</Label>
                <Input
                  id="tanggalTanam"
                  type="date"
                  value={formData.tanggalTanam}
                  onChange={(e) => setFormData({...formData, tanggalTanam: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggalPanen">Tanggal Panen *</Label>
                <Input
                  id="tanggalPanen"
                  type="date"
                  value={formData.tanggalPanen}
                  onChange={(e) => setFormData({...formData, tanggalPanen: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jumlahPanen">Jumlah Panen *</Label>
                <Input
                  id="jumlahPanen"
                  type="number"
                  step="0.01"
                  value={formData.jumlahPanen}
                  onChange={(e) => setFormData({...formData, jumlahPanen: e.target.value})}
                  placeholder="1500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="satuanPanen">Satuan Panen</Label>
                <Select value={formData.satuanPanen} onValueChange={(value) => setFormData({...formData, satuanPanen: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="ton">Ton</SelectItem>
                    <SelectItem value="karung">Karung</SelectItem>
                    <SelectItem value="ikat">Ikat</SelectItem>
                    <SelectItem value="buah">Buah</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kualitasPanen">Kualitas Panen</Label>
                <Select value={formData.kualitasPanen} onValueChange={(value) => setFormData({...formData, kualitasPanen: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kualitas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sangat-baik">Sangat Baik</SelectItem>
                    <SelectItem value="baik">Baik</SelectItem>
                    <SelectItem value="sedang">Sedang</SelectItem>
                    <SelectItem value="kurang">Kurang</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hargaJual">Harga Jual per Satuan (Rp)</Label>
                <Input
                  id="hargaJual"
                  type="number"
                  value={formData.hargaJual}
                  onChange={(e) => setFormData({...formData, hargaJual: e.target.value})}
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="biayaPanen">Biaya Panen (Rp)</Label>
                <Input
                  id="biayaPanen"
                  type="number"
                  value={formData.biayaPanen}
                  onChange={(e) => setFormData({...formData, biayaPanen: e.target.value})}
                  placeholder="500000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuaca">Kondisi Cuaca</Label>
                <Select value={formData.cuaca} onValueChange={(value) => setFormData({...formData, cuaca: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kondisi cuaca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cerah">Cerah</SelectItem>
                    <SelectItem value="berawan">Berawan</SelectItem>
                    <SelectItem value="hujan-ringan">Hujan Ringan</SelectItem>
                    <SelectItem value="hujan-lebat">Hujan Lebat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kondisiTanaman">Kondisi Tanaman</Label>
                <Select value={formData.kondisiTanaman} onValueChange={(value) => setFormData({...formData, kondisiTanaman: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kondisi tanaman" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sangat-sehat">Sangat Sehat</SelectItem>
                    <SelectItem value="sehat">Sehat</SelectItem>
                    <SelectItem value="cukup-sehat">Cukup Sehat</SelectItem>
                    <SelectItem value="kurang-sehat">Kurang Sehat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodePanen">Metode Panen</Label>
                <Select value={formData.metodePanen} onValueChange={(value) => setFormData({...formData, metodePanen: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode panen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="mesin">Menggunakan Mesin</SelectItem>
                    <SelectItem value="kombinasi">Kombinasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total Penjualan Display */}
              {formData.jumlahPanen && formData.hargaJual && (
                <div className="space-y-2">
                  <Label>Estimasi Total Penjualan</Label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-lg font-bold text-green-800">
                      {formatCurrency(parseFloat(formData.jumlahPanen) * parseFloat(formData.hargaJual))}
                    </div>
                    <div className="text-sm text-green-600">
                      {formData.jumlahPanen} {formData.satuanPanen} × {formatCurrency(parseFloat(formData.hargaJual))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan Tambahan</Label>
              <Textarea
                id="keterangan"
                value={formData.keterangan}
                onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                placeholder="Catatan khusus tentang panen, kendala yang dihadapi, dll..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {isEditing ? "Perbarui Data" : "Simpan Data"}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Data Panen</CardTitle>
          <CardDescription>
            Data panen yang telah tercatat dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {panenData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Belum ada data panen.</p>
              <p className="text-sm">Tambahkan data panen pertama Anda menggunakan form di atas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lahan</TableHead>
                    <TableHead>Tanaman</TableHead>
                    <TableHead>Tanggal Panen</TableHead>
                    <TableHead>Jumlah Panen</TableHead>
                    <TableHead>Kualitas</TableHead>
                    <TableHead>Total Penjualan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {panenData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell className="font-medium">{data.namaLahan}</TableCell>
                      <TableCell>{data.jenisTanaman}</TableCell>
                      <TableCell>{new Date(data.tanggalPanen).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>{data.jumlahPanen} {data.satuanPanen}</TableCell>
                      <TableCell className="capitalize">{data.kualitasPanen}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(data.totalPenjualan)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(data)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(data.id)}
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
    </div>
  )
}
