import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"

const adminApi = axios.create({
  baseURL: `${API_URL}/admin`,
  withCredentials: true,
})

// Function to get all products for admin
export const getAllProducts = async (params = {}) => {
  try {
    const response = await adminApi.get("/products", { params })
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

// Function to get a single product by ID
export const getProduct = async (productId) => {
  try {
    const response = await adminApi.get(`/products/${productId}`)
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

// Function to update a product
export const updateProduct = async (productId, productData) => {
  try {
    const response = await adminApi.put(`/products/${productId}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    throw error.response.data
  }
}

// Function to delete a product
export const deleteProduct = async (productId) => {
  try {
    const response = await adminApi.delete(`/products/${productId}`)
    return response.data
  } catch (error) {
    throw error.response.data
  }
}
