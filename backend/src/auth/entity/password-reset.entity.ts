// Define exactly what we need to instantiate this class
export interface PasswordResetData {
    id?: number;          // Optional: DB creates this
    userId: number;       // REQUIRED
    otpHash: string;      // REQUIRED
    expiresAt: Date;      // REQUIRED
    consumedAt?: Date;    // Optional: Only exists if they actually used it
    createdAt?: Date;     // Optional: DB creates this
}

export class PasswordReset {
    id!: number;
    userId: number;
    otpHash: string;
    expiresAt: Date;
    consumedAt?: Date; 
    createdAt!: Date;

    constructor(data: PasswordResetData) {
        this.id = data.id!;
        this.userId = data.userId;
        this.otpHash = data.otpHash;
        this.expiresAt = data.expiresAt;
        this.consumedAt = data.consumedAt;
        this.createdAt = data.createdAt || new Date();
    }

    isExpired(): boolean {
        return this.expiresAt < new Date();
    }
}