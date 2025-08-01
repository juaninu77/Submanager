import { Request, Response, NextFunction } from 'express'
import { logRequest } from '@/utils/logger'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  
  // Override res.end to capture response time
  const originalEnd = res.end
  res.end = function(chunk?: any, encoding?: any) {
    res.end = originalEnd
    
    const responseTime = Date.now() - startTime
    logRequest(req, res, responseTime)
    
    return originalEnd.call(this, chunk, encoding)
  }
  
  next()
}