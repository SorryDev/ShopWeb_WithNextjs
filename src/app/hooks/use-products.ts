'use client'

import { useState, useEffect } from 'react'
import { getProducts, getProductById, Product } from '../actions/products'

export function useProducts(id?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (id) {
        const fetchedProduct = await getProductById(id)
        setProduct(fetchedProduct)
      } else {
        const fetchedProducts = await getProducts()
        setProducts(fetchedProducts)
      }
      setLoading(false)
    }

    fetchData()
  }, [id])

  return { products, product, isLoading: loading }
}

