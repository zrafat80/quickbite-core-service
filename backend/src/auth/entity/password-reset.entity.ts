export class PasswordReset {
    id!: number;
    userId!: number;
    otpHash!: string;
    expiresAt!: Date;
    consumedAt!: Date; 
    createdAt!: Date;

    constructor(data: Partial<PasswordReset>) {
        Object.assign(this, data);
    }

    isExpired(): boolean {
        return this.expiresAt < new Date();
    }
}