const mongoose = require('mongoose');

/**
 * Builds the MongoDB connection string.
 * Priority: MONGODB_URI  ->  Atlas string built from DB_* placeholders.
 */
function buildMongoUri() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) {
    return process.env.MONGODB_URI.trim();
  }

  const { DB_USERNAME, DB_PASSWORD, DB_NAME, DB_CLUSTER } = process.env;
  const missing = [];
  const isPlaceholder = (v) => !v || /^<.*>$/.test(v.trim());

  if (isPlaceholder(DB_USERNAME)) missing.push('DB_USERNAME');
  if (isPlaceholder(DB_PASSWORD)) missing.push('DB_PASSWORD');
  if (isPlaceholder(DB_NAME)) missing.push('DB_NAME');
  if (isPlaceholder(DB_CLUSTER)) missing.push('DB_CLUSTER');

  if (missing.length) {
    throw new Error(
      `MongoDB is not configured. Fill in ${missing.join(', ')} in server/.env ` +
        '(or set MONGODB_URI).'
    );
  }

  // encodeURIComponent keeps special characters in passwords (@, #, / ...) safe
  const user = encodeURIComponent(DB_USERNAME);
  const pass = encodeURIComponent(DB_PASSWORD);
  return `mongodb+srv://${user}:${pass}@${DB_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority`;
}

async function connectDB() {
  const uri = buildMongoUri();
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

module.exports = { connectDB, buildMongoUri };
