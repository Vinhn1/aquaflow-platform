import { z } from 'zod';

export const ZaloAuthRequestSchema = z.object({
  accessToken: z.string().min(1, 'Mã truy cập Zalo (access token) là bắt buộc'),
});

export const PhoneOtpRequestSchema = z.object({
  phone: z
    .string()
    .regex(/^(03|05|07|08|09)\d{8}$/, 'Số điện thoại không đúng định dạng (Ví dụ: 0912345678)'),
});

export const PhoneOtpVerifySchema = z.object({
  phone: z
    .string()
    .regex(/^(03|05|07|08|09)\d{8}$/, 'Số điện thoại không đúng định dạng'),
  otpCode: z
    .string()
    .length(6, 'Mã xác thực OTP phải gồm đúng 6 chữ số')
    .regex(/^\d+$/, 'Mã OTP chỉ được chứa các ký tự số'),
});

export type ZaloAuthRequest = z.infer<typeof ZaloAuthRequestSchema>;
export type PhoneOtpRequest = z.infer<typeof PhoneOtpRequestSchema>;
export type PhoneOtpVerify = z.infer<typeof PhoneOtpVerifySchema>;
