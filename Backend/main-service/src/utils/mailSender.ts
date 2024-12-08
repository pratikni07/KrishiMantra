import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const mailSender = async (email: string, title: string, body: string): Promise<nodemailer.SentMessageInfo | Error> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || '',
      port: 587,
      auth: {
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASS || '',
      },
      secure: false, // Use TLS
    });

    const info = await transporter.sendMail({
      from: `"Study Notion" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log('Email sent successfully:', info);
    return info;
  } catch (error: any) {
    console.error('Error sending email:', error.message);
    return error;
  }
};

export default mailSender;