import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function SignIn() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/')
  }

  redirect('/api/auth/signin/discord')
}

