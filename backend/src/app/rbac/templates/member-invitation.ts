export const memberInvitationEmail = (otp: string, role: string) => {
  return {
    subject: 'You have been invited to join the team',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Welcome to the Team!</h2>
        <p style="color: #555; font-size: 16px;">You have been invited to join our system as a <strong>${role}</strong>.</p>
        <p style="color: #555; font-size: 16px;">Use the temporary code below to set up your account and choose your password:</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; margin: 20px 0; border-radius: 4px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">${otp}</span>
        </div>
        
        <p style="color: #777; font-size: 14px; text-align: center;">If you did not expect this invitation, please ignore this email.</p>
      </div>
    `,
  };
};