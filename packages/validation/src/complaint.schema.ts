import { z } from 'zod';

export const ComplaintCategoryEnum = z.enum(
  [
    'PIPE_BURST_LEAK',
    'TURBID_DIRTY_WATER',
    'LOW_WATER_PRESSURE',
    'METER_DEFECT',
    'OTHER',
  ],
  {
    errorMap: () => ({ message: 'Danh mục sự cố không hợp lệ' }),
  }
);

export const CreateComplaintSchema = z.object({
  category: ComplaintCategoryEnum,
  description: z
    .string()
    .min(5, 'Mô tả chi tiết sự cố phải có ít nhất 5 ký tự')
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),
  latitude: z
    .number()
    .min(8.0, 'Tọa độ vĩ độ nằm ngoài phạm vi tỉnh Cà Mau')
    .max(10.0, 'Tọa độ vĩ độ nằm ngoài phạm vi tỉnh Cà Mau')
    .optional()
    .default(9.1768),
  longitude: z
    .number()
    .min(104.0, 'Tọa độ kinh độ nằm ngoài phạm vi tỉnh Cà Mau')
    .max(106.0, 'Tọa độ kinh độ nằm ngoài phạm vi tỉnh Cà Mau')
    .optional()
    .default(105.1502),
  address: z.string().max(255, 'Địa chỉ không được vượt quá 255 ký tự').optional(),
  addressText: z.string().max(255, 'Địa chỉ không được vượt quá 255 ký tự').optional(),
  images: z
    .array(z.string())
    .max(3, 'Đính kèm tối đa 3 hình ảnh hiện trường')
    .optional()
    .default([]),
  imageUrls: z
    .array(z.string())
    .max(3, 'Đính kèm tối đa 3 hình ảnh hiện trường')
    .optional()
    .default([]),
  photos: z
    .array(z.string())
    .max(3, 'Đính kèm tối đa 3 hình ảnh hiện trường')
    .optional()
    .default([]),
});

export const UpdateComplaintStatusSchema = z.object({
  status: z.enum(['SUBMITTED', 'RECEIVED', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'], {
    errorMap: () => ({ message: 'Trạng thái xử lý sự cố không hợp lệ' }),
  }),
  adminNote: z.string().max(500, 'Ghi chú xử lý không được vượt quá 500 ký tự').optional(),
  assignedWorkerName: z.string().optional(),
  assignedWorkerPhone: z.string().optional(),
  dispatchNote: z.string().optional(),
  resolutionNote: z.string().optional(),
});

export type CreateComplaintInput = z.infer<typeof CreateComplaintSchema>;
export type UpdateComplaintStatusInput = z.infer<typeof UpdateComplaintStatusSchema>;
