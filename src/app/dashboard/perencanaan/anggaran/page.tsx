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

interface AnggaranItem {
  id: string
  kategori: string
  namaItem: string
  satuan: string
  jumlah: number
  hargaSatuan: number
  totalHarga: number
  keterangan: string
}

interface AnggaranData {
  id: string
  namaAnggaran: string
  jenisTanaman: string
  luasLahan: number
  items: AnggaranItem[]
  totalAnggaran: number
  tanggalBuat: string
  status: string
}

export default function KebutuhanAnggaranPage() {
  const [anggaranData, setAnggaranData] = useState<AnggaranData[]>([])
  const [currentAnggaran, setCurrentAnggaran] = useState<AnggaranData | null>(null)
  const [formData, setFormData] = useState({
    namaAnggaran: "",
    jenisTanaman: "",
    luasLahan: ""
  })
  const [itemForm, setItemForm] = useState({
    kategori: "",
    namaItem: "",
    satuan: "",
    jumlah: "",
    hargaSatuan: "",
    keterangan: ""
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isEditingItem, setIsEditingItem] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("anggaranData")
    if (saved) {
      setAnggaranData(JSON.parse(saved))
    }
  }, [])

  const saveToLocalStorage = (data: AnggaranData[]) => {
    localStorage.setItem("anggaranData", JSON.stringify(data))
  }

  const handleCreateAnggaran = () => {
    if (!formData.namaAnggaran || !formData.jenisTanaman || !formData.luasLahan) {
      setError("Semua field harus diisi")
      return
    }

    const newAnggaran: AnggaranData = {
      id: Date.now().toString(),
      namaAnggaran: formData.namaAnggaran,
      jenisTanaman: formData.jenisTanaman,
      luasLahan: parseFloat(formData.luasLahan),
      items: [],
      totalAnggaran: 0,
      tanggalBuat: new Date().toISOString(),
      status: "draft"
    }

    setCurrentAnggaran(newAnggaran)
    setSuccess("Anggaran baru berhasil dibuat. Silakan tambahkan item anggaran.")
    setError("")
  }

  const handleAddItem = () => {
    if (!currentAnggaran) return

    if (!itemForm.kategori || !itemForm.namaItem || !itemForm.jumlah || !itemForm.hargaSatuan) {
      setError("Kategori, nama item, jumlah, dan harga satuan harus diisi")
      return
    }

    const jumlah = parseFloat(itemForm.jumlah)
    const hargaSatuan = parseFloat(itemForm.hargaSatuan)
    const totalHarga = jumlah * hargaSatuan

    const newItem: AnggaranItem = {
      id: isEditingItem || Date.now().toString(),
      kategori: itemForm.kategori,
      namaItem: itemForm.namaItem,
      satuan: itemForm.satuan,
      jumlah: jumlah,
      hargaSatuan: hargaSatuan,
      totalHarga: totalHarga,
      keterangan: itemForm.keterangan
    }

    let updatedItems: AnggaranItem[]
    if (isEditingItem) {
      updatedItems = currentAnggaran.items.map(item => 
        item.id === isEditingItem ? newItem : item
      )
    } else {
      updatedItems = [...currentAnggaran.items, newItem]
    }

    const totalAnggaran = updatedItems.reduce((sum, item) => sum + item.totalHarga, 0)

    const updatedAnggaran = {
      ...currentAnggaran,
      items: updatedItems,
      totalAnggaran: totalAnggaran
    }

    setCurrentAnggaran(updatedAnggaran)
    resetItemForm()
    setSuccess(isEditingItem ? "Item berhasil diperbarui" : "Item berhasil ditambahkan")
    setError("")
  }

  const resetItemForm = () => {
    setItemForm({
      kategori: "",
      namaItem: "",
      satuan: "",
      jumlah: "",
      hargaSatuan: "",
      keterangan: ""
    })
    setIsEditingItem(null)
  }

  const handleEditItem = (item: AnggaranItem) => {
    setItemForm({
      kategori: item.kategori,
      namaItem: item.namaItem,
      satuan: item.satuan,
      jumlah: item.jumlah.toString(),
      hargaSatuan: item.hargaSatuan.toString(),
      keterangan: item.keterangan
    })
    setIsEditingItem(item.id)
  }

  const handleDeleteItem = (itemId: string) => {
    if (!currentAnggaran) return

    if (confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      const updatedItems = currentAnggaran.items.filter(item => item.id !== itemId)
      const totalAnggaran = updatedItems.reduce((sum, item) => sum + item.totalHarga, 0)

      const updatedAnggaran = {
        ...currentAnggaran,
        items: updatedItems,
        totalAnggaran: totalAnggaran
      }

      setCurrentAnggaran(updatedAnggaran)
      setSuccess("Item berhasil dihapus")
    }
  }

  const handleSaveAnggaran = () => {
    if (!currentAnggaran) return

    if (currentAnggaran.items.length === 0) {
      setError("Tambahkan minimal satu item anggaran")
      return
    }

    const existingIndex = anggaranData.findIndex(a => a.id === currentAnggaran.id)
    let updatedData: AnggaranData[]

    if (existingIndex >= 0) {
      updatedData = anggaranData.map(a => a.id === currentAnggaran.id ? currentAnggaran : a)
    } else {
      updatedData = [currentAnggaran, ...anggaranData]
    }

    setAnggaranData(updatedData)
    saveToLocalStorage(updatedData)
    setSuccess("Anggaran berhasil disimpan!")
  }

  const handleLoadAnggaran = (anggaran: AnggaranData) => {
    setCurrentAnggaran(anggaran)
    setFormData({
      namaAnggaran: anggaran.namaAnggaran,
      jenisTanaman: anggaran.jenisTanaman,
      luasLahan: anggaran.luasLahan.toString()
    })
  }

  const handleDeleteAnggaran = (anggaranId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus anggaran ini?")) {
      const updatedData = anggaranData.filter(a => a.id !== anggaranId)
      setAnggaranData(updatedData)
      saveToLocalStorage(updatedData)
      
      if (currentAnggaran?.id === anggaranId) {
        setCurrentAnggaran(null)
        setFormData({ namaAnggaran: "", jenisTanaman: "", luasLahan: "" })
      }
      
      setSuccess("Anggaran berhasil dihapus!")
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
        <h1 className="text-3xl font-bold">Kebutuhan Anggaran</h1>
        <p className="text-gray-600">Susun dan kelola anggaran untuk kebutuhan pertanian</p>
      </div>

      {/* Create/Edit Anggaran Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentAnggaran ? `Edit Anggaran: ${currentAnggaran.namaAnggaran}` : "Buat Anggaran Baru"}
          </CardTitle>
          <CardDescription>
            {currentAnggaran ? "Kelola item-item dalam anggaran" : "Mulai dengan membuat anggaran baru"}
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

          {!currentAnggaran ? (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="namaAnggaran">Nama Anggaran</Label>
                <Input
                  id="namaAnggaran"
                  value={formData.namaAnggaran}
                  onChange={(e) => setFormData({...formData, namaAnggaran: e.target.value})}
                  placeholder="Contoh: Anggaran Tanam Padi 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenisTanaman">Jenis Tanaman</Label>
                <Input
                  id="jenisTanaman"
                  value={formData.jenisTanaman}
                  onChange={(e) => setFormData({...formData, jenisTanaman: e.target.value})}
                  placeholder="Contoh: Padi, Jagung"
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
              <div className="md:col-span-3">
                <Button onClick={handleCreateAnggaran}>
                  Buat Anggaran
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Anggaran Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Informasi Anggaran</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Nama:</span>
                    <span className="ml-2 font-medium">{currentAnggaran.namaAnggaran}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Tanaman:</span>
                    <span className="ml-2 font-medium">{currentAnggaran.jenisTanaman}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Luas:</span>
                    <span className="ml-2 font-medium">{currentAnggaran.luasLahan} ha</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-blue-700">Total Anggaran:</span>
                  <span className="ml-2 font-bold text-lg text-blue-900">
                    {formatCurrency(currentAnggaran.totalAnggaran)}
                  </span>
                </div>
              </div>

              {/* Add Item Form */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">
                  {isEditingItem ? "Edit Item Anggaran" : "Tambah Item Anggaran"}
                </h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kategori">Kategori</Label>
                    <Select value={itemForm.kategori} onValueChange={(value) => setItemForm({...itemForm, kategori: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bibit">Bibit/Benih</SelectItem>
                        <SelectItem value="pupuk">Pupuk</SelectItem>
                        <SelectItem value="pestisida">Pestisida/Fungisida</SelectItem>
                        <SelectItem value="alat">Alat Pertanian</SelectItem>
                        <SelectItem value="tenaga-kerja">Tenaga Kerja</SelectItem>
                        <SelectItem value="irigasi">Irigasi</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="namaItem">Nama Item</Label>
                    <Input
                      id="namaItem"
                      value={itemForm.namaItem}
                      onChange={(e) => setItemForm({...itemForm, namaItem: e.target.value})}
                      placeholder="Contoh: Benih Padi IR64"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="satuan">Satuan</Label>
                    <Input
                      id="satuan"
                      value={itemForm.satuan}
                      onChange={(e) => setItemForm({...itemForm, satuan: e.target.value})}
                      placeholder="kg, liter, hari, dll"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jumlah">Jumlah</Label>
                    <Input
                      id="jumlah"
                      type="number"
                      step="0.01"
                      value={itemForm.jumlah}
                      onChange={(e) => setItemForm({...itemForm, jumlah: e.target.value})}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hargaSatuan">Harga Satuan (Rp)</Label>
                    <Input
                      id="hargaSatuan"
                      type="number"
                      value={itemForm.hargaSatuan}
                      onChange={(e) => setItemForm({...itemForm, hargaSatuan: e.target.value})}
                      placeholder="15000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Harga</Label>
                    <div className="p-2 bg-gray-50 rounded border text-sm font-medium">
                      {itemForm.jumlah && itemForm.hargaSatuan 
                        ? formatCurrency(parseFloat(itemForm.jumlah) * parseFloat(itemForm.hargaSatuan))
                        : "Rp 0"
                      }
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="keterangan">Keterangan</Label>
                    <Textarea
                      id="keterangan"
                      value={itemForm.keterangan}
                      onChange={(e) => setItemForm({...itemForm, keterangan: e.target.value})}
                      placeholder="Keterangan tambahan..."
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleAddItem}>
                    {isEditingItem ? "Perbarui Item" : "Tambah Item"}
                  </Button>
                  {isEditingItem && (
                    <Button variant="outline" onClick={resetItemForm}>
                      Batal
                    </Button>
                  )}
                </div>
              </div>

              {/* Items List */}
              {currentAnggaran.items.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Harga Satuan</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAnggaran.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="capitalize">{item.kategori}</TableCell>
                          <TableCell>{item.namaItem}</TableCell>
                          <TableCell>{item.jumlah} {item.satuan}</TableCell>
                          <TableCell>{formatCurrency(item.hargaSatuan)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(item.totalHarga)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditItem(item)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item.id)}>
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

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={handleSaveAnggaran}>
                  Simpan Anggaran
                </Button>
                <Button variant="outline" onClick={() => {
                  setCurrentAnggaran(null)
                  setFormData({ namaAnggaran: "", jenisTanaman: "", luasLahan: "" })
                  resetItemForm()
                }}>
                  Buat Anggaran Baru
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Anggaran List */}
      {anggaranData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Anggaran Tersimpan</CardTitle>
            <CardDescription>
              Anggaran yang telah dibuat dan disimpan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Anggaran</TableHead>
                    <TableHead>Tanaman</TableHead>
                    <TableHead>Luas (ha)</TableHead>
                    <TableHead>Total Anggaran</TableHead>
                    <TableHead>Tanggal Buat</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anggaranData.map((anggaran) => (
                    <TableRow key={anggaran.id}>
                      <TableCell className="font-medium">{anggaran.namaAnggaran}</TableCell>
                      <TableCell>{anggaran.jenisTanaman}</TableCell>
                      <TableCell>{anggaran.luasLahan}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(anggaran.totalAnggaran)}</TableCell>
                      <TableCell>{new Date(anggaran.tanggalBuat).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleLoadAnggaran(anggaran)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteAnggaran(anggaran.id)}>
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
