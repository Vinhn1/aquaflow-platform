import { ComplaintCategory, ComplaintStatus } from '@aquaflow/types';

export interface CreateComplaintInput {
  userId: string;
  category: ComplaintCategory;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  citizenName?: string;
  phone?: string;
  imageUrls?: string[];
}

export interface UpdateComplaintInput {
  status: ComplaintStatus;
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;
  dispatchNote?: string;
  resolutionNote?: string;
}

export interface ComplaintRecord {
  id: string;
  userId: string;
  category: ComplaintCategory;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  citizenName?: string;
  phone?: string;
  imageUrls: string[];
  status: ComplaintStatus;
  createdAt: string;
  assignedWorkerName?: string;
  assignedWorkerPhone?: string;
  dispatchedAt?: string;
  dispatchNote?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export class ComplaintService {
  private complaints: ComplaintRecord[] = [
    {
      id: 'SC-2026-0891',
      userId: 'usr-zalo-8891',
      citizenName: 'Nguyễn Văn An',
      phone: '0918 234 567',
      category: 'PIPE_BURST_LEAK',
      description: 'Phát hiện nước sạch chảy tràn ra vỉa hè trước cửa nhà, áp lực nước trong nhà bị giảm rõ rệt.',
      latitude: 9.17682,
      longitude: 105.15001,
      address: 'Số 204, đường Quang Trung, Khóm 26, Phường Tân Thành, TP. Cà Mau',
      imageUrls: [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=500&auto=format&fit=crop&q=60',
      ],
      status: 'SUBMITTED',
      createdAt: '2026-08-29T08:30:00.000Z',
    },
    {
      id: 'SC-2026-0887',
      userId: 'usr-zalo-8892',
      citizenName: 'Lê Hoàng Nam',
      phone: '0945 112 334',
      category: 'TURBID_DIRTY_WATER',
      description: 'Nước xả ra có màu vàng nhạt và nhiều cặn lắng sau khi công ty cấp nước lại.',
      latitude: 9.1821,
      longitude: 105.1482,
      address: 'Khóm 4, Phường 5, TP. Cà Mau',
      imageUrls: [
        'https://images.unsplash.com/photo-1585675100414-add2e465a136?w=500&auto=format&fit=crop&q=60',
      ],
      status: 'IN_PROGRESS',
      createdAt: '2026-08-28T16:45:00.000Z',
      assignedWorkerName: 'Lê Văn Minh (Tổ kỹ thuật cơ động 1)',
      assignedWorkerPhone: '0919 456 789',
      dispatchedAt: '2026-08-28T17:00:00.000Z',
      dispatchNote: 'Đã xuất phát kiểm tra van súc xả tuyến ống nhánh D100.',
    },
    {
      id: 'SC-2026-0879',
      userId: 'usr-zalo-8893',
      citizenName: 'Trần Thị Huệ',
      phone: '0913 887 990',
      category: 'METER_DEFECT',
      description: 'Đồng hồ nước không quay dù vẫn đang mở van sử dụng sinh hoạt.',
      latitude: 9.1795,
      longitude: 105.1534,
      address: 'Đường Phan Ngọc Hiển, Phường 2, TP. Cà Mau',
      imageUrls: [],
      status: 'RESOLVED',
      createdAt: '2026-08-27T10:15:00.000Z',
      assignedWorkerName: 'Nguyễn Thành Đạt (Thợ bảo dưỡng đồng hồ)',
      assignedWorkerPhone: '0918 776 554',
      dispatchedAt: '2026-08-27T10:30:00.000Z',
      resolvedAt: '2026-08-27T11:45:00.000Z',
      resolutionNote: 'Đã thay mới cụm đồng hồ đo nước DN15, kẹp chì niêm phong đạt chuẩn.',
    },
  ];

  async createComplaint(input: CreateComplaintInput): Promise<ComplaintRecord> {
    const count = this.complaints.length + 1;
    const pad = String(count).padStart(4, '0');
    const newRecord: ComplaintRecord = {
      id: `SC-2026-${pad}`,
      userId: input.userId,
      citizenName: input.citizenName || 'Nguyễn Văn An',
      phone: input.phone || '0918 234 567',
      category: input.category,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      address: input.address || 'TP. Cà Mau',
      imageUrls: input.imageUrls || [],
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    this.complaints.unshift(newRecord);
    return newRecord;
  }

  async getCitizenComplaints(userId: string): Promise<ComplaintRecord[]> {
    return this.complaints.filter((c) => c.userId === userId);
  }

  async getAllComplaints(): Promise<ComplaintRecord[]> {
    return this.complaints;
  }

  async updateStatus(
    complaintId: string,
    status: ComplaintStatus,
    extra?: Partial<UpdateComplaintInput>
  ): Promise<ComplaintRecord | null> {
    const record = this.complaints.find((c) => c.id === complaintId);
    if (record) {
      record.status = status;
      if (extra?.assignedWorkerName) record.assignedWorkerName = extra.assignedWorkerName;
      if (extra?.assignedWorkerPhone) record.assignedWorkerPhone = extra.assignedWorkerPhone;
      if (extra?.dispatchNote) record.dispatchNote = extra.dispatchNote;
      if (extra?.resolutionNote) record.resolutionNote = extra.resolutionNote;

      if ((status as string) === 'DISPATCHED' || status === 'IN_PROGRESS') {
        record.dispatchedAt = new Date().toISOString();
      } else if (status === 'RESOLVED') {
        record.resolvedAt = new Date().toISOString();
      }
      return record;
    }
    return null;
  }
}
