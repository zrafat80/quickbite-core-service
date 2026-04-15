// src/types/express.d.ts

declare namespace Express {
  interface Request {
    // You can leave correlationId here if you still want to attach it to the req,
    // but if you are using AsyncLocalStorage, you only strictly need the user object!

    user?: {
      userId: number;
      role: string;
      email: string;
    };
    restaurantId?: number;
    restaurantRole?: string;
    branchIds?: number[];
  }
}
AnimationEvent;
