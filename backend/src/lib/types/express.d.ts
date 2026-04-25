declare namespace Express {
  interface Request {
    // Everything from the JWT payload lives INSIDE req.user
    user?: {
      userId: number;
      role: string;
      email: string;
      // Spread from restaurantMemberInfo
      restaurantId?: number;
      restaurantRole?: string;
      branchIds?: number[];
    };
  }
}declare namespace Express {
  interface Request {
    // Everything from the JWT payload lives INSIDE req.user
    user?: {
      userId: number;
      role: string;
      email: string;
      // Spread from restaurantMemberInfo
      restaurantId?: number;
      restaurantRole?: string;
      branchIds?: number[];
    };
  }
}