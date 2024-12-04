'use client'

import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"
import { CalendarIcon, Upload } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const POINT_AMOUNTS = [1000, 2000, 4000, 7500, 10000]
const POINTS_RATE = 100 // 100 points per 100 baht
const TRUEWALLET_FEE = 20 // 20 baht fee for True Wallet

export default function TopUpPage() {
  const { data: session } = useSession()
  const [selectedTab, setSelectedTab] = useState('bank_transfer')
  const [points, setPoints] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [userPoints, setUserPoints] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handlePointsChange = (value: string) => {
    setPoints(value)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const calculateAmount = () => {
    const pointsNum = parseInt(points) || 0
    const baseAmount = (pointsNum / POINTS_RATE) * 100
    return selectedTab === 'true_wallet' ? baseAmount + TRUEWALLET_FEE : baseAmount
  }

  const handleSubmit = async () => {
    if (!session?.user?.id || !points || !date || !previewUrl) {
      alert('Please fill in all required fields')
      return
    }

    const formData = new FormData()
    formData.append('userId', session.user.id)
    formData.append('points', points)
    formData.append('amount', calculateAmount().toString())
    formData.append('paymentMethod', selectedTab)
    formData.append('date', date.toISOString())
    //removed image from formData
    formData.append('proof', previewUrl)

    try {
      const response = await fetch('/api/topup', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        alert('Top-up request submitted successfully!')
        setPoints('')
        setDate(null)
        setPreviewUrl(null)
      } else {
        throw new Error('Failed to submit top-up request')
      }
    } catch {
      alert('Failed to submit top-up request')
    }
  }

  useEffect(() => {
    async function fetchUserPoints() {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user')
          if (response.ok) {
            const data = await response.json()
            setUserPoints(data.points)
          } else {
            console.error('Failed to fetch user points')
          }
        } catch (error) {
          console.error('Error fetching user points:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchUserPoints()
  }, [session?.user?.id])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="bg-[#1a1d21] rounded-lg p-4 mb-6">
            <h2 className="text-sm text-gray-400">แต้มคงเหลือ</h2>
            <div className="text-3xl text-[#5eead4]">
              {isLoading ? 'Loading...' : userPoints !== null ? `${userPoints.toLocaleString()} Points` : 'N/A'}
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-6">เติมแต้มสะสม</h2>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="bank_transfer" className="data-[state=active]:bg-[#5eead4] data-[state=active]:text-black">
                <div className="flex items-center gap-2">
                  <Image src="/bank-icon.png" alt="Bank Transfer" width={24} height={24} />
                  Bank Transfer
                </div>
              </TabsTrigger>
              <TabsTrigger value="true_wallet" className="data-[state=active]:bg-[#5eead4] data-[state=active]:text-black">
                <div className="flex items-center gap-2">
                  <Image src="/truewallet-icon.png" alt="True Wallet" width={24} height={24} />
                  True Money Wallet
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bank_transfer">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">ช่องทางการชำระเงิน</h3>
                <div className="bg-white p-4 rounded-lg">
                  <Image
                    src="/qr-code.png"
                    alt="QR Code"
                    width={300}
                    height={300}
                    className="mx-auto"
                  />
                  <div className="text-center mt-4">
                    <p className="font-medium">NC Developer</p>
                    <p className="text-sm text-gray-600">บัญชี: นาย ณัฐวุฒิ เจริญสุข</p>
                    <p className="text-sm text-gray-600">เลขที่บัญชี: XXXXXXXXXX1234</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="true_wallet">
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">ช่องทางการชำระเงิน</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>ชื่อผู้รับ</Label>
                    <p className="text-gray-600">นายณัฐวุฒิ เจริญสุข</p>
                  </div>
                  <div>
                    <Label>เบอร์โทรศัพท์มือถือ</Label>
                    <p className="text-gray-600">081-110-0700</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <div className="space-y-6">
              <div>
                <Label htmlFor="points">จำนวน Points</Label>
                <Input
                  id="points"
                  value={points}
                  onChange={(e) => handlePointsChange(e.target.value)}
                  className="mt-1"
                />
                <div className="flex gap-2 mt-2">
                  {POINT_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePointsChange(amount.toString())}
                    >
                      {amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm">ผลลัพธ์การชำระ</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>ยอดชำระ (ยอดโอน)</div>
                  <div className="text-right">{calculateAmount()} บาท</div>
                  {selectedTab === 'true_wallet' && (
                    <>
                      <div>ค่าธรรมเนียมโอน</div>
                      <div className="text-right">{TRUEWALLET_FEE} บาท</div>
                    </>
                  )}
                  <div>จะได้รับ (เมื่อชำระเข้า)</div>
                  <div className="text-right">{points || 0} Points</div>
                </div>
              </div>

              <div>
                <Label>วันเวลาที่โอนเงิน</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP HH:mm") : <span>เลือกวันและเวลา</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <DatePicker
                      selected={date}
                      onChange={(date: Date | null) => setDate(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={1}
                      dateFormat="MMMM d, yyyy HH:mm"
                      inline
                      className="bg-white text-black"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>อัพโหลดรูปภาพสลิป</Label>
                <div className="mt-1">
                  <Label
                    htmlFor="proof"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-700/10"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2" />
                      <p className="text-sm text-gray-500">อัพโหลดรูปภาพสลิป</p>
                    </div>
                    <input
                      id="proof"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </Label>
                  {previewUrl && (
                    <div className="mt-2">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button
                className="w-full bg-[#5eead4] text-black hover:bg-[#5eead4]/90"
                onClick={handleSubmit}
              >
                ส่งหลักฐานการโอนเงิน
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

