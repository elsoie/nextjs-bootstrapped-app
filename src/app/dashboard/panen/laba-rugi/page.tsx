"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface AnggaranData {
  id: string
  namaAnggaran: string
  jenisTanaman: string
  luasLahan: number
  items: Array<{
    id: string
    kategori: string
    namaItem: string
    satuan: string
    jumlah: number
    hargaSatuan: number
    totalHarga: number
    keterangan: string
  }>
  totalAnggaran: number
  tanggalBuat: string
  status: string
}

interface LabaRugiAnalysis {
  periode: string
  jenisTanaman: string
  luasLahan: number
  
  // Pendapatan
  totalPenjualan: number
  jumlahPanen: number
  hargaRataRata: number
  
  // Biaya
  anggaranAwal: number
  realisasiBiaya: number
  selisihAnggaran: number
  
  // Laba Rugi
  labaKotor: number
  labaBersih: number
  marginKeuntungan: number
  roi: number // Return on Investment
  
  // Produktivitas
  produktivitasPerHa: number
  pendapatanPerHa: number
  biayaPerHa: number
}

export default function AnalisaLabaRugiPage() {
  const [panenData, setPanenData] = useState<PanenData[]>([])
  const [anggaranData, setAnggaranData] = useState<AnggaranData[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState("")
  const [selectedTanaman, setSelectedTanaman] = useState("")
  const [analysis, setAnalysis] = useState<LabaRugiAnalysis | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    // Load data
    const savedPanen = localStorage.getItem("panenData")
    if (savedPanen) {
      setPanenData(JSON.parse(savedPanen))
    }

    const savedAnggaran = localStorage.getItem("anggaranData")
    if (savedAnggaran) {
      setAnggaranData(JSON.parse(savedAnggaran))
    }
  }, [])

  const getAvailablePeriodes = () => {
    const periodes = new Set<string>()
    panenData.forEach(item => {
      const year = new Date(item.tanggalPanen).getFullYear()
      const month = new Date(item.tanggalPanen).getMonth() + 1
      periodes.add(`${year}-${month.toString().padStart(2, '0')}`)
    })
    return Array.from(periodes).sort().reverse()
  }

  const getAvailableTanaman = () => {
    const tanaman = new Set<string>()
    panenData.forEach(item => tanaman.add(item.jenisTanaman))
    return Array.from(tanaman).sort()
  }

  const handleAnalyze = () => {
    setError("")
    
    if (!selectedPeriode || !selectedTanaman) {
      setError("Pilih periode dan jenis tanaman terlebih dahulu")
      return
    }

    // Filter data panen berdasarkan periode dan tanaman
    const [year, month] = selectedPeriode.split('-')
    const filteredPanen = panenData.filter(item => {
      const panenDate = new Date(item.tanggalPanen)
      return panenDate.getFullYear().toString() === year &&
             (panenDate.getMonth() + 1).toString().padStart(2, '0') === month &&
             item.jenisTanaman === selectedTanaman
    })

    if (filteredPanen.length === 0) {
      setError("Tidak ada data panen untuk periode dan tanaman yang dipilih")
      return
    }

    // Cari anggaran yang sesuai
    const matchingAnggaran = anggaranData.find(anggaran => 
      anggaran.jenisTanaman === selectedTanaman
    )

    // Hitung analisis
    const totalPenjualan = filteredPanen.reduce((sum, item) => sum + item.totalPenjualan, 0)
    const jumlahPanen = filteredPanen.reduce((sum, item) => sum + item.jumlahPanen, 0)
    const totalLuasLahan = filteredPanen.reduce((sum, item) => sum + item.luasLahan, 0)
    const realisasiBiaya = filteredPanen.reduce((sum, item) => sum + item.biayaPanen, 0)
    const anggaranAwal = matchingAnggaran?.totalAnggaran || 0
    
    const hargaRataRata = jumlahPanen > 0 ? totalPenjualan / jumlahPanen : 0
    const selisihAnggaran = realisasiBiaya - anggaranAwal
    const labaKotor = totalPenjualan - realisasiBiaya
    const labaBersih = totalPenjualan - Math.max(anggaranAwal, realisasiBiaya)
    const marginKeuntungan = totalPenjualan > 0 ? (labaBersih / totalPenjualan) * 100 : 0
    const roi = anggaranAwal > 0 ? (labaBersih / anggaranAwal) * 100 : 0
    
    const produktivitasPerHa = totalLuasLahan > 0 ? jumlahPanen / totalLuasLahan : 0
    const pendapatanPerHa = totalLuasLahan > 0 ? totalPenjualan / totalLuasLahan : 0
    const biayaPerHa = totalLuasLahan > 0 ? realisasiBiaya / totalLuasLahan : 0

    const analysisResult: LabaRugiAnalysis = {
      periode: `${getMonthName(parseInt(month))} ${year}`,
      jenisTanaman: selectedTanaman,
      luasLahan: totalLuasLahan,
      totalPenjualan,
      jumlahPanen,
      hargaRataRata,
      anggaranAwal,
      realisasiBiaya,
      selisihAnggaran,
      labaKotor,
      labaBersih,
      marginKeuntungan,
      roi,
      produktivitasPerHa,
      pendapatanPerHa,
      biayaPerHa
    }

    setAnalysis(analysisResult)
  }

  const getMonthName = (month: number) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]
    return months[month - 1]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getPerformanceBadge = (value: number, type: 'margin' | 'roi') => {
    if (type === 'margin') {
      if (value >= 30) return <Badge className="bg-green-100 text-green-800">Sangat Baik</Badge>
      if (value >= 20) return <Badge className="bg-blue-100 text-blue-800">Baik</Badge>
      if (value >= 10) return <Badge className="bg-yellow-100 text-yellow-800">Cukup</Badge>
      return <Badge className="bg-red-100 text-red-800">Kurang</Badge>
    } else {
      if (value >= 50) return <Badge className="bg-green-100 text-green-800">Sangat Baik</Badge>
      if (value >= 30) return <Badge className="bg-blue-100 text-blue-800">Baik</Badge>
      if (value >= 15) return <Badge className="bg-yellow-100 text-yellow-800">Cukup</Badge>
      return <Badge className="bg-red-100 text-red-800">Kurang</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analisa Laba Rugi</h1>
        <p className="text-gray-600">Analisis profitabilitas dan kinerja finansial pertanian</p>
      </div>

      {/* Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle>Parameter Analisis</CardTitle>
          <CardDescription>
            Pilih periode dan jenis tanaman untuk analisis laba rugi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Periode (Bulan-Tahun)</Label>
              <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePeriodes().map(periode => {
                    const [year, month] = periode.split('-')
                    return (
                      <SelectItem key={periode} value={periode}>
                        {getMonthName(parseInt(month))} {year}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jenis Tanaman</Label>
              <Select value={selectedTanaman} onValueChange={setSelectedTanaman}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tanaman" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTanaman().map(tanaman => (
                    <SelectItem key={tanaman} value={tanaman}>{tanaman}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleAnalyze} className="w-full">
                Analisis Laba Rugi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analysis.totalPenjualan)}
                </div>
                <div className="text-sm text-gray-600">Total Pendapatan</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(analysis.realisasiBiaya)}
                </div>
                <div className="text-sm text-gray-600">Total Biaya</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className={`text-2xl font-bold ${analysis.labaBersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(analysis.labaBersih)}
                </div>
                <div className="text-sm text-gray-600">Laba Bersih</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className={`text-2xl font-bold ${analysis.marginKeuntungan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.marginKeuntungan.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Margin Keuntungan</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Laporan Laba Rugi */}
            <Card>
              <CardHeader>
                <CardTitle>Laporan Laba Rugi</CardTitle>
                <CardDescription>
                  {analysis.jenisTanaman} - {analysis.periode}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">PENDAPATAN</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-4">Penjualan ({analysis.jumlahPanen.toLocaleString()} kg)</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(analysis.totalPenjualan)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-4">Harga Rata-rata per kg</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(analysis.hargaRataRata)}
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="border-t">
                      <TableCell className="font-medium">BIAYA</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-4">Anggaran Awal</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(analysis.anggaranAwal)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-4">Realisasi Biaya</TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {formatCurrency(analysis.realisasiBiaya)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-4">Selisih Anggaran</TableCell>
                      <TableCell className={`text-right ${analysis.selisihAnggaran >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {analysis.selisihAnggaran >= 0 ? '+' : ''}{formatCurrency(analysis.selisihAnggaran)}
                      </TableCell>
                    </TableRow>
                    
                    <TableRow className="border-t">
                      <TableCell className="font-medium">LABA RUGI</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-4">Laba Kotor</TableCell>
                      <TableCell className={`text-right font-medium ${analysis.labaKotor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(analysis.labaKotor)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="pl-4 font-medium">Laba Bersih</TableCell>
                      <TableCell className={`text-right font-bold text-lg ${analysis.labaBersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(analysis.labaBersih)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Indikator Kinerja</CardTitle>
                <CardDescription>
                  Metrik kinerja finansial dan operasional
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Margin Keuntungan</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{analysis.marginKeuntungan.toFixed(1)}%</span>
                      {getPerformanceBadge(analysis.marginKeuntungan, 'margin')}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Return on Investment (ROI)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{analysis.roi.toFixed(1)}%</span>
                      {getPerformanceBadge(analysis.roi, 'roi')}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Produktivitas per Hektar</span>
                    <span className="font-medium">{analysis.produktivitasPerHa.toFixed(1)} kg/ha</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pendapatan per Hektar</span>
                    <span className="font-medium">{formatCurrency(analysis.pendapatanPerHa)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Biaya per Hektar</span>
                    <span className="font-medium">{formatCurrency(analysis.biayaPerHa)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Luas Lahan Total</span>
                    <span className="font-medium">{analysis.luasLahan} ha</span>
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Insight Kinerja</h4>
                  <div className="space-y-2 text-sm">
                    {analysis.marginKeuntungan >= 20 ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">
                          ✓ Margin keuntungan sangat baik. Bisnis pertanian Anda sangat menguntungkan.
                        </p>
                      </div>
                    ) : analysis.marginKeuntungan >= 10 ? (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">
                          ⚠ Margin keuntungan cukup. Pertimbangkan optimasi biaya atau peningkatan harga jual.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">
                          ⚠ Margin keuntungan rendah. Perlu evaluasi strategi bisnis dan efisiensi operasional.
                        </p>
                      </div>
                    )}

                    {analysis.selisihAnggaran > 0 && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-orange-800">
                          ⚠ Realisasi biaya melebihi anggaran sebesar {formatCurrency(analysis.selisihAnggaran)}. 
                          Perlu kontrol biaya yang lebih ketat.
                        </p>
                      </div>
                    )}

                    {analysis.produktivitasPerHa < 3000 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800">
                          💡 Produktivitas dapat ditingkatkan melalui perbaikan teknik budidaya dan pemupukan.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Rekomendasi Perbaikan</CardTitle>
              <CardDescription>
                Saran untuk meningkatkan profitabilitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-green-700">Peningkatan Pendapatan</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Tingkatkan kualitas produk untuk harga jual yang lebih baik</li>
                    <li>• Diversifikasi varietas tanaman dengan nilai ekonomi tinggi</li>
                    <li>• Jual langsung ke konsumen untuk menghindari tengkulak</li>
                    <li>• Manfaatkan teknologi untuk pemasaran online</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-red-700">Efisiensi Biaya</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Buat anggaran yang lebih detail dan realistis</li>
                    <li>• Gunakan pupuk organik untuk mengurangi biaya input</li>
                    <li>• Terapkan sistem irigasi yang efisien</li>
                    <li>• Bergabung dengan kelompok tani untuk pembelian input bersama</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* No Data State */}
      {panenData.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">Belum Ada Data untuk Analisis</p>
              <p>Tambahkan data panen dan anggaran terlebih dahulu untuk melakukan analisis laba rugi.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
