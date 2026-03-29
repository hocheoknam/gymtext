import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 直接查询 pg_constraint 表
    const result = await sql`
      SELECT 
        conname,
        contype,
        conrelid::regclass as table_name,
        confrelid::regclass as referenced_table
      FROM 
        pg_constraint
      WHERE 
        conrelid = 'checkins'::regclass
      ORDER BY 
        conname
    `;
    
    return {
      code: 200,
      message: '约束查询成功',
      data: result
    };

  } catch (error) {
    console.error('查询约束失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: null
    };
  }
});