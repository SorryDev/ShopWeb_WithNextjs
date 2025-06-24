'use client'

import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, BadgeCheck } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from "next/navigation"
import { Pen, Save, X } from 'lucide-react'
import { Input } from "@/components/ui/input"

interface PurchasedProduct {
  id: string
  product_id: string
  title: string
  description: string
  image: string
  purchased_at: string
  ip_server: string
  status: boolean
  last_ip_update: string | null
}

interface FinancialTransaction {
  id: string
  type: 'top-up' | 'purchase'
  amount: number
  points: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  details: string
}

interface UserRanks {
  vps_rank: number;
  machine_rank: number;
  base_rank: number;
}

interface EditingState {
  [key: string]: boolean;
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("purchases")
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([])
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>([])
  const [userRanks, setUserRanks] = useState<UserRanks | null>(null);
  const router = useRouter()
  const [editing, setEditing] = useState<EditingState>({});
  const [newIpAddresses, setNewIpAddresses] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);

  const fetchPurchasedProducts = useCallback(async () => {
    if (session?.user?.id) {
      try {
        const response = await fetch(`/api/user/purchased-products`)
        if (response.ok) {
          const data = await response.json()
          console.log(data)
          setPurchasedProducts(data)
        } else {
          console.error('Failed to fetch purchased products')
          setError('Failed to fetch purchased products. Please try again.')
        }
      } catch (error) {
        console.error('Error fetching purchased products:', error)
        setError('An error occurred while fetching purchased products. Please try again.')
      }
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchPurchasedProducts()
    async function fetchFinancialTransactions() {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user/financial-transactions`)
          if (response.ok) {
            const data = await response.json()
            setFinancialTransactions(data)
          } else {
            console.error('Failed to fetch financial transactions')
            setError('Failed to fetch financial transactions. Please try again.')
          }
        } catch (error) {
          console.error('Error fetching financial transactions:', error)
          setError('An error occurred while fetching financial transactions. Please try again.')
        }
      }
    }

    async function fetchUserRanks() {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user`)
          if (response.ok) {
            const data = await response.json()
            setUserRanks({
              vps_rank: data.vps_rank,
              machine_rank: data.machine_rank,
              base_rank: data.base_rank
            })
          } else {
            console.error('Failed to fetch user ranks')
            setError('Failed to fetch user ranks. Please try again.')
          }
        } catch (error) {
          console.error('Error fetching user ranks:', error)
          setError('An error occurred while fetching user ranks. Please try again.')
        }
      }
    }

    fetchFinancialTransactions()
    fetchUserRanks()
  }, [fetchPurchasedProducts, session?.user?.id])

  const handleUpdateIp = async (id: string, productId: string, newIpAddress: string) => {
    try {
      const response = await fetch('/api/user/update-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          productId,
          ipAddress: newIpAddress,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedProducts = purchasedProducts.map(product =>
           product.id === id ? { ...product, ip_server: newIpAddress, last_ip_update: new Date().toISOString() } : product
        );
        setPurchasedProducts(updatedProducts);
        setEditing(prevState => ({ ...prevState, [id]: false }));
        setError(null);
        alert('IP address updated successfully');
      } else {
        throw new Error(data.error || 'Failed to update IP address');
      }
    } catch (error) {
      console.error('Error updating IP address:', error);
      setError(`Failed to update IP address: ${(error as Error).message}`);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-white mb-6 text-center">โปรไฟล์ของคุณ</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="purchases" className="w-full max-w-4xl mx-auto">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="info" className="text-white data-[state=active]:text-black">
            ข้อมูลผู้ใช้
          </TabsTrigger>
          <TabsTrigger value="purchases" className="text-white data-[state=active]:text-black">
            สินค้าที่ซื้อ
          </TabsTrigger>
          <TabsTrigger value="financial" className="text-white data-[state=active]:text-black">
            การเงิน
          </TabsTrigger>
        </TabsList>

        <Alert variant="destructive" className="my-4 bg-[#1a1d21] border-none text-white">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            การถอนสิทธิ์จะทำได้ก็ต่อเมื่อ IP Server Verify เท่านั้น (ต้องรอประมาณ 5 ชั่วโมงหลังจากการเปลี่ยน IP ของเซิร์ฟเวอร์นั้นๆ)
            ** โปรดอย่าเปลี่ยนแปลงค่า IP ก่อนที่จะถอนสิทธิ์และรอจนกว่าจะถอนสิทธิ์ได้
          </AlertDescription>
        </Alert>

        <TabsContent value="info">
          <div className="bg-[#1a1d21] rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">โปรไฟล์ Discord</h2>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-700 rounded-lg" />
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium">
                    {session?.user?.name || 'User'}
                  </h3>
                  <span className="text-gray-400 text-sm">
                    lv {session?.user?.id?.slice(-4) || '0000'}.#{session?.user?.id?.slice(0,4) || '0000'}
                  </span>
                  <BadgeCheck className="w-5 h-5 text-[#5eead4]" />
                </div>
                <div className="text-gray-400 text-sm mb-1">
                  {session?.user?.email || 'email@example.com'}
                </div>
                {userRanks && (
                  <div className="flex gap-1.5 mb-3">
                    {userRanks.vps_rank === 1 && (
                      <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full text-xs">
                        <div className="w-2 h-2 rounded-full bg-[#ffd700]" />
                        <span className="text-[#ffd700]">ลูกค้า vps</span>
                      </div>
                    )}
                    {userRanks.machine_rank === 1 && (
                      <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full text-xs">
                        <div className="w-2 h-2 rounded-full bg-[#c0c0c0]" />
                        <span className="text-[#c0c0c0]">ลูกค้าเช่าเครื่อง</span>
                      </div>
                    )}
                    {userRanks.base_rank === 1 && (
                      <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full text-xs">
                        <div className="w-2 h-2 rounded-full bg-[#cd7f32]" />
                        <span className="text-[#cd7f32]">ลูกค้าเบส</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="bg-[#1a1d21]/50 rounded p-3 text-sm text-gray-400">
                  <p>คุณได้เชื่อมต่อกับ Base Devil Hunter</p>
                  <p className="mt-1">
                    หากคุณต้องการเปลี่ยนอีเมลหรือรหัสผ่านสามารถทำได้ที่ Partner ของเรา โปรดทำการติดต่อ Ticket ทาง Discord ครับหรือ ติดต่อทาง เว็บไซต์หลัก (ผ่าน E-mail ที่ใช้ Discord นี้ เพื่อยืนยันตัวตนก่อนทำรายการ ในนามของ Base Devil Hunter)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="purchases">
          <div className="bg-[#1a1d21] rounded-lg p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-400">วันและเวลาที่ซื้อ</TableHead>
                  <TableHead className="text-gray-400">สินค้า</TableHead>
                  <TableHead className="w-[100px] text-gray-400">สถานะ</TableHead>
                  <TableHead className="text-gray-400">IP Server</TableHead>
                  <TableHead className="text-gray-400">เวลาอัพเดต IP ล่าสุด</TableHead>
                  <TableHead className="w-[100px] text-gray-400">ตั้ง IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchasedProducts.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-white">{new Date(item.purchased_at).toLocaleString()}</TableCell>
                    <TableCell className="text-[#5eead4]">{item.title}</TableCell>
                    <TableCell>
                      {item.status ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-red-500">✕</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {editing[item.id] ? (
                        <Input
                          value={newIpAddresses[item.id] || item.ip_server}
                          onChange={(e) => setNewIpAddresses({ ...newIpAddresses, [item.id]: e.target.value })}
                          className="bg-white text-black"
                        />
                      ) : (
                        item.ip_server || 'Not set'
                      )}
                    </TableCell>
                    <TableCell className="text-white">
                      {item.last_ip_update ? new Date(item.last_ip_update).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {editing[item.id] ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateIp(item.id, item.product_id, newIpAddresses[item.id])}
                            className="text-green-500 hover:text-green-600"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setEditing({ ...editing, [item.id]: false });
                              setNewIpAddresses({ ...newIpAddresses, [item.id]: item.ip_server });
                            }}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditing({ ...editing, [item.id]: true })}
                          className="text-[#5eead4] hover:text-[#4fd1c5]"
                        >
                          <Pen size={18} />
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <div className="bg-[#1a1d21] rounded-lg p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-400">วันและเวลา</TableHead>
                  <TableHead className="text-gray-400">ประเภท</TableHead>
                  <TableHead className="text-gray-400">จำนวนเงิน</TableHead>
                  <TableHead className="text-gray-400">จำนวน Points</TableHead>
                  <TableHead className="text-gray-400">สถานะ</TableHead>
                  <TableHead className="text-gray-400">รายละเอียด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-white">{new Date(transaction.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-white">
                      {transaction.type === 'top-up' ? 'เติมเงิน' : 'ซื้อสินค้า'}
                    </TableCell>
                    <TableCell className="text-white">{transaction.amount}</TableCell>
                    <TableCell className="text-white">{transaction.points}</TableCell>
                    <TableCell className="text-white">
                      {transaction.status === 'pending' && <span className="text-yellow-500">รอดำเนินการ</span>}
                      {transaction.status === 'approved' && <span className="text-green-500">อนุมัติแล้ว</span>}
                      {transaction.status === 'rejected' && <span className="text-red-500">ปฏิเสธ</span>}
                    </TableCell>
                    <TableCell className="text-white">{transaction.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
