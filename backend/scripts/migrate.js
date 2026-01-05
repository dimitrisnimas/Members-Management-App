const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

const runMigrations = async () => {
    const client = await pool.connect();
    try {
        console.log('Starting migrations...');

        const migrationsDir = path.join(__dirname, '../migrations');
        const files = fs.readdirSync(migrationsDir).sort();

        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`Running migration: ${file}`);
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                await client.query(sql);
                console.log(`Completed migration: ${file}`);
            }
        }

        console.log('All migrations completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
};

runMigrations();
