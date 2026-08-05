import { Pool } from 'pg';
import process from 'process';

const DbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    password: process.env.DB_PASSWORD
};

export async function executeSQL(sqlScript: any): Promise<void> {
    try {
        const pool = new Pool(DbConfig);
        const client = await pool.connect();

        const result = await client.query(sqlScript);
        console.log(result.rows);
    } catch(error) {
        console.log('Erro ao executar SQL ' + error);
    }
}