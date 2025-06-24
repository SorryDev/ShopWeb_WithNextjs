import Image from 'next/image'
import Link from 'next/link'

const products = [
  { id: '1', title: '[Casino] NC Sicbo', description: 'สุดยิ่งใหญ่', points: 3200 },
  { id: '2', title: 'NC Itemset', description: '[All-in-One] เสื้อผ้า, เครื่องประดับ, หมวก เซ็ต', points: 2700 },
  { id: '3', title: '[Casino] NC Baccarat', description: 'เรียบหรู ขอบทองอร่าม', points: 2900 },
  { id: '4', title: 'NC Music Players', description: 'เค��ื่องเล่นเพลงที่ใช้งานง่าย', points: 2800 },
  { id: '5', title: 'NC Garage', description: 'ตกแต่ง รถ, อู่ซ่อมรถ (มาพร้อมความมันส์ เต็ม Step)', points: 3800 },
]

export default function ProductGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-white text-xl">สินค้าใหม่ล่าสุด</h2>
        <Link href="/all" className="text-[#5eead4] hover:underline">ดูทั้งหมด</Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
            <div className="aspect-[2/1] relative">
              <Image
                src={`/placeholder.svg?height=200&width=400`}
                alt={product.title}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="p-4">
              <div className="mb-4">
                <div className="text-gray-400 text-sm mb-1">สคริปต์</div>
                <h3 className="text-white font-medium">{product.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{product.description}</p>
              </div>
              <div className="text-[#5eead4]">{product.points.toLocaleString()} Points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
