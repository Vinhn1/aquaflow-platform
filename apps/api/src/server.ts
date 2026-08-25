import { createApp } from './app.js';

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`[AquaFlow CAWACO API] He thong Backend dang chay tai cong ${PORT}`);
  console.log(`[AquaFlow CAWACO API] Health check endpoint: http://localhost:${PORT}/health`);
});
