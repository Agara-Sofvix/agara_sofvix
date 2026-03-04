import nodemailer from 'nodemailer'; // Email changed to agara92in@gmail.com

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a password reset email to the user.
 * @param email - The recipient email address.
 * @param resetCode - The 6-digit reset code.
 * @param name - The user's name for personalization.
 */
export const sendResetEmail = async (email: string, resetCode: string, name: string) => {
    const mailOptions = {
        from: `"Ezhuthidu" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Code - Ezhuthidu',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0f172a; text-align: center;">Password Reset Request</h2>
                <p>Hello ${name},</p>
                <p>We received a request to reset your password. Use the following 6-digit code to proceed with the reset. This code is valid for 10 minutes.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="display: inline-block; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #135bec; background-color: #f1f5f9; border-radius: 8px;">
                        ${resetCode}
                    </span>
                </div>
                <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="font-size: 12px; color: #64748b; text-align: center;">
                    &copy; ${new Date().getFullYear()} Ezhuthidu. All rights reserved.
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Password reset email sent to ${email}`);
    } catch (error: any) {
        console.error('[EMAIL ERROR] Detailed SMTP Error:', error);
        throw new Error(`Failed to send email: ${error.message || 'Check SMTP configuration'}`);
    }
};
