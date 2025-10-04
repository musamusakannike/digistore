// Augment Express' Request with a `user` property.
// Use a top-level 'declare namespace Express' so the declaration merges with @types/express.
// Ensure this file is treated as a module
import type { IUser } from "../models/user.model"

declare global {
  namespace Express {
    interface Request {
      user?: IUser
      files?: any
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser
    files?: any
  }
}

export {}

