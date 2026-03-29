import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 查看 user_challenges 表的结构
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'user_challenges'
      ORDER BY ordinal_position
    `;
    
    return {
      code: 200,
      message: 'user_challenges 表结构检查成功',
      data: result
    };

  } catch (error) {
    console.error('检查表结构失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: null
    };
  }
});