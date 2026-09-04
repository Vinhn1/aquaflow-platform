/**
 * Cau hinh Zalo Platform (Zalo Developer App, Zalo Mini App va Zalo Official Account)
 * Dong bo theo thong tin xac thuc tu Zalo Developers Console
 */
export const ZALO_CONFIG = {
  // Zalo App ID (Ung dung CAWACO Testing)
  APP_ID: '3879828502555234376',

  // Zalo Mini App ID (CA MAU WATER SUPPLY JOINT STOCK COMPANY)
  MINI_APP_ID: '2784671839475576206',

  // Zalo Official Account ID (Bot Mobifone Testing - Service Test da cap quyen)
  OA_ID: '2562028218754028209',

  // Ten OA hien thi
  OA_NAME: 'Bot Mobifone Testing',

  // Ten Ung dung
  APP_NAME: 'CAWACO Testing',

  // Link mo truc tiep OA tren Zalo
  OA_URL: 'https://zalo.me/2562028218754028209',

  // Link truc tiep mo Mini App
  MINI_APP_URL: 'https://zalo.me/s/2784671839475576206/',
} as const;
