import nodemailer from "nodemailer";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Nodemailer transporter (fallback)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOrderConfirmationEmail = async (
  email: string,
  orderId: string,
  amount: number
): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Order Confirmed!</h2>
          <p>Thank you for your purchase. Your payment has been successfully processed.</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>
          <p>You can now download your digital products from your orders page.</p>
          <a href="${
            process.env.FRONTEND_URL
          }/orders/${orderId}" class="button">View Order</a>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} DigiStore. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "noreply@digistore.com",
        to: email,
        subject: "Order Confirmation - DigiStore",
        html: htmlContent,
      });
    } else {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || "noreply@digistore.com",
        to: email,
        subject: "Order Confirmation - DigiStore",
        html: htmlContent,
      });
    }
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
};

export const sendSellerSaleNotificationEmail = async (
  email: string,
  productTitle: string,
  earnings: number
): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>New Sale!</h2>
          <p>Congratulations! You've made a new sale.</p>
          <p><strong>Product:</strong> ${productTitle}</p>
          <p><strong>Your Earnings:</strong> ₦${earnings.toLocaleString()}</p>
          <a href="${
            process.env.FRONTEND_URL
          }/seller/dashboard" class="button">View Dashboard</a>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} DigiStore. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "noreply@digistore.com",
        to: email,
        subject: "New Sale - DigiStore",
        html: htmlContent,
      });
    } else {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || "noreply@digistore.com",
        to: email,
        subject: "New Sale - DigiStore",
        html: htmlContent,
      });
    }
  } catch (error) {
    console.error("Error sending seller sale notification email:", error);
  }
};

export const sendVerificationEmail = async (
  email: string,
  token: string,
  name: string
): Promise<void> => {
  const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${token}`;
  const htmlContent = `
    <p>Hi ${name},</p>
    <p>Thanks for registering. Please verify your email by clicking the link below:</p>
    <p><a href="${verifyUrl}">Verify Email</a></p>
    <p>If you didn't create an account, ignore this email.</p>
  `;

  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "noreply@digistore.com",
        to: email,
        subject: "Verify your email - DigiStore",
        html: htmlContent,
      });
    } else {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || "noreply@digistore.com",
        to: email,
        subject: "Verify your email - DigiStore",
        html: htmlContent,
      });
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  name: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const htmlContent = `
    <p>Hi ${name},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "noreply@digistore.com",
        to: email,
        subject: "Reset your password - DigiStore",
        html: htmlContent,
      });
    } else {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || "noreply@digistore.com",
        to: email,
        subject: "Reset your password - DigiStore",
        html: htmlContent,
      });
    }
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> => {
  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "noreply@digistore.com",
        to,
        subject,
        text,
        html,
      });
    } else {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || "noreply@digistore.com",
        to,
        subject,
        text,
        html,
      });
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
