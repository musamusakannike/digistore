import axios from "axios"
import crypto from "crypto"

const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3"

interface InitializePaymentData {
  amount: number
  currency: string
  email: string
  name: string
  phone?: string
  reference: string
  redirectUrl: string
  metadata?: any
}

interface VerifyPaymentResponse {
  status: string
  message: string
  data: {
    id: number
    tx_ref: string
    flw_ref: string
    amount: number
    currency: string
    charged_amount: number
    status: string
    payment_type: string
    customer: {
      id: number
      email: string
      name: string
      phone_number: string
    }
    meta?: any
  }
}

export class FlutterwaveService {
  private secretKey: string
  private publicKey: string
  private encryptionKey: string

  constructor() {
    this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY || ""
    this.publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY || ""
    this.encryptionKey = process.env.FLUTTERWAVE_ENCRYPTION_KEY || ""
  }

  private ensureConfigured() {
    if (!this.secretKey || !this.publicKey) {
      throw new Error("Flutterwave credentials not configured")
    }
  }

  async initializePayment(data: InitializePaymentData): Promise<any> {
    try {
      this.ensureConfigured()
      const response = await axios.post(
        `${FLUTTERWAVE_BASE_URL}/payments`,
        {
          tx_ref: data.reference,
          amount: data.amount,
          currency: data.currency,
          redirect_url: data.redirectUrl,
          payment_options: "card,banktransfer,ussd,mobilemoney",
          customer: {
            email: data.email,
            name: data.name,
            phonenumber: data.phone || "",
          },
          customizations: {
            title: "DigiStore",
            description: "Payment for digital products",
            logo: `${process.env.FRONTEND_URL}/logo.png`,
          },
          meta: data.metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        },
      )

      return response.data
    } catch (error: any) {
      console.error("Flutterwave initialization error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "Failed to initialize payment")
    }
  }

  async verifyPayment(transactionId: string): Promise<VerifyPaymentResponse> {
    try {
      this.ensureConfigured()
      const response = await axios.get(`${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      })

      return response.data
    } catch (error: any) {
      console.error("Flutterwave verification error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "Failed to verify payment")
    }
  }

  async verifyPaymentByReference(reference: string): Promise<VerifyPaymentResponse> {
    try {
      this.ensureConfigured()
      const response = await axios.get(`${FLUTTERWAVE_BASE_URL}/transactions/verify_by_reference`, {
        params: { tx_ref: reference },
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      })

      return response.data
    } catch (error: any) {
      console.error("Flutterwave verification error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "Failed to verify payment")
    }
  }

  verifyWebhookSignature(signature: string, payload: any): boolean {
    const hash = crypto.createHmac("sha256", this.secretKey).update(JSON.stringify(payload)).digest("hex")
    return hash === signature
  }

  async getTransaction(transactionId: string): Promise<any> {
    try {
      this.ensureConfigured()
      const response = await axios.get(`${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      })

      return response.data
    } catch (error: any) {
      console.error("Flutterwave get transaction error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "Failed to get transaction")
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<any> {
    try {
      this.ensureConfigured()
      const response = await axios.post(
        `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/refund`,
        {
          amount,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        },
      )

      return response.data
    } catch (error: any) {
      console.error("Flutterwave refund error:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "Failed to process refund")
    }
  }

  getPublicKey(): string {
    return this.publicKey
  }
}

export default new FlutterwaveService()
