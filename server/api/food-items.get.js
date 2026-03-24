import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';

// 连接 Neon PostgreSQL
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async () => {
  try {
    // 查询所有可用食物（按名称排序）
    const foodItems = await sql`
      SELECT id, name, category, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g 
      FROM food_items 
      ORDER BY name ASC;
    `;

    return {
      code: 200,
      message: 'success',
      data: foodItems
    };
  } catch (error) {
    console.error('获取食物列表失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message
    };
  }
});