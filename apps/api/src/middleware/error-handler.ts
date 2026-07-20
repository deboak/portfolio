import type { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import multer from 'multer';
import { AppError } from '../lib/errors.js';
import { Sentry } from '../lib/monitoring.js';

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const status=error.code==='LIMIT_FILE_SIZE'?413:400;
    res.status(status).json({error:{code:error.code,message:error.message,requestId:req.id}});return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: error.flatten(), requestId: req.id } }); return;
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: { code: error.code, message: error.message, requestId: req.id } }); return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'A record with that unique value already exists', requestId: req.id } }); return;
  }
  Sentry.captureException(error,{tags:{requestId:String(req.id)},...(req.user?{user:{id:req.user.id,email:req.user.email}}:{})});
  req.log.error({ err: error }, 'Unhandled request error');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', requestId: req.id } });
};
