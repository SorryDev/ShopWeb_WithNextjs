'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Product } from "@/app/actions/products"

export default function ManageScripts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [scripts, setScripts] = useState<Product[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/")
    } else if (status === "authenticated" && session?.user?.role === "admin") {
      fetchScripts()
    }
  }, [status, session, router])

  const fetchScripts = async () => {
    const response = await fetch('/api/admin/scripts')
    if (response.ok) {
      const data = await response.json()
      setScripts(data)
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "authenticated" && session?.user?.role === "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Manage Scripts</h1>
        <Link href="/admin/scripts/new" className="mb-4 inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
          Add New Script
        </Link>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Points</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scripts.map((script) => (
                <tr key={script.id}>
                  <td className="border px-4 py-2 ">{script.title}</td>
                  <td className="border px-4 py-2">{script.category}</td>
                  <td className="border px-4 py-2">{script.points}</td>
                  <td className="border px-4 py-2">
                    <Link href={`/admin/scripts/${script.id}`} className="text-blue-500 hover:underline mr-2">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(script.id)} className="text-red-500 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return null
}

async function handleDelete(id: string) {
  if (confirm('Are you sure you want to delete this script?')) {
    const response = await fetch(`/api/admin/scripts/${id}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      // Refresh the script list
      window.location.reload()
    } else {
      alert('Failed to delete the script')
    }
  }
}
