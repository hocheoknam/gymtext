// server/api/food-records.post.js
import { neon } from '@neondatabase/serverless';
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // 从请求体中获取 foodItemId
  const { name, portion, unit, calories, time, total_calories, user_id, food_item_id } = body;

  const userId = user_id || 3;

  if (!name || !calories || !time || !food_item_id) {
    throw createError({ statusCode: 400, statusMessage: '缺少必填字段: name, calories, time, food_item_id' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const finalTotalCalories = total_calories || (portion / 100) * calories;
    const createdAt = new Date(time).toISOString();

    console.log('插入食物记录:', {
      userId,
      foodItemId: food_item_id, // 使用请求体中的 ID
      portion,
      finalTotalCalories,
      createdAt
    });

    const result = await sql`
      INSERT INTO food_records (
        user_id, food_item_id, meal_type, portion, total_calories, created_at
      ) VALUES (
        ${userId}, ${food_item_id}, '其他', ${portion}, ${finalTotalCalories}, ${createdAt}
      ) RETURNING *;
    `;

    console.log('插入成功:', result[0]);
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('插入失败:', error);
    throw createError({ statusCode: 500, statusMessage: '数据库操作失败' });
  }
});