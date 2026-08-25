import { InvoiceLineItemDto } from '@aquaflow/types';

export interface TariffCalculationResult {
  consumptionM3: number;
  baseAmount: number;
  vatRate: number;
  vatAmount: number;
  environmentalFeeRate: number;
  environmentalFeeAmount: number;
  totalAmount: number;
  breakdown: InvoiceLineItemDto[];
}

export type TariffCategory = 
  | 'DOMESTIC_TP' 
  | 'DOMESTIC_DISTRICT' 
  | 'POOR' 
  | 'ADMINISTRATIVE' 
  | 'PRODUCTION' 
  | 'COMMERCIAL';

export class TariffCalculator {
  private static readonly VAT_RATE = 0.05; // 5% VAT
  private static readonly ENV_FEE_RATE = 0.10; // 10% Phí bảo vệ môi trường

  /**
   * Tính toán tiền nước lũy tiến theo Quyết định số 13/2023/QĐ-UBND tỉnh Cà Mau
   */
  public static calculate(consumptionM3: number, category: TariffCategory = 'DOMESTIC_TP'): TariffCalculationResult {
    const volume = Math.max(0, Math.floor(consumptionM3));
    const breakdown: InvoiceLineItemDto[] = [];
    let baseAmount = 0;

    if (category === 'DOMESTIC_TP') {
      // Hộ dân cư TP. Cà Mau: 4 bậc thang (6.600, 8.100, 9.600, 11.500)
      const tiers = [
        { tierNumber: 1, from: 1, to: 10, limit: 10, price: 6600 },
        { tierNumber: 2, from: 11, to: 20, limit: 10, price: 8100 },
        { tierNumber: 3, from: 21, to: 30, limit: 10, price: 9600 },
        { tierNumber: 4, from: 31, to: 999999, limit: Infinity, price: 11500 },
      ];

      let remaining = volume;
      for (const tier of tiers) {
        if (remaining <= 0) break;
        const volumeInTier = Math.min(remaining, tier.limit);
        const amount = volumeInTier * tier.price;
        breakdown.push({
          tierNumber: tier.tierNumber,
          fromM3: tier.from,
          toM3: tier.limit === Infinity ? volume : tier.to,
          volumeM3: volumeInTier,
          unitPrice: tier.price,
          amount: amount,
        });
        baseAmount += amount;
        remaining -= volumeInTier;
      }
    } else if (category === 'DOMESTIC_DISTRICT') {
      // Hộ dân cư các huyện
      const tiers = [
        { tierNumber: 1, from: 1, to: 10, limit: 10, price: 6500 },
        { tierNumber: 2, from: 11, to: 20, limit: 10, price: 8000 },
        { tierNumber: 3, from: 21, to: 30, limit: 10, price: 9500 },
        { tierNumber: 4, from: 31, to: 999999, limit: Infinity, price: 11300 },
      ];

      let remaining = volume;
      for (const tier of tiers) {
        if (remaining <= 0) break;
        const volumeInTier = Math.min(remaining, tier.limit);
        const amount = volumeInTier * tier.price;
        breakdown.push({
          tierNumber: tier.tierNumber,
          fromM3: tier.from,
          toM3: tier.limit === Infinity ? volume : tier.to,
          volumeM3: volumeInTier,
          unitPrice: tier.price,
          amount: amount,
        });
        baseAmount += amount;
        remaining -= volumeInTier;
      }
    } else {
      // Các nhóm giá cố định theo m³
      let unitPrice = 9800;
      if (category === 'POOR') unitPrice = 5400;
      else if (category === 'ADMINISTRATIVE') unitPrice = 9800;
      else if (category === 'PRODUCTION') unitPrice = 12300;
      else if (category === 'COMMERCIAL') unitPrice = 14800;

      baseAmount = volume * unitPrice;
      breakdown.push({
        tierNumber: 1,
        fromM3: 1,
        toM3: volume,
        volumeM3: volume,
        unitPrice: unitPrice,
        amount: baseAmount,
      });
    }

    const vatAmount = Math.round(baseAmount * this.VAT_RATE);
    const environmentalFeeAmount = Math.round(baseAmount * this.ENV_FEE_RATE);
    const totalAmount = baseAmount + vatAmount + environmentalFeeAmount;

    return {
      consumptionM3: volume,
      baseAmount,
      vatRate: this.VAT_RATE,
      vatAmount,
      environmentalFeeRate: this.ENV_FEE_RATE,
      environmentalFeeAmount,
      totalAmount,
      breakdown,
    };
  }
}
