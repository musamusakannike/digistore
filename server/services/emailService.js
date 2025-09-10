const nodemailer = require("nodemailer")
const Notification = require("../models/Notification")
const User = require("../models/User")

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: Number.parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// Email templates
const emailTemplates = {
  file_purchased: {
    subject: "Purchase Confirmation - {{fileName}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Purchase Successful!</h2>
        <p>Hello {{userName}},</p>
        <p>You have successfully purchased "<strong>{{fileName}}</strong>" for ₦{{amount}}.</p>
        <p>You can now download your file from your dashboard.</p>
        <a href="{{dashboardUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">View Purchase</a>
        <p>Thank you for using Digistore!</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Digistore Team</p>
      </div>
    `,
  },
  payment_received: {
    subject: "New Sale - {{fileName}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Sale!</h2>
        <p>Hello {{sellerName}},</p>
        <p>Great news! Your file "<strong>{{fileName}}</strong>" has been purchased.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Earnings:</strong> ₦{{earnings}}</p>
          <p><strong>Buyer:</strong> {{buyerName}}</p>
          <p><strong>Date:</strong> {{purchaseDate}}</p>
        </div>
        <a href="{{dashboardUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">View Earnings</a>
        <p>Keep up the great work!</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Digistore Team</p>
      </div>
    `,
  },
  file_approved: {
    subject: "File Approved - {{fileName}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">File Approved!</h2>
        <p>Hello {{userName}},</p>
        <p>Your file "<strong>{{fileName}}</strong>" has been approved and is now live on the platform.</p>
        <p>Students can now discover and purchase your file.</p>
        <a href="{{fileUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">View File</a>
        <p>Good luck with your sales!</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Digistore Team</p>
      </div>
    `,
  },
  file_rejected: {
    subject: "File Rejected - {{fileName}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">File Rejected</h2>
        <p>Hello {{userName}},</p>
        <p>Unfortunately, your file "<strong>{{fileName}}</strong>" has been rejected.</p>
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">
          <p><strong>Reason:</strong> {{rejectionReason}}</p>
        </div>
        <p>You can edit your file and resubmit it for review.</p>
        <a href="{{editUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Edit File</a>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Digistore Team</p>
      </div>
    `,
  },
  withdrawal_processed: {
    subject: "Withdrawal Update - ₦{{amount}}",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Withdrawal Update</h2>
        <p>Hello {{userName}},</p>
        <p>Your withdrawal request of <strong>₦{{amount}}</strong> has been {{status}}.</p>
        {{#if completedAt}}
        <p>The funds should reflect in your account within 24 hours.</p>
        {{/if}}
        {{#if reason}}
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">
          <p><strong>Note:</strong> {{reason}}</p>
        </div>
        {{/if}}
        <a href="{{dashboardUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">View Dashboard</a>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Digistore Team</p>
      </div>
    `,
  },
}

// Send email notification
const sendEmailNotification = async (userId, notification) => {
  try {
    const user = await User.findById(userId)
    if (!user || !user.notificationSettings.email) {
      return { success: false, reason: "User email notifications disabled" }
    }

    const template = emailTemplates[notification.type]
    if (!template) {
      return { success: false, reason: "Email template not found" }
    }

    const transporter = createTransporter()

    // Replace template variables
    let subject = template.subject
    let html = template.html

    const variables = {
      userName: user.fullName,
      userEmail: user.email,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      ...notification.data,
    }

    // Simple template replacement
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g")
      subject = subject.replace(regex, value || "")
      html = html.replace(regex, value || "")
    }

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || "Digistore"} <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)

    // Update notification delivery status
    await updateNotificationDeliveryStatus(notification._id, "email", true)

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Email notification error:", error)
    await updateNotificationDeliveryStatus(notification._id, "email", false, error.message)
    return { success: false, error: error.message }
  }
}

// Send bulk email notifications
const sendBulkEmailNotifications = async (userIds, notificationData) => {
  try {
    const users = await User.find({
      _id: { $in: userIds },
      "notificationSettings.email": true,
    })

    const results = []

    for (const user of users) {
      // Create notification record
      const notification = await Notification.create({
        recipient: user._id,
        ...notificationData,
      })

      // Send email
      const result = await sendEmailNotification(user._id, notification)
      results.push({ userId: user._id, ...result })
    }

    return { success: true, results }
  } catch (error) {
    console.error("Bulk email notification error:", error)
    return { success: false, error: error.message }
  }
}

// Update notification delivery status
const updateNotificationDeliveryStatus = async (notificationId, channel, success, error = null) => {
  try {
    const updateData = {
      [`channels.${channel}.sent`]: success,
      [`channels.${channel}.sentAt`]: new Date(),
    }

    if (error) {
      updateData[`channels.${channel}.error`] = error
    }

    await Notification.findByIdAndUpdate(notificationId, updateData)
  } catch (updateError) {
    console.error("Error updating notification status:", updateError)
  }
}

module.exports = {
  sendEmailNotification,
  sendBulkEmailNotifications,
  emailTemplates,
}
