import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';

const PORT = process.env.PORT || 5000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 [Server] PKS Portal API đang chạy tại: http://localhost:${PORT}`);
  console.log(`📡 [Healthcheck] http://localhost:${PORT}/health`);
});
