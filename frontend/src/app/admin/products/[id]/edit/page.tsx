"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { getProduct, updateProduct } from "@/services/admin.service"
import { getAllSellers } from "@/services/user.service"
import { getAllCategories } from "@/services/category.service"

const EditProductPage = () => {
  const router = useRouter()
  const params = useParams()
  const { id } = params

  const [product, setProduct] = useState({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    price: 0,
    discountPrice: 0,
    tags: [],
    seller: "",
    isActive: true,
  })
  const [thumbnail, setThumbnail] = useState(null)
  const [sellers, setSellers] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await getProduct(id)
        setProduct({
          ...productData.product,
          category: productData.product.category._id,
          seller: productData.product.seller._id,
          tags: productData.product.tags || [],
        })
        const sellersData = await getAllSellers()
        setSellers(sellersData.users)
        const categoriesData = await getAllCategories()
        setCategories(categoriesData.categories)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (id) {
      fetchData()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      Object.keys(product).forEach((key) => {
        if (key === "tags") {
          formData.append(key, JSON.stringify(product[key]))
        } else {
          formData.append(key, product[key])
        }
      })
      if (thumbnail) {
        formData.append("thumbnail", thumbnail)
      }
      await updateProduct(id, formData)
      router.push("/admin/products")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={product.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
              Thumbnail
            </label>
            <input
              type="file"
              name="thumbnail"
              id="thumbnail"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="seller" className="block text-sm font-medium text-gray-700">
              Seller
            </label>
            <select
              name="seller"
              id="seller"
              value={product.seller}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select a seller</option>
              {sellers.map((seller) => (
                <option key={seller._id} value={seller._id}>
                  {seller.businessName || `${seller.firstName} ${seller.lastName}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              name="price"
              id="price"
              value={product.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700">
              Discount Price
            </label>
            <input
              type="number"
              name="discountPrice"
              id="discountPrice"
              value={product.discountPrice}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              id="category"
              value={product.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
              Short Description
            </label>
            <textarea
              name="shortDescription"
              id="shortDescription"
              rows={3}
              value={product.shortDescription}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={6}
              value={product.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              id="tags"
              value={product.tags.join(", ")}
              onChange={(e) => setProduct((prev) => ({ ...prev, tags: e.target.value.split(",").map((t) => t.trim()) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={product.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Is Active
              </label>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditProductPage
