import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 查看 checkins 表的所有约束
    const result = await sql`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        conrelid::regclass as table_name
      FROM 
        pg_constraint
      WHERE 
        conrelid = 'checkins'::regclass
      ORDER BY 
        conname
    `;
    
    return {
      code: 200,
      message: '约束检查成功',
      data: result
    };

  } catch (error) {
    console.error('检查约束失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: null
    };
  }
});