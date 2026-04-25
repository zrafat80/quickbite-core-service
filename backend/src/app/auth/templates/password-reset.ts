export const passwordResetEmail = (otp: string) => {
  return {
    subject: 'Your Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p style="color: #555; font-size: 16px;">We received a request to reset your password. Please use the verification code below to complete the process:</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; margin: 20px 0; border-radius: 4px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">${otp}</span>
        </div>
        
        <p style="color: #777; font-size: 14px; text-align: center;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  };
};