import mysql from "mysql2/promise";

function required(name: string, v: string | undefined) {
  // Allow empty string values (e.g. local MySQL root password can be empty).
  // Only treat truly-undefined env vars as missing.
  if (v === undefined) throw new Error(`Missing env: ${name}`);
  return v;
}

export const db = mysql.createPool({
  host: required("MYSQL_HOST", process.env.MYSQL_HOST),
  port: Number(process.env.MYSQL_PORT || 3306),
  user: required("MYSQL_USER", process.env.MYSQL_USER),
  password: required("MYSQL_PASSWORD", process.env.MYSQL_PASSWORD),
  database: required("MYSQL_DATABASE", process.env.MYSQL_DATABASE),
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONN_LIMIT || 10),
  queueLimit: 0,
});

export async function query<T = any>(sql: string, params: any[] = []) {
  const [rows] = await db.execute(sql, params);
  return rows as T;
}
