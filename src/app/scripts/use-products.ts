'use client'

import { useEffect, useState } from 'react'
import { getProducts, Product } from '../actions/products'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const fetchedProducts = await getProducts()
      setProducts(fetchedProducts)
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return { products, loading }
}

