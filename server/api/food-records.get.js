// server/api/food-records.get.js
import { neon } from '@neondatabase/serverless';
import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { user_id } = query;

  if (!user_id) {
    throw createError({ statusCode: 400, statusMessage: '请提供用户ID' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // 执行查询操作，获取用户的食物记录
    const result = await sql`
      SELECT * FROM food_records
      WHERE user_id = ${user_id}
      ORDER BY time DESC;
    `;

    // 转换字段名，确保与前端期望的一致
    const formattedResult = result.map(record => ({
      id: record.id,
      user_id: record.user_id,
      food_item_id: record.food_item_id,
      meal_type: record.meal_type,
      portion: record.portion,
      calories: record.total_calories,
      protein: record.total_protein,
      fat: record.total_fat,
      carbs: record.total_carbs,
      time: record.time,
      created_at: record.created_at
    }));

    return { success: true, data: formattedResult };
  } catch (error) {
    console.error('获取食物记录失败:', error);
    throw createError({ statusCode: 500, statusMessage: '数据库查询失败' });
  }
});