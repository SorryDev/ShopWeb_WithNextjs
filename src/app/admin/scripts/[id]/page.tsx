'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Product } from "@/app/actions/products"

export default function EditScript({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [script, setScript] = useState<Product | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/")
    } else if (status === "authenticated" && session?.user?.role === "admin" && params.id !== "new") {
      fetchScript()
    }
  }, [status, session, router, params.id])

  const fetchScript = async () => {
    const response = await fetch(`/api/admin/scripts/${params.id}`)
    if (response.ok) {
      const data = await response.json()
      setScript(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const scriptData = Object.fromEntries(formData.entries())

    const url = params.id === "new" ? '/api/admin/scripts' : `/api/admin/scripts/${params.id}`
    const method = params.id === "new" ? 'POST' : 'PUT'

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scriptData),
    })

    if (response.ok) {
      router.push('/admin/scripts')
    } else {
      alert('Failed to save the script')
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "authenticated" && session?.user?.role === "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{params.id === "new" ? "Add New Script" : "Edit Script"}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-1">Title</label>
            <input type="text" id="title" name="title" required className="w-full px-3 py-2 border rounded text-black" defaultValue={script?.title} />
          </div>
          <div>
            <label htmlFor="category" className="block mb-1">Category</label>
            <input type="text" id="category" name="category" required className="w-full px-3 py-2 border rounded text-black" defaultValue={script?.category} />
          </div>
          <div>
            <label htmlFor="description" className="block mb-1">Description</label>
            <textarea id="description" name="description" required className="w-full px-3 py-2 border rounded text-black" defaultValue={script?.description}></textarea>
          </div>
          <div>
            <label htmlFor="points" className="block mb-1">Points</label>
            <input type="number" id="points" name="points" required className="w-full px-3 py-2 border rounded text-black" defaultValue={script?.points} />
          </div>
          <div>
            <label htmlFor="image" className="block mb-1">Image URL</label>
            <input type="url" id="image" name="image" required className="w-full px-3 py-2 border rounded text-black" defaultValue={script?.image} />
          </div>
          <div>
            <label htmlFor="video_url" className="block mb-1">Video URL (optional)</label>
            <input type="url" id="video_url" name="video_url" className="w-full px-3 py-2 border rounded text-black" defaultValue={script?.video_url || ''} />
          </div>
          <div>
            <label htmlFor="version" className="block mb-1">Version</label>
            <input type="text" id="version" name="version" required className="w-full px-3 py-2 border rounded text-black" defaultValue={script?.version} />
          </div>
          <div>
            <label htmlFor="details" className="block mb-1">Details</label>
            <textarea id="details" name="details" required className="w-full px-3 py-2 border rounded text-black" defaultValue={script?.details}></textarea>
          </div>
          <div>
            <label htmlFor="requirements" className="block mb-1">Requirements</label>
            <textarea id="requirements" name="requirements" required className="w-full px-3 py-2 border rounded text-black" defaultValue={script?.requirements}></textarea>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            Save Script
          </button>
        </form>
      </div>
    )
  }

  return null
}

