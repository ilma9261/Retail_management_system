import app from '../backend/src/server.js';
import db from '../backend/src/config/db.js';

export default async function handler(req, res) {
  try {
    await db.initDB();
  } catch (err) {
    // continue to app handler
  }
  return app(req, res);
}
