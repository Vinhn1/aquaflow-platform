import { z } from 'zod';

export const NewsCategoryEnum = z.enum(
  [
    'ANNOUNCEMENT',
    'MAINTENANCE_OUTAGE',
    'WATER_SAFETY',
    'TARIFF_POLICY',
    'OUTAGE_NOTICE',
    'POLICY_UPDATE',
    'COMMUNITY',
  ],
  {
    errorMap: () => ({ message: 'Danh mục tin tức không hợp lệ' }),
  }
);

export const GetNewsQuerySchema = z.object({
  category: NewsCategoryEnum.optional(),
  isOutageAlert: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  page: z.coerce.number().int().positive('Số trang phải lớn hơn 0').default(1),
  pageSize: z.coerce.number().int().positive().max(50, 'Số lượng tin tối đa mỗi trang là 50').default(10),
});

export const CreateNewsSchema = z.object({
  title: z.string().min(5, 'Tiêu đề tin tức phải có ít nhất 5 ký tự').max(255, 'Tiêu đề không được vượt quá 255 ký tự'),
  slug: z
    .string()
    .min(3)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang')
    .optional(),
  summary: z.string().min(10, 'Tóm tắt tin tức phải có ít nhất 10 ký tự').max(500, 'Tóm tắt không được vượt quá 500 ký tự'),
  content: z.string().min(20, 'Nội dung chi tiết phải có ít nhất 20 ký tự'),
  category: NewsCategoryEnum.default('ANNOUNCEMENT'),
  isOutageAlert: z.boolean().default(false),
  affectedArea: z.string().max(500).optional(),
  affectedAreas: z.string().max(500).optional(),
  thumbnailUrl: z.string().optional(),
  outageStartTime: z.string().datetime({ message: 'Thời gian bắt đầu cúp nước không hợp lệ' }).optional(),
  outageEndTime: z.string().datetime({ message: 'Thời gian dự kiến cấp nước lại không hợp lệ' }).optional(),
  isPublished: z.boolean().default(true),
});

export type GetNewsQuery = z.infer<typeof GetNewsQuerySchema>;
export type CreateNewsInput = z.infer<typeof CreateNewsSchema>;
