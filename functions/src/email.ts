import * as nodemailer from 'nodemailer';
import * as functions from 'firebase-functions';

// Configure your email service here
// This example uses Gmail, but you can use any SMTP service
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: functions.config().email.user, // Set via: firebase functions:config:set email.user="your-email@gmail.com"
    pass: functions.config().email.pass, // Set via: firebase functions:config:set email.pass="your-app-password"
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"+Fut App" <${functions.config().email.user}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    
    console.log(`Email sent successfully to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}