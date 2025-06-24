import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Database, Key } from "lucide-react"

export default function SetupRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">ต้องการการตั้งค่าเพิ่มเติม</CardTitle>
          <CardDescription>กรุณาเพิ่ม integrations ที่จำเป็นเพื่อใช้งานระบบ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-start space-x-4 p-4 border rounded-lg">
              <Database className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">Supabase Integration</h3>
                <p className="text-sm text-gray-600 mt-1">จำเป็นสำหรับ authentication และ database</p>
                <p className="text-xs text-gray-500 mt-2">คลิก "Add Supabase integration" ด้านล่างเพื่อเพิ่ม</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 border rounded-lg">
              <Key className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold">Vercel Blob Integration</h3>
                <p className="text-sm text-gray-600 mt-1">จำเป็นสำหรับการจัดเก็บไฟล์</p>
                <p className="text-xs text-gray-500 mt-2">คลิก "Add Vercel Blob integration" ด้านล่างเพื่อเพิ่ม</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">ขั้นตอนการตั้งค่า:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. เพิ่ม Supabase integration</li>
              <li>2. เพิ่ม Vercel Blob integration</li>
              <li>3. รัน database scripts</li>
              <li>4. ตั้งค่า Discord OAuth ใน Supabase</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
