"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberInvitationEmail = void 0;
var memberInvitationEmail = function (otp, role) {
    return {
        subject: 'You have been invited to join the team',
        html: "\n      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;\">\n        <h2 style=\"color: #333; text-align: center;\">Welcome to the Team!</h2>\n        <p style=\"color: #555; font-size: 16px;\">You have been invited to join our system as a <strong>".concat(role, "</strong>.</p>\n        <p style=\"color: #555; font-size: 16px;\">Use the temporary code below to set up your account and choose your password:</p>\n        \n        <div style=\"background-color: #f9f9f9; padding: 20px; text-align: center; margin: 20px 0; border-radius: 4px;\">\n          <span style=\"font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;\">").concat(otp, "</span>\n        </div>\n        \n        <p style=\"color: #777; font-size: 14px; text-align: center;\">If you did not expect this invitation, please ignore this email.</p>\n      </div>\n    "),
    };
};
exports.memberInvitationEmail = memberInvitationEmail;
