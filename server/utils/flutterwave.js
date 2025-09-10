const axios = require("axios")
const crypto = require("crypto")

const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3"

// Create Flutterwave API client
const flutterwaveAPI = axios.create({
  baseURL: FLUTTERWAVE_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
})

// Initialize payment
const initializePayment = async (paymentData) => {
  try {
    const response = await flutterwaveAPI.post("/payments", paymentData)
    return response.data
  } catch (error) {
    console.error("Flutterwave payment initialization error:", error.response?.data || error.message)
    throw new Error("Payment initialization failed")
  }
}

// Verify payment
const verifyPayment = async (transactionId) => {
  try {
    const response = await flutterwaveAPI.get(`/transactions/${transactionId}/verify`)
    return response.data
  } catch (error) {
    console.error("Flutterwave payment verification error:", error.response?.data || error.message)
    throw new Error("Payment verification failed")
  }
}

// Get transaction details
const getTransaction = async (transactionId) => {
  try {
    const response = await flutterwaveAPI.get(`/transactions/${transactionId}`)
    return response.data
  } catch (error) {
    console.error("Flutterwave get transaction error:", error.response?.data || error.message)
    throw new Error("Failed to get transaction details")
  }
}

// Initiate transfer (for withdrawals)
const initiateTransfer = async (transferData) => {
  try {
    const response = await flutterwaveAPI.post("/transfers", transferData)
    return response.data
  } catch (error) {
    console.error("Flutterwave transfer error:", error.response?.data || error.message)
    throw new Error("Transfer initiation failed")
  }
}

// Verify transfer
const verifyTransfer = async (transferId) => {
  try {
    const response = await flutterwaveAPI.get(`/transfers/${transferId}`)
    return response.data
  } catch (error) {
    console.error("Flutterwave transfer verification error:", error.response?.data || error.message)
    throw new Error("Transfer verification failed")
  }
}

// Get banks list
const getBanks = async (country = "NG") => {
  try {
    const response = await flutterwaveAPI.get(`/banks/${country}`)
    return response.data
  } catch (error) {
    console.error("Flutterwave get banks error:", error.response?.data || error.message)
    throw new Error("Failed to get banks list")
  }
}

// Resolve bank account
const resolveBankAccount = async (accountNumber, bankCode) => {
  try {
    const response = await flutterwaveAPI.post("/accounts/resolve", {
      account_number: accountNumber,
      account_bank: bankCode,
    })
    return response.data
  } catch (error) {
    console.error("Flutterwave account resolution error:", error.response?.data || error.message)
    throw new Error("Account resolution failed")
  }
}

// Verify webhook signature
const verifyWebhookSignature = (payload, signature) => {
  const hash = crypto.createHmac("sha256", process.env.FLUTTERWAVE_WEBHOOK_SECRET).update(payload).digest("hex")
  return hash === signature
}

// Generate payment reference
const generatePaymentReference = (prefix = "NSP") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

// Calculate commission
const calculateCommission = (amount, rate = null) => {
  const commissionRate = rate || Number.parseFloat(process.env.PLATFORM_COMMISSION_RATE) || 0.05
  const commissionAmount = Math.round(amount * commissionRate)
  const sellerEarning = amount - commissionAmount

  return {
    commissionRate,
    commissionAmount,
    sellerEarning,
  }
}

// Format amount for Flutterwave (they expect amounts in kobo for NGN)
const formatAmount = (amount, currency = "NGN") => {
  if (currency === "NGN") {
    return amount // Flutterwave now accepts amounts in Naira
  }
  return amount
}

module.exports = {
  initializePayment,
  verifyPayment,
  getTransaction,
  initiateTransfer,
  verifyTransfer,
  getBanks,
  resolveBankAccount,
  verifyWebhookSignature,
  generatePaymentReference,
  calculateCommission,
  formatAmount,
}
