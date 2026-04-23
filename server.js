/**
 * KisanClaim — Server entry point.
 *
 * Bootstraps the application, seeds initial JSON data if needed,
 * and handles graceful shutdown.
 */

const config = require('./src/config');
const app = require('./src/app');
const farmStore = require('./src/models/Farm');
const appStore = require('./src/models/Store');

let server;

async function start() {
  // Initialize JSON stores (seeds data if database.json is empty)
  await farmStore.initialize();
  await appStore.initialize();

  // Start Express
  server = app.listen(config.port, () => {
    console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║     🌾  KisanClaim API Server                            ║
  ║                                                          ║
  ║     Environment : ${config.env.padEnd(36)}║
  ║     Port        : ${String(config.port).padEnd(36)}║
  ║     Database    : ${'Local JSON'.padEnd(36)}║
  ║     Time        : ${new Date().toISOString().padEnd(36)}║
  ║                                                          ║
  ║     Health      : http://localhost:${config.port}/health${' '.repeat(Math.max(0, 18 - String(config.port).length))}║
  ║     Farms API   : http://localhost:${config.port}/api/v1/farms${' '.repeat(Math.max(0, 9 - String(config.port).length))}║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
  `);
  });
}

start().catch(err => {
  console.error('💥 Failed to start server:', err);
  process.exit(1);
});

// ── Graceful shutdown ────────────────────────────────────────

async function shutdown(signal) {
  console.log(`\n⏳ Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('✅ Server closed. Goodbye!');
      process.exit(0);
    });
  }

  // Force kill after 10s if connections don't drain
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});
