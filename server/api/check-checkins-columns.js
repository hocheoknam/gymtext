import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 查看 checkins 表的所有列
    const result = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'checkins'
      ORDER BY ordinal_position
    `;
    
    return {
      code: 200,
      message: 'checkins 表列名检查成功',
      data: result
    };

  } catch (error) {
    console.error('检查表列名失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: null
    };
  }
});