/**
 * Express application factory.
 *
 * This module configures middleware and mounts routes but does NOT
 * call `.listen()` — that happens in `server.js`. This separation
 * makes the app testable without binding to a port.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const ApiResponse = require('./utils/ApiResponse');

const app = express();

// ── Security & parsing ───────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logging ──────────────────────────────────────────
app.use(morgan('dev'));

// ── Routes ───────────────────────────────────────────────────
app.use(routes);

// ── 404 catch-all ────────────────────────────────────────────
app.use((_req, res) => {
  new ApiResponse(404, 'The requested endpoint does not exist').send(res);
});

// ── Global error handler (must be last) ──────────────────────
app.use(errorHandler);

module.exports = app;
