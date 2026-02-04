import express, { type Application } from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import cookieParser from "cookie-parser"
import fileUpload from "express-fileupload"
import { createServer } from "http"
import { Server } from "socket.io"
import connectDB from "./config/database.config"
import { errorHandler } from "./middlewares/error.middleware"
import { notFound } from "./middlewares/notfound.middleware"
import { initializeSocket } from "./config/socket.config"

// Load environment variables
dotenv.config()

// Initialize express app
const app: Application = express()
const httpServer = createServer(app)

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
})

// Connect to database
connectDB()

// Initialize socket handlers
initializeSocket(io)

// Make io accessible to routes
app.set("io", io)

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
)
app.use(morgan("dev"))
app.use(compression())
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }))

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DigiStore API is running",
    timestamp: new Date().toISOString(),
  })
})

// API Routes
import authRoutes from "./routes/auth.route"
import userRoutes from "./routes/user.route"
import productRoutes from "./routes/product.route"
import categoryRoutes from "./routes/category.route"
import orderRoutes from "./routes/order.route"
import cartRoutes from "./routes/cart.route"
import reviewRoutes from "./routes/review.route"
import paymentRoutes from "./routes/payment.route"
import adminRoutes from "./routes/admin.route"
import notificationRoutes from "./routes/notification.route"
import analyticsRoutes from "./routes/analytics.route"
import uploadRoutes from "./routes/upload.route"

const API_VERSION = process.env.API_VERSION || "v1"

app.use(`/api/${API_VERSION}/auth`, authRoutes)
app.use(`/api/${API_VERSION}/users`, userRoutes)
app.use(`/api/${API_VERSION}/products`, productRoutes)
app.use(`/api/${API_VERSION}/categories`, categoryRoutes)
app.use(`/api/${API_VERSION}/orders`, orderRoutes)
app.use(`/api/${API_VERSION}/cart`, cartRoutes)
app.use(`/api/${API_VERSION}/reviews`, reviewRoutes)
app.use(`/api/${API_VERSION}/payments`, paymentRoutes)
app.use(`/api/${API_VERSION}/admin`, adminRoutes)
app.use(`/api/${API_VERSION}/notifications`, notificationRoutes)
app.use(`/api/${API_VERSION}/analytics`, analyticsRoutes)
app.use(`/api/${API_VERSION}/upload`, uploadRoutes)

// Error handling
app.use(notFound)
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  console.log(`📡 Socket.IO server is ready`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.log(`❌ Error: ${err.message}`)
  httpServer.close(() => process.exit(1))
})

export { io }
