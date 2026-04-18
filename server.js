/**
 * KisanClaim — Server entry point.
 *
 * Boots the Express application and starts listening.
 * Handles graceful shutdown on SIGTERM / SIGINT.
 */

const config = require('./src/config');
const app = require('./src/app');

const server = app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║     🌾  KisanClaim API Server                            ║
  ║                                                          ║
  ║     Environment : ${config.env.padEnd(36)}║
  ║     Port        : ${String(config.port).padEnd(36)}║
  ║     Time        : ${new Date().toISOString().padEnd(36)}║
  ║                                                          ║
  ║     Health      : http://localhost:${config.port}/health${' '.repeat(Math.max(0, 18 - String(config.port).length))}║
  ║     Farms API   : http://localhost:${config.port}/api/v1/farms${' '.repeat(Math.max(0, 9 - String(config.port).length))}║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});

// ── Graceful shutdown ────────────────────────────────────────

function shutdown(signal) {
  console.log(`\n⏳ Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ Server closed. Goodbye!');
    process.exit(0);
  });

  // Force kill after 10s if connections don't drain
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled rejections / exceptions in production
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});
