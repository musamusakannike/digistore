import type { Server, Socket } from "socket.io"
import jwt from "jsonwebtoken"

interface SocketUser {
  userId: string
  role: string
}

const userSockets = new Map<string, string>()

export const initializeSocket = (io: Server): void => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error("Authentication error"))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as SocketUser
      socket.data.user = decoded
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.user.userId
    userSockets.set(userId, socket.id)

    console.log(`✅ User connected: ${userId}`)

    socket.on("disconnect", () => {
      userSockets.delete(userId)
      console.log(`❌ User disconnected: ${userId}`)
    })
  })
}

export const getSocketId = (userId: string): string | undefined => {
  return userSockets.get(userId)
}

export { userSockets }
