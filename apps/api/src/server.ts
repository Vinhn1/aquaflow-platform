import 'dotenv/config';
import http from 'http';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3000;
const app = createApp();

const server = http.createServer({ maxHeaderSize: 65536 }, app);

server.listen(PORT, () => {
  console.log(`[AquaFlow CAWACO API] He thong Backend dang chay tai cong ${PORT}`);
  console.log(`[AquaFlow CAWACO API] Health check endpoint: http://localhost:${PORT}/health`);
});

// Xu ly tat server an toan (Graceful Shutdown)
function handleShutdown(signal: string) {
  console.log(`[AquaFlow CAWACO API] Nhan tin hieu ${signal}. Dang dong ket noi va tat may chu an toan...`);
  server.close(() => {
    console.log('[AquaFlow CAWACO API] Tat ca ket noi HTTP da duoc dong an toan. Tien trinh ket thuc.');
    process.exit(0);
  });

  // Neu sau 10 giay khong dong duoc tat ca ket noi thi bat buoc dung
  setTimeout(() => {
    console.error('[AquaFlow CAWACO API] Qua thoi gian cho 10s. Bat buoc dung tien trinh.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
