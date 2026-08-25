import { z } from 'zod';

export const LinkCustomerMeterSchema = z.object({
  customerCode: z
    .string()
    .min(4, 'Mã khách hàng / mã danh bộ phải có ít nhất 4 ký tự')
    .max(20, 'Mã khách hàng / mã danh bộ không được vượt quá 20 ký tự')
    .regex(/^[A-Za-z0-9_-]+$/, 'Mã khách hàng chỉ được chứa chữ cái, số và dấu gạch nối'),
  label: z
    .string()
    .max(50, 'Tên nhãn gợi nhớ không được vượt quá 50 ký tự')
    .default('Nhà riêng'),
  verificationCode: z.string().optional(),
});

export const UpdateCustomerMeterLabelSchema = z.object({
  label: z.string().min(1, 'Tên nhãn không được để trống').max(50, 'Tên nhãn không được vượt quá 50 ký tự'),
  isDefault: z.boolean().optional(),
});

export type LinkCustomerMeterInput = z.infer<typeof LinkCustomerMeterSchema>;
export type UpdateCustomerMeterLabelInput = z.infer<typeof UpdateCustomerMeterLabelSchema>;
