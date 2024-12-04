import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">เกิดข้อผิดพลาด</h1>
        <p className="text-red-500">{error || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'}</p>
        <a href="/" className="mt-4 text-blue-500 hover:underline">กลับไปหน้าหลัก</a>
      </div>
    </div>
  )
}
