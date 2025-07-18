"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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

interface StatistikSummary {
  totalPanen: number
  totalPenjualan: number
  totalBiaya: number
  rataRataHarga: number
  produktivitasPerHa: number
  jumlahLahan: number
  tanamanTerbanyak: string
  kualitasRataRata: string
}

export default function StatistikPanenPage() {
  const [panenData, setPanenData] = useState<PanenData[]>([])
  const [filteredData, setFilteredData] = useState<PanenData[]>([])
  const [filterTanaman, setFilterTanaman] = useState("semua")
  const [filterTahun, setFilterTahun] = useState("semua")
  const [filterKualitas, setFilterKualitas] = useState("semua")

  useEffect(() => {
    const saved = localStorage.getItem("panenData")
    if (saved) {
      const data = JSON.parse(saved)
      setPanenData(data)
      setFilteredData(data)
    }
  }, [])

  useEffect(() => {
    let filtered = [...panenData]

    if (filterTanaman !== "semua") {
      filtered = filtered.filter(item => item.jenisTanaman.toLowerCase() === filterTanaman.toLowerCase())
    }

    if (filterTahun !== "semua") {
      filtered = filtered.filter(item => {
        const tahunPanen = new Date(item.tanggalPanen).getFullYear().toString()
        return tahunPanen === filterTahun
      })
    }

    if (filterKualitas !== "semua") {
      filtered = filtered.filter(item => item.kualitasPanen === filterKualitas)
    }

    setFilteredData(filtered)
  }, [panenData, filterTanaman, filterTahun, filterKualitas])

  const calculateStatistik = (): StatistikSummary => {
    if (filteredData.length === 0) {
      return {
        totalPanen: 0,
        totalPenjualan: 0,
        totalBiaya: 0,
        rataRataHarga: 0,
        produktivitasPerHa: 0,
        jumlahLahan: 0,
        tanamanTerbanyak: "-",
        kualitasRataRata: "-"
      }
    }

    const totalPanen = filteredData.reduce((sum, item) => sum + item.jumlahPanen, 0)
    const totalPenjualan = filteredData.reduce((sum, item) => sum + item.totalPenjualan, 0)
    const totalBiaya = filteredData.reduce((sum, item) => sum + item.biayaPanen, 0)
    const totalLuasLahan = filteredData.reduce((sum, item) => sum + item.luasLahan, 0)
    const rataRataHarga = totalPenjualan / totalPanen || 0
    const produktivitasPerHa = totalLuasLahan > 0 ? totalPanen / totalLuasLahan : 0

    // Hitung tanaman terbanyak
    const tanamanCount: { [key: string]: number } = {}
    filteredData.forEach(item => {
      tanamanCount[item.jenisTanaman] = (tanamanCount[item.jenisTanaman] || 0) + 1
    })
    const tanamanTerbanyak = Object.keys(tanamanCount).reduce((a, b) => 
      tanamanCount[a] > tanamanCount[b] ? a : b, "-"
    )

    // Hitung kualitas rata-rata
    const kualitasScore: { [key: string]: number } = {
      "sangat-baik": 4,
      "baik": 3,
      "sedang": 2,
      "kurang": 1
    }
    const totalKualitasScore = filteredData.reduce((sum, item) => 
      sum + (kualitasScore[item.kualitasPanen] || 0), 0
    )
    const rataRataKualitasScore = totalKualitasScore / filteredData.length
    let kualitasRataRata = "-"
    if (rataRataKualitasScore >= 3.5) kualitasRataRata = "Sangat Baik"
    else if (rataRataKualitasScore >= 2.5) kualitasRataRata = "Baik"
    else if (rataRataKualitasScore >= 1.5) kualitasRataRata = "Sedang"
    else if (rataRataKualitasScore >= 1) kualitasRataRata = "Kurang"

    const uniqueLahan = new Set(filteredData.map(item => item.namaLahan))

    return {
      totalPanen,
      totalPenjualan,
      totalBiaya,
      rataRataHarga,
      produktivitasPerHa,
      jumlahLahan: uniqueLahan.size,
      tanamanTerbanyak,
      kualitasRataRata
    }
  }

  const getUniqueValues = (field: keyof PanenData) => {
    return [...new Set(panenData.map(item => item[field] as string))]
  }

  const getUniqueYears = () => {
    return [...new Set(panenData.map(item => new Date(item.tanggalPanen).getFullYear().toString()))]
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getKualitasBadge = (kualitas: string) => {
    switch (kualitas) {
      case "sangat-baik":
        return <Badge className="bg-green-100 text-green-800">Sangat Baik</Badge>
      case "baik":
        return <Badge className="bg-blue-100 text-blue-800">Baik</Badge>
      case "sedang":
        return <Badge className="bg-yellow-100 text-yellow-800">Sedang</Badge>
      case "kurang":
        return <Badge className="bg-red-100 text-red-800">Kurang</Badge>
      default:
        return <Badge variant="outline">{kualitas}</Badge>
    }
  }

  const statistik = calculateStatistik()

  // Group data by tanaman untuk chart sederhana
  const dataByTanaman = filteredData.reduce((acc, item) => {
    if (!acc[item.jenisTanaman]) {
      acc[item.jenisTanaman] = {
        totalPanen: 0,
        totalPenjualan: 0,
        count: 0
      }
    }
    acc[item.jenisTanaman].totalPanen += item.jumlahPanen
    acc[item.jenisTanaman].totalPenjualan += item.totalPenjualan
    acc[item.jenisTanaman].count += 1
    return acc
  }, {} as { [key: string]: { totalPanen: number, totalPenjualan: number, count: number } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Statistik Panen</h1>
        <p className="text-gray-600">Analisis dan ringkasan data hasil panen</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Data</CardTitle>
          <CardDescription>
            Filter data panen berdasarkan kriteria tertentu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Jenis Tanaman</Label>
              <Select value={filterTanaman} onValueChange={setFilterTanaman}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tanaman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Tanaman</SelectItem>
                  {getUniqueValues('jenisTanaman').map(tanaman => (
                    <SelectItem key={tanaman} value={tanaman}>{tanaman}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tahun Panen</Label>
              <Select value={filterTahun} onValueChange={setFilterTahun}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Tahun</SelectItem>
                  {getUniqueYears().map(tahun => (
                    <SelectItem key={tahun} value={tahun}>{tahun}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kualitas Panen</Label>
              <Select value={filterKualitas} onValueChange={setFilterKualitas}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kualitas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kualitas</SelectItem>
                  <SelectItem value="sangat-baik">Sangat Baik</SelectItem>
                  <SelectItem value="baik">Baik</SelectItem>
                  <SelectItem value="sedang">Sedang</SelectItem>
                  <SelectItem value="kurang">Kurang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{statistik.totalPanen.toLocaleString('id-ID')}</div>
            <div className="text-sm text-gray-600">Total Panen (kg)</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(statistik.totalPenjualan)}</div>
            <div className="text-sm text-gray-600">Total Penjualan</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">{statistik.produktivitasPerHa.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Produktivitas (kg/ha)</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">{statistik.jumlahLahan}</div>
            <div className="text-sm text-gray-600">Jumlah Lahan</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Statistik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Biaya Panen:</span>
              <span className="font-medium">{formatCurrency(statistik.totalBiaya)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rata-rata Harga:</span>
              <span className="font-medium">{formatCurrency(statistik.rataRataHarga)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tanaman Terbanyak:</span>
              <span className="font-medium">{statistik.tanamanTerbanyak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kualitas Rata-rata:</span>
              <span className="font-medium">{statistik.kualitasRataRata}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Keuntungan Kotor:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(statistik.totalPenjualan - statistik.totalBiaya)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Panen per Jenis Tanaman</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(dataByTanaman).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada data untuk ditampilkan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(dataByTanaman).map(([tanaman, data]) => (
                  <div key={tanaman} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{tanaman}</span>
                      <span className="text-sm text-gray-600">{data.count} kali panen</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(data.totalPanen / statistik.totalPanen) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{data.totalPanen.toLocaleString('id-ID')} kg</span>
                      <span>{formatCurrency(data.totalPenjualan)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Detail Panen</CardTitle>
          <CardDescription>
            Menampilkan {filteredData.length} dari {panenData.length} data panen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Tidak ada data panen yang sesuai dengan filter.</p>
              <p className="text-sm">Coba ubah filter atau tambahkan data panen baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Lahan</TableHead>
                    <TableHead>Tanaman</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Kualitas</TableHead>
                    <TableHead>Harga/kg</TableHead>
                    <TableHead>Total Penjualan</TableHead>
                    <TableHead>Produktivitas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell>{new Date(data.tanggalPanen).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="font-medium">{data.namaLahan}</TableCell>
                      <TableCell>{data.jenisTanaman}</TableCell>
                      <TableCell>{data.jumlahPanen} {data.satuanPanen}</TableCell>
                      <TableCell>{getKualitasBadge(data.kualitasPanen)}</TableCell>
                      <TableCell>{formatCurrency(data.hargaJual)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(data.totalPenjualan)}</TableCell>
                      <TableCell>
                        {data.luasLahan > 0 ? `${(data.jumlahPanen / data.luasLahan).toFixed(1)} kg/ha` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trend (Simple) */}
      {filteredData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tren Panen Bulanan</CardTitle>
            <CardDescription>
              Distribusi panen berdasarkan bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const monthlyData = filteredData.reduce((acc, item) => {
                const month = new Date(item.tanggalPanen).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                if (!acc[month]) {
                  acc[month] = { totalPanen: 0, totalPenjualan: 0, count: 0 }
                }
                acc[month].totalPanen += item.jumlahPanen
                acc[month].totalPenjualan += item.totalPenjualan
                acc[month].count += 1
                return acc
              }, {} as { [key: string]: { totalPanen: number, totalPenjualan: number, count: number } })

              const maxPanen = Math.max(...Object.values(monthlyData).map(d => d.totalPanen))

              return (
                <div className="space-y-4">
                  {Object.entries(monthlyData).map(([month, data]) => (
                    <div key={month} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{month}</span>
                        <span className="text-sm text-gray-600">{data.count} kali panen</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full" 
                          style={{ 
                            width: `${(data.totalPanen / maxPanen) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{data.totalPanen.toLocaleString('id-ID')} kg</span>
                        <span>{formatCurrency(data.totalPenjualan)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
