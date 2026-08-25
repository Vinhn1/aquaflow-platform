import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { TariffCalculator } from '../src/services/TariffCalculator.js';

describe('TariffCalculator - Động cơ tính giá nước QĐ 13/2023 Cà Mau', () => {
  test('Tính tiền nước tiêu thụ 0 m³', () => {
    const res = TariffCalculator.calculate(0, 'DOMESTIC_TP');
    assert.equal(res.consumptionM3, 0);
    assert.equal(res.baseAmount, 0);
    assert.equal(res.vatAmount, 0);
    assert.equal(res.environmentalFeeAmount, 0);
    assert.equal(res.totalAmount, 0);
    assert.equal(res.breakdown.length, 0);
  });

  test('Tính tiền nước tiêu thụ 10 m³ (Bậc 1)', () => {
    // 10 m3 * 6.600 = 66.000
    // VAT 5% = 3.300
    // Phi BVMT 10% = 6.600
    // Tong = 75.900
    const res = TariffCalculator.calculate(10, 'DOMESTIC_TP');
    assert.equal(res.consumptionM3, 10);
    assert.equal(res.baseAmount, 66000);
    assert.equal(res.vatAmount, 3300);
    assert.equal(res.environmentalFeeAmount, 6600);
    assert.equal(res.totalAmount, 75900);
    assert.equal(res.breakdown.length, 1);
    assert.equal(res.breakdown[0].volumeM3, 10);
    assert.equal(res.breakdown[0].unitPrice, 6600);
  });

  test('Tính tiền nước tiêu thụ 25 m³ (Bậc 1 + Bậc 2 + Bậc 3)', () => {
    // Bac 1: 10 * 6.600 = 66.000
    // Bac 2: 10 * 8.100 = 81.000
    // Bac 3: 5 * 9.600 = 48.000
    // Tien nuoc = 195.000
    // VAT 5% = 9.750
    // Phi BVMT 10% = 19.500
    // Tong = 224.250
    const res = TariffCalculator.calculate(25, 'DOMESTIC_TP');
    assert.equal(res.consumptionM3, 25);
    assert.equal(res.baseAmount, 195000);
    assert.equal(res.vatAmount, 9750);
    assert.equal(res.environmentalFeeAmount, 19500);
    assert.equal(res.totalAmount, 224250);
    assert.equal(res.breakdown.length, 3);
  });

  test('Tính tiền nước tiêu thụ 35 m³ (Qua Bậc 4 >30 m³)', () => {
    // Bac 1: 10 * 6.600 = 66.000
    // Bac 2: 10 * 8.100 = 81.000
    // Bac 3: 10 * 9.600 = 96.000
    // Bac 4: 5 * 11.500 = 57.500
    // Tien nuoc = 300.500
    // VAT 5% = 15.025
    // Phi BVMT 10% = 30.050
    // Tong = 345.575
    const res = TariffCalculator.calculate(35, 'DOMESTIC_TP');
    assert.equal(res.consumptionM3, 35);
    assert.equal(res.baseAmount, 300500);
    assert.equal(res.vatAmount, 15025);
    assert.equal(res.environmentalFeeAmount, 30050);
    assert.equal(res.totalAmount, 345575);
    assert.equal(res.breakdown.length, 4);
  });

  test('Tính tiền nước khu vực Huyện (DOMESTIC_DISTRICT) 20 m³', () => {
    // Bac 1: 10 * 6.500 = 65.000
    // Bac 2: 10 * 8.000 = 80.000
    // Tien nuoc = 145.000
    // VAT 5% = 7.250
    // Phi BVMT 10% = 14.500
    // Tong = 166.750
    const res = TariffCalculator.calculate(20, 'DOMESTIC_DISTRICT');
    assert.equal(res.consumptionM3, 20);
    assert.equal(res.baseAmount, 145000);
    assert.equal(res.vatAmount, 7250);
    assert.equal(res.environmentalFeeAmount, 14500);
    assert.equal(res.totalAmount, 166750);
  });
});
