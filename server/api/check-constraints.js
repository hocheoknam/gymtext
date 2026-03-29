import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 检查 checkins 表的外键约束
    const result = await sql`
      SELECT 
        conname as constraint_name,
        conrelid::regclass as table_name,
        a.attname as column_name,
        confrelid::regclass as referenced_table,
        af.attname as referenced_column
      FROM 
        pg_constraint c
      JOIN 
        pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
      JOIN 
        pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
      WHERE 
        c.contype = 'f' AND 
        c.conrelid = 'checkins'::regclass
    `;
    
    return {
      code: 200,
      message: '外键约束检查成功',
      data: result
    };

  } catch (error) {
    console.error('检查外键约束失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: null
    };
  }
});