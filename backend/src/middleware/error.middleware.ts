import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof ZodError) {
    return sendError(res, 'Validation failed', 422, err.errors);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return sendError(res, 'A record with this value already exists', 409);
    if (err.code === 'P2025') return sendError(res, 'Record not found', 404);
    if (err.code === 'P2003') return sendError(res, 'Referenced record does not exist', 400);
  }

  if (err.status) return sendError(res, err.message, err.status);

  return sendError(res, 'Internal server error', 500);
};
