import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 连接数据库
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 创建deepseek_api_keys表
    await sql`
      CREATE TABLE IF NOT EXISTS deepseek_api_keys (
        id SERIAL PRIMARY KEY,
        api_key VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    return {
      code: 200,
      message: 'DeepSeek API Key表创建成功',
      data: null
    };
  } catch (error) {
    console.error('创建DeepSeek API Key表失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message
    };
  }
});
