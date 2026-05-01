const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

const { fnInitializeDatabase } = require('./db/database');
const { fnHandleError } = require('./middleware/errorMiddleware');

dotenv.config();

const nPort = Number(process.env.PORT || 3000);
const cApp = express();

const fnStartServer = async () => {
  await fnInitializeDatabase();

  // These middleware calls are kept near the top of the file so every route
  // receives already-parsed request bodies and can focus on business logic.
  cApp.use(express.json({ limit: '1mb' }));
  cApp.use(express.urlencoded({ extended: true }));

  // Static assets are served from both our public directory and selected local
  // dependency folders so the browser never needs a CDN.
  cApp.use(express.static(path.join(__dirname, 'public')));
  cApp.use('/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
  cApp.use('/vendor/jspdf', express.static(path.join(__dirname, 'node_modules', 'jspdf', 'dist')));

  cApp.use('/api/jobs', require('./routes/jobRoutes'));
  cApp.use('/api/responsibilities', require('./routes/responsibilityRoutes'));
  cApp.use('/api/skills', require('./routes/skillRoutes'));
  cApp.use('/api/skill-categories', require('./routes/skillCategoryRoutes'));
  cApp.use('/api/certifications', require('./routes/certificationRoutes'));
  cApp.use('/api/awards', require('./routes/awardRoutes'));
  cApp.use('/api/settings', require('./routes/settingRoutes'));
  cApp.use('/api/resumes', require('./routes/resumeRoutes'));
  cApp.use('/api/ai', require('./routes/aiRoutes'));

  // Route the page URLs to static HTML files to keep the project easy to follow
  // for beginners without introducing a template engine.
  cApp.get('/', (cRequest, cResponse) => {
    cResponse.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  cApp.get('/jobs', (cRequest, cResponse) => {
    cResponse.sendFile(path.join(__dirname, 'public', 'jobs.html'));
  });

  cApp.get('/skills', (cRequest, cResponse) => {
    cResponse.sendFile(path.join(__dirname, 'public', 'skills.html'));
  });

  cApp.get('/credentials', (cRequest, cResponse) => {
    cResponse.sendFile(path.join(__dirname, 'public', 'credentials.html'));
  });

  cApp.get('/builder', (cRequest, cResponse) => {
    cResponse.sendFile(path.join(__dirname, 'public', 'builder.html'));
  });

  cApp.get('/preview', (cRequest, cResponse) => {
    cResponse.sendFile(path.join(__dirname, 'public', 'preview.html'));
  });

  cApp.use(fnHandleError);

  cApp.listen(nPort, () => {
    console.log(`Resume Builder is running on http://localhost:${nPort}`);
  });
};

fnStartServer().catch((cError) => {
  console.error('Failed to start Resume Builder.', cError);
  process.exit(1);
});
