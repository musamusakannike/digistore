import fs from "fs"
import path from "path"

const logsDir = path.join(process.cwd(), "logs")

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

export const logError = (error: Error, context?: string) => {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${context ? `[${context}] ` : ""}${error.message}\n${error.stack}\n\n`

  const logFile = path.join(logsDir, `error-${new Date().toISOString().split("T")[0]}.log`)

  fs.appendFileSync(logFile, logMessage)
  console.error(logMessage)
}

export const logInfo = (message: string, data?: any) => {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ""}\n`

  const logFile = path.join(logsDir, `info-${new Date().toISOString().split("T")[0]}.log`)

  fs.appendFileSync(logFile, logMessage)
  console.log(logMessage)
}

export const logTransaction = (transactionData: any) => {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${JSON.stringify(transactionData)}\n`

  const logFile = path.join(logsDir, `transactions-${new Date().toISOString().split("T")[0]}.log`)

  fs.appendFileSync(logFile, logMessage)
}
