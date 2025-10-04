import type { Request, Response, NextFunction } from "express"

export type AsyncFunction<TReq extends Request = Request> = (
  req: TReq,
  res: Response,
  next: NextFunction,
) => Promise<any>

export const asyncHandler = <TReq extends Request = Request>(fn: AsyncFunction<TReq>) => {
  return (req: TReq, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
