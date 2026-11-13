import { createApp } from './server/src/app';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = createApp();

  if (process.env.NODE_ENV !== 'production') {
    // In dev: attach Vite dev server middleware to Express on port 3000
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        allowedHosts: true
      },
      appType: 'spa'
    });

    app.use(vite.middlewares);
    console.log(`[Dev] Vite middleware attached to Express.`);
  } else {
    // In production: serve static build
    const express = (await import('express')).default;
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`EduSaaS Multi-Tenant School Management Platform`);
    console.log(`Server & Client active at: http://0.0.0.0:${PORT}`);
    console.log(`API Base: http://0.0.0.0:${PORT}/api`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
