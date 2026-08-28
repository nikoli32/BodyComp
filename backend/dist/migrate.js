import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";
const migrationDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../migrations");
async function migrate() {
    await pool.query("create table if not exists schema_migrations (filename text primary key, applied_at timestamptz not null default now())");
    const applied = new Set((await pool.query("select filename from schema_migrations")).rows.map((row) => row.filename));
    const files = (await readdir(migrationDirectory)).filter((file) => file.endsWith(".sql")).sort();
    for (const filename of files) {
        if (applied.has(filename))
            continue;
        const client = await pool.connect();
        try {
            await client.query("begin");
            await client.query(await readFile(path.join(migrationDirectory, filename), "utf8"));
            await client.query("insert into schema_migrations (filename) values ($1)", [filename]);
            await client.query("commit");
            console.log(`Applied ${filename}`);
        }
        catch (error) {
            await client.query("rollback");
            throw error;
        }
        finally {
            client.release();
        }
    }
    await pool.end();
}
migrate().catch((error) => { console.error(error); process.exit(1); });
