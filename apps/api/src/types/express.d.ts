declare global {
  namespace Express { interface Request { id: string; rawBody?: Buffer; user?: { id: string; email: string } } }
}
export {};
