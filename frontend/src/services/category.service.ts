import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"

const categoryApi = axios.create({
  baseURL: `${API_URL}/categories`,
  withCredentials: true,
})

// Function to get all categories
export const getAllCategories = async () => {
  try {
    const response = await categoryApi.get("/")
    return response.data
  } catch (error) {
    throw error.response.data
  }
}
