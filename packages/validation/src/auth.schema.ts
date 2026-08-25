import { z } from 'zod';

export const ZaloAuthRequestSchema = z.object({
  accessToken: z.string().min(1, 'Zalo access token is required'),
});

export const PhoneOtpRequestSchema = z.object({
  phone: z
    .string()
    .regex(/^(03|05|07|08|09)\d{8}$/, 'Invalid Vietnamese phone number format (e.g. 0912345678)'),
});

export const PhoneOtpVerifySchema = z.object({
  phone: z
    .string()
    .regex(/^(03|05|07|08|09)\d{8}$/, 'Invalid Vietnamese phone number format'),
  otpCode: z
    .string()
    .length(6, 'OTP code must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP code must contain only numbers'),
});

export type ZaloAuthRequest = z.infer<typeof ZaloAuthRequestSchema>;
export type PhoneOtpRequest = z.infer<typeof PhoneOtpRequestSchema>;
export type PhoneOtpVerify = z.infer<typeof PhoneOtpVerifySchema>;
