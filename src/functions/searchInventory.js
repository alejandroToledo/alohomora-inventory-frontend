// src/functions/searchInventory.js
const { Client } = require("pg");

const client = new Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});
client.connect();

const TYPE_SYNONYMS = {
  pts:      ["pts", "push to start"],
  "push to start": ["pts", "push to start"],
  akl:      ["akl"],
  keyed:    ["keyed"],
  remote:   ["remote"],
  fob:      ["fob"],
  "remote head": ["remote head"],
  ignition: ["ignition"],
};

function extractYear(text) {
  const m = text.match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : null;
}
function extractTypeKey(text) {
  const lower = text.toLowerCase();
  return Object.keys(TYPE_SYNONYMS).find((k) => lower.includes(k)) || null;
}

async function searchInventory(input) {
  const sanitized   = input.trim().toLowerCase();
  const year        = extractYear(sanitized);
  const typeKey     = extractTypeKey(sanitized);
  const typePatterns= typeKey ? TYPE_SYNONYMS[typeKey] : null;
  // limpiamos año y type para aislar brand+model
  const rest = sanitized
    .replace(year || "", "")
    .replace(typeKey || "", "")
    .split(" ")
    .filter(Boolean);
  const brand = rest.shift() || "";
  const model = rest.join(" ");

  if (!brand || !model) return { exact: [], alternatives: [] };

  try {
    let result;

    // 1) exacto con type+y/o año
    if (typePatterns && year) {
      result = await client.query(
        `
        SELECT * FROM inventory
        WHERE year = $1
          AND LOWER(brand) ILIKE $2
          AND LOWER(model) ILIKE $3
          AND (${typePatterns
            .map((_, i) => `LOWER(type) ILIKE $${i+4}`)
            .join(" OR ")})
        `,
        [year, `%${brand}%`, `%${model}%`, ...typePatterns.map(p=>`%${p}%`)]
      );
      if (result.rows.length) 
        return { exact: result.rows, alternatives: [] };
      // si no hay, buscar sin año
      result = await client.query(
        `
        SELECT * FROM inventory
        WHERE LOWER(brand) ILIKE $1
          AND LOWER(model) ILIKE $2
          AND (${typePatterns
            .map((_, i) => `LOWER(type) ILIKE $${i+3}`)
            .join(" OR ")})
        `,
        [`%${brand}%`, `%${model}%`, ...typePatterns.map(p=>`%${p}%`)]
      );
      if (result.rows.length)
        return { exact: result.rows, alternatives: [] };
    }

    // 2) exacto sin type, con año
    if (year) {
      result = await client.query(
        `
        SELECT * FROM inventory
        WHERE year = $1
          AND LOWER(brand) ILIKE $2
          AND LOWER(model) ILIKE $3
        `,
        [year, `%${brand}%`, `%${model}%`]
      );
      if (result.rows.length)
        return { exact: result.rows, alternatives: [] };
      // si no hay, buscar sin año
      result = await client.query(
        `
        SELECT * FROM inventory
        WHERE LOWER(brand) ILIKE $1
          AND LOWER(model) ILIKE $2
        `,
        [`%${brand}%`, `%${model}%`]
      );
      if (result.rows.length)
        return { exact: result.rows, alternatives: [] };
    }

    // 3) ni year ni type o último fallback: sugerencias por brand+model
    result = await client.query(
      `
      SELECT * FROM inventory
      WHERE LOWER(brand) ILIKE $1
        AND LOWER(model) ILIKE $2
      ORDER BY year
      LIMIT 5
      `,
      [`%${brand}%`, `%${model}%`]
    );
    return { exact: [], alternatives: result.rows };

  } catch (err) {
    console.error("❌ Error in searchInventory:", err);
    return { exact: [], alternatives: [] };
  }
}

module.exports = searchInventory;
