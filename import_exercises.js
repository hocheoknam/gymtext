import axios from 'axios';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// 配置信息
const NEON_CONNECTION_STRING = "neon(process.env.DATABASE_URL)";
const RAPID_API_KEY = "ceec403b2emsh8676fff96650db2p198bcfjsn04fa04ee08df";

const client = new Client({
  connectionString: NEON_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});

async function runImport() {
  try {
    await client.connect();
    console.log('--- 已连接到 Neon 数据库 ---');

    // 创建表
    await client.query(`
      CREATE TABLE IF NOT EXISTS exercise_library (
        id SERIAL PRIMARY KEY,
        external_id VARCHAR(50) UNIQUE,
        name_en VARCHAR(255),
        body_part VARCHAR(100),
        equipment VARCHAR(100),
        target_muscle VARCHAR(100),
        gif_url TEXT,
        instructions_en TEXT
      );
    `);

    console.log('正在从 ExerciseDB 获取数据...');
    const response = await axios.get('https://exercisedb.p.rapidapi.com/exercises', {
      params: { limit: '50' },
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });

    const exercises = response.data;
    const queryText = `
      INSERT INTO exercise_library (external_id, name_en, body_part, equipment, target_muscle, gif_url, instructions_en)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (external_id) DO NOTHING;
    `;

    for (const ex of exercises) {
      const values = [
        ex.id, 
        ex.name, 
        ex.bodyPart, 
        ex.equipment, 
        ex.target, 
        ex.gifUrl, 
        JSON.stringify(ex.instructions)
      ];
      await client.query(queryText, values);
    }

    console.log(`--- 成功导入 ${exercises.length} 个动作！ ---`);

  } catch (err) {
    console.error('导入过程中出错:', err);
  } finally {
    await client.end();
  }
}

runImport();