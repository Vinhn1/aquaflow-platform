export interface CustomerDto {
  id: string;
  customerCode: string;
  fullName: string;
  address: string;
  phone?: string;
  meterSerialNumber: string;
  tariffGroup: 'DOMESTIC_TP' | 'DOMESTIC_DISTRICT' | 'POOR' | 'ADMINISTRATIVE' | 'PRODUCTION' | 'COMMERCIAL';
  branchId: string;
  isActive: boolean;
}

export interface VerifyMeterBindingParams {
  customerCode: string;
  meterSerialNumber?: string;
  verificationCode?: string;
}

export interface ICustomerPort {
  findByCustomerCode(customerCode: string): Promise<CustomerDto | null>;
  verifyMeterOwnership(params: VerifyMeterBindingParams): Promise<boolean>;
}
