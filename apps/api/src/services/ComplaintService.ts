import { ComplaintCategory, ComplaintStatus } from '@aquaflow/types';

export interface CreateComplaintInput {
  userId: string;
  category: ComplaintCategory;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  imageUrls?: string[];
}

export interface ComplaintRecord {
  id: string;
  userId: string;
  category: ComplaintCategory;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrls: string[];
  status: ComplaintStatus;
  createdAt: string;
}

export class ComplaintService {
  private complaints: ComplaintRecord[] = [
    {
      id: 'cp-01',
      userId: 'usr-zalo-8891',
      category: 'PIPE_BURST_LEAK',
      description: 'Bể ống nước trước số nhà 204 Quang Trung, nước tràn mạnh ra lòng đường.',
      latitude: 9.1768,
      longitude: 105.1502,
      address: '204 Quang Trung, P. Tân Thành, TP. Cà Mau',
      imageUrls: ['https://cawaco.camau.gov.vn/assets/complaints/leak-01.jpg'],
      status: 'IN_PROGRESS',
      createdAt: '2026-08-26T08:30:00.000Z',
    },
  ];

  async createComplaint(input: CreateComplaintInput): Promise<ComplaintRecord> {
    const newRecord: ComplaintRecord = {
      id: `cp-${Date.now()}`,
      userId: input.userId,
      category: input.category,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      address: input.address || 'TP. Cà Mau',
      imageUrls: input.imageUrls || [],
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    this.complaints.push(newRecord);
    return newRecord;
  }

  async getCitizenComplaints(userId: string): Promise<ComplaintRecord[]> {
    return this.complaints.filter((c) => c.userId === userId);
  }

  async getAllComplaints(): Promise<ComplaintRecord[]> {
    return this.complaints;
  }

  async updateStatus(complaintId: string, status: ComplaintStatus): Promise<ComplaintRecord | null> {
    const record = this.complaints.find((c) => c.id === complaintId);
    if (record) {
      record.status = status;
      return record;
    }
    return null;
  }
}
