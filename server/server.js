import { createApp } from './src/app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);
const app = createApp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`EduSaaS Backend REST API (Standalone Mode)`);
  console.log(`Running on: http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
