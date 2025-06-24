import { DiscordLogoIcon } from '@radix-ui/react-icons'

export default function Hero() {
  return (
    <div className="max-w-3xl mx-auto text-center pt-24 pb-16">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 space-y-6">
        <h1 className="text-2xl text-white">
          ร้านของเรา คือสุดยอดสคริปต์ <span className="text-orange-500">FiveM</span> เพื่อเพิ่มประสบการณ์ดีๆใน Server คุณ
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-[#1a1d21] text-white px-4 py-2 rounded-md hover:bg-[#1a1d21]/80 transition">
            เข้าสู่ระบบเลย!
          </button>
          <button className="bg-[#5865F2] text-white px-4 py-2 rounded-md hover:bg-[#5865F2]/90 transition flex items-center justify-center gap-2">
            <DiscordLogoIcon className="w-5 h-5" />
            LOGIN WITH DISCORD
          </button>
        </div>
      </div>
    </div>
  )
}
