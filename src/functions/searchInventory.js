// src/functions/searchInventory.js
const { Client } = require("pg");

// Inicializa y conecta el cliente PG
const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});
client.connect()
  .then(() => console.log("[searchInventory] 🗄️ PG client connected"))
  .catch(err => console.error("[searchInventory] ❌ PG connection error:", err));

const TYPE_SYNONYMS = {
  pts: ["pts", "push to start"],
  "push to start": ["pts", "push to start"],
  akl: ["akl"],
  keyed: ["keyed"],
  remote: ["remote"],
  fob: ["fob"],
  "remote head": ["remote head"],
  ignition: ["ignition"],
};

function extractYear(text) {
  const m = text.match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : null;
}
function extractTypeKey(text) {
  const lower = text.toLowerCase();
  return Object.keys(TYPE_SYNONYMS).find(k => lower.includes(k)) || null;
}

async function searchInventory(input) {
  console.log("[searchInventory] ▶ start with input:", input);
  const sanitized = input.trim().toLowerCase();
  console.log("[searchInventory] sanitized input:", sanitized);

  const yearKey = extractYear(sanitized);
  const typeKey = extractTypeKey(sanitized);
  const typePatterns = typeKey ? TYPE_SYNONYMS[typeKey] : null;

  const rest = sanitized
    .replace(yearKey || "", "")
    .replace(typeKey || "", "")
    .split(" ")
    .filter(Boolean);
  const brand = rest.shift() || "";
  const model = rest.join(" ");

  console.log("[searchInventory] parsed parameters:", { yearKey, typeKey, brand, model });
  if (!brand || !model) {
    console.log("[searchInventory] missing brand or model, returning empty results");
    return { exact: [], alternatives: [] };
  }

  try {
    let result;

    // 1) Exacto con type y año
    if (typePatterns && yearKey) {
      console.log("[searchInventory] querying exact with type & year");
      result = await client.query(
        `SELECT * FROM inventory
         WHERE year = $1
           AND LOWER(brand) ILIKE $2
           AND LOWER(model) ILIKE $3
           AND (${typePatterns.map((_, i) => `LOWER(type) ILIKE $${i+4}`).join(" OR ")})`,
        [yearKey, `%${brand}%`, `%${model}%`, ...typePatterns.map(p => `%${p}%`)]
      );
      console.log("[searchInventory] exact/type/year rows:", result.rows.length);
      if (result.rows.length) return { exact: result.rows, alternatives: [] };

      console.log("[searchInventory] retry without year for type patterns");
      result = await client.query(
        `SELECT * FROM inventory
         WHERE LOWER(brand) ILIKE $1
           AND LOWER(model) ILIKE $2
           AND (${typePatterns.map((_, i) => `LOWER(type) ILIKE $${i+3}`).join(" OR ")})`,
        [`%${brand}%`, `%${model}%`, ...typePatterns.map(p => `%${p}%`)]
      );
      console.log("[searchInventory] fallback type rows:", result.rows.length);
      if (result.rows.length) return { exact: result.rows, alternatives: [] };
    }

    // 2) Exacto sin type, con año
    if (yearKey) {
      console.log("[searchInventory] querying exact without type but with year");
      result = await client.query(
        `SELECT * FROM inventory
         WHERE year = $1
           AND LOWER(brand) ILIKE $2
           AND LOWER(model) ILIKE $3`,
        [yearKey, `%${brand}%`, `%${model}%`]
      );
      console.log("[searchInventory] exact/year rows:", result.rows.length);
      if (result.rows.length) return { exact: result.rows, alternatives: [] };

      console.log("[searchInventory] retry without year/type");
      result = await client.query(
        `SELECT * FROM inventory
         WHERE LOWER(brand) ILIKE $1
           AND LOWER(model) ILIKE $2`,
        [`%${brand}%`, `%${model}%`]
      );
      console.log("[searchInventory] fallback year rows:", result.rows.length);
      if (result.rows.length) return { exact: result.rows, alternatives: [] };
    }

    // 3) Fallback por brand+model
    console.log("[searchInventory] querying final fallback suggestions");
    result = await client.query(
      `SELECT * FROM inventory
       WHERE LOWER(brand) ILIKE $1
         AND LOWER(model) ILIKE $2
       ORDER BY year
       LIMIT 5`,
      [`%${brand}%`, `%${model}%`]
    );
    console.log("[searchInventory] fallback suggestions rows:", result.rows.length);
    return { exact: [], alternatives: result.rows };

  } catch (err) {
    console.error("[searchInventory] ❌ ERROR during query:", err.stack || err.message);
    throw err;
  }
}

module.exports = searchInventory;
