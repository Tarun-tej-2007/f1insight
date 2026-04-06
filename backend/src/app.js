require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const driverRoutes = require('./routes/driver.routes');
const teamRoutes = require('./routes/team.routes');
const raceRoutes = require('./routes/race.routes');
const resultRoutes = require('./routes/result.routes');
const pitStopRoutes = require('./routes/pitStop.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const userRoutes = require('./routes/user.routes');

const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://f1insighgt.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/races', raceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/pitstops', pitStopRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// ─── Error Handler ────────────────────────────────────────
app.use(errorHandler);

// ─── Database + Server ───────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/f1-insight';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
