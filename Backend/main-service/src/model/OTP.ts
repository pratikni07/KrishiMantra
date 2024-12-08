import mongoose, { Schema } from 'mongoose';
import { IOTP } from '../types/otpTypes';
import mailSender from '../utils/mailSender';
import { otpTemplate } from '../mail/templates/emailVerificationTemplate';

const OTPSchema: Schema<IOTP> = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes
  }
});

// Send verification email function
async function sendVerificationEmail(email: string, otp: string): Promise<void> {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      otpTemplate(otp)
    );
    console.log("Email sent successfully: ", mailResponse);
  } catch (error) {
    console.error("Error occurred while sending email: ", error);
    throw error;
  }
}

// Pre-save hook
OTPSchema.pre('save', async function(next) {
  // Only send email for new documents
  if (this.isNew) {
    try {
      await sendVerificationEmail(this.email, this.otp);
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

const OTP = mongoose.model<IOTP>('OTP', OTPSchema);
export default OTP;