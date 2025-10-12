import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"

const userApi = axios.create({
  baseURL: `${API_URL}/users`,
  withCredentials: true,
})

// Function to get all sellers
export const getAllSellers = async () => {
  try {
    const response = await userApi.get("/sellers")
    return response.data
  } catch (error) {
    throw error.response.data
  }
}
