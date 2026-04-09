import { neon } from '@neondatabase/serverless';
import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { id } = query;

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '请提供要删除的记录ID' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // 执行删除操作
    const result = await sql`
      DELETE FROM food_records
      WHERE id = ${id}
      RETURNING id;
    `;

    if (result.length === 0) {
      throw createError({ statusCode: 404, statusMessage: '未找到该记录' });
    }

    return { success: true, message: '删除成功', deletedId: id };
  } catch (error) {
    console.error('删除失败:', error);
    throw createError({ statusCode: 500, statusMessage: '数据库删除失败' });
  }
});