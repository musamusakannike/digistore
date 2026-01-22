import axios from "axios"

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
    status: string // "successful" | "failed" | "pending"
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
  private webhookSecret: string

  constructor() {
    this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY || ""
    this.publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY || ""
    this.webhookSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET || ""
  }

  private ensureConfigured() {
    if (!this.secretKey || !this.publicKey) {
      throw new Error("Flutterwave API keys not configured")
    }
  }

  async initializePayment(data: InitializePaymentData): Promise<any> {
    this.ensureConfigured()
    try {
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
        }
      )

      return response.data
    } catch (error: any) {
      this.handleError(error, "initialize payment")
    }
  }

  async verifyPayment(transactionId: string): Promise<VerifyPaymentResponse> {
    this.ensureConfigured()
    try {
      const response = await axios.get(
        `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/verify`,
        {
          headers: { Authorization: `Bearer ${this.secretKey}` },
        }
      )
      return response.data
    } catch (error: any) {
      this.handleError(error, "verify payment")
      throw error // Ensure flow breaks if verification fails
    }
  }

  /**
   * CORRECTED: Flutterwave V3 does not have a verify_by_reference endpoint.
   * We must query transactions by tx_ref to find the ID or status.
   */
  async verifyPaymentByReference(reference: string): Promise<VerifyPaymentResponse> {
    this.ensureConfigured()
    try {
      // 1. Search for the transaction by reference
      const searchResponse = await axios.get(`${FLUTTERWAVE_BASE_URL}/transactions`, {
        params: { tx_ref: reference },
        headers: { Authorization: `Bearer ${this.secretKey}` },
      })

      const transactions = searchResponse.data.data
      
      if (!transactions || transactions.length === 0) {
        throw new Error("Transaction reference not found")
      }

      // 2. Get the specific transaction ID
      const transactionId = transactions[0].id

      // 3. Perform the standard verification using the ID
      // (This is safer than trusting the search result status directly)
      return this.verifyPayment(transactionId.toString())

    } catch (error: any) {
      this.handleError(error, "verify payment by reference")
      throw error
    }
  }

  /**
   * CORRECTED: Flutterwave webhooks use a static Secret Hash, not HMAC signature.
   * Compare the `verif-hash` header from the request with your ENV secret.
   */
  verifyWebhookSignature(signatureFromHeader: string): boolean {
    if (!this.webhookSecret) {
      console.warn("FLUTTERWAVE_WEBHOOK_SECRET is not set")
      return false
    }
    return signatureFromHeader === this.webhookSecret
  }

  async getTransaction(transactionId: string): Promise<any> {
    this.ensureConfigured()
    try {
      const response = await axios.get(`${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}`, {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      })
      return response.data
    } catch (error: any) {
      this.handleError(error, "get transaction")
    }
  }

  async refundPayment(transactionId: string, amount?: number): Promise<any> {
    this.ensureConfigured()
    try {
      const response = await axios.post(
        `${FLUTTERWAVE_BASE_URL}/transactions/${transactionId}/refund`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      )
      return response.data
    } catch (error: any) {
      this.handleError(error, "refund payment")
    }
  }

  getPublicKey(): string {
    return this.publicKey
  }

  // Helper to standardize error logging
  private handleError(error: any, context: string) {
    const errorMessage = error.response?.data?.message || error.message
    console.error(`Flutterwave ${context} error:`, error.response?.data || error.message)
    throw new Error(errorMessage || `Failed to ${context}`)
  }
}

export default new FlutterwaveService()