import { z } from 'zod';

/**
 * Kiểm tra tính hợp lệ của Số Căn Cước Công Dân / CMND Việt Nam
 */
export function validateCCCD(cccd: string): { valid: boolean; message?: string } {
  const clean = (cccd || '').trim();
  if (!clean) {
    return { valid: false, message: 'Vui lòng nhập số CCCD/CMND.' };
  }

  if (!/^\d+$/.test(clean)) {
    return { valid: false, message: 'Số CCCD chỉ được chứa các chữ số (0-9).' };
  }

  if (clean.length !== 9 && clean.length !== 12) {
    return { valid: false, message: 'Số CCCD phải có đúng 12 chữ số (hoặc CMND 9 chữ số).' };
  }

  // Chặn toàn bộ số giống nhau (vd: 111111111111, 000000000000, 999999999999)
  if (/^(\d)\1+$/.test(clean)) {
    return { valid: false, message: 'Số CCCD không hợp lệ (không được là chuỗi số trùng lặp).' };
  }

  // Chặn dãy số tiến/lùi thử nghiệm (vd: 123456789000, 123456789012, 012345678901)
  if (
    clean.startsWith('123456789') ||
    clean.startsWith('012345678') ||
    clean.startsWith('987654321') ||
    clean === '123456789000'
  ) {
    return { valid: false, message: 'Vui lòng nhập số CCCD thực tế, không nhập dãy số thử nghiệm.' };
  }

  // Đối với CCCD 12 số: 3 số đầu là mã tỉnh từ 001 đến 096 (Cà Mau là 096)
  if (clean.length === 12) {
    const provinceCode = parseInt(clean.substring(0, 3), 10);
    if (isNaN(provinceCode) || provinceCode < 1 || provinceCode > 96) {
      return { valid: false, message: '3 chữ số đầu của CCCD (mã tỉnh thành từ 001 đến 096) không hợp lệ.' };
    }
  }

  return { valid: true };
}

/**
 * Kiểm tra tính hợp lệ của Số điện thoại liên hệ
 */
export function validatePhone(phone: string): { valid: boolean; message?: string } {
  const clean = (phone || '').trim().replace(/[\s.-]/g, '');
  if (!clean) {
    return { valid: false, message: 'Vui lòng nhập số điện thoại liên hệ.' };
  }

  const phoneRegex = /^(0|84)(3|5|7|8|9)[0-9]{8}$/;
  if (!phoneRegex.test(clean)) {
    return { valid: false, message: 'Số điện thoại không hợp lệ (phải gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09).' };
  }

  if (/^(\d)\1+$/.test(clean)) {
    return { valid: false, message: 'Số điện thoại không hợp lệ (không được trùng lặp 1 chữ số).' };
  }

  return { valid: true };
}

/**
 * Kiểm tra tính hợp lệ của Địa chỉ lắp đặt cụ thể
 */
export function validateStreetAddress(address: string): { valid: boolean; message?: string } {
  const clean = (address || '').trim();
  if (!clean) {
    return { valid: false, message: 'Vui lòng nhập địa chỉ lắp đặt cụ thể.' };
  }

  if (clean.length < 6) {
    return { valid: false, message: 'Địa chỉ cụ thể quá ngắn. Vui lòng ghi rõ số nhà, tên đường hoặc ấp/khóm (tối thiểu 6 ký tự).' };
  }

  const lower = clean.toLowerCase();
  const invalidGeneric = [
    'cà mau', 'ca mau', 'tp cà mau', 'tp ca mau', 'tỉnh cà mau', 'tinh ca mau',
    'nhà tôi', 'nha toi', 'nhà riêng', 'nha rieng', 'ở đây', 'o day',
    'test', 'abc', '123', 'khong co', 'không có', 'dia chi', 'địa chỉ'
  ];

  if (invalidGeneric.includes(lower)) {
    return { valid: false, message: 'Vui lòng ghi rõ số nhà, tên đường hoặc ấp/khóm cụ thể (Ví dụ: Số 124 đường Lý Thường Kiệt, Khóm 6).' };
  }

  return { valid: true };
}

export const CreateRegistrationSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(100, 'Họ và tên không quá 100 ký tự'),
  phone: z.string().superRefine((val, ctx) => {
    const check = validatePhone(val);
    if (!check.valid) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: check.message });
    }
  }),
  idCardNumber: z.string().superRefine((val, ctx) => {
    const check = validateCCCD(val);
    if (!check.valid) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: check.message });
    }
  }),
  district: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
  ward: z.string().min(1, 'Vui lòng nhập Phường/Xã'),
  streetAddress: z.string().superRefine((val, ctx) => {
    const check = validateStreetAddress(val);
    if (!check.valid) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: check.message });
    }
  }),
  purpose: z.enum([
    'DOMESTIC_TP',
    'DOMESTIC_DISTRICT',
    'COMMERCIAL',
    'PRODUCTION',
    'ADMINISTRATIVE',
    'POOR',
  ]).optional().default('DOMESTIC_TP'),
  attachedDocs: z.array(z.string()).optional(),
  userId: z.string().optional(),
});

export type CreateRegistrationInput = z.infer<typeof CreateRegistrationSchema>;
