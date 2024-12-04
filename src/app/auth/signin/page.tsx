import { getProviders, signIn } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function SignIn({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  const providers = await getProviders()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">เข้าสู่ระบบ</h1>
        {providers &&
          Object.values(providers).map((provider) => (
            <div key={provider.name}>
              <button
                className="bg-[#5865F2] text-white px-4 py-2 rounded-md hover:bg-[#5865F2]/90 transition flex items-center gap-2"
                onClick={() => signIn(provider.id, { callbackUrl: searchParams.callbackUrl || "/" })}
              >
                เข้าสู่ระบบด้วย {provider.name}
              </button>
            </div>
          ))}
      </div>
    </div>
  )
}

