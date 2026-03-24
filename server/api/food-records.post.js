// server/api/food-records.post.js
import { neon } from '@neondatabase/serverless';
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const userId = event.context.auth?.userId;
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: '未登录' });
  }

  const body = await readBody(event);
  const { name, portion, unit, calories, time, total_calories } = body;

  if (!name || !calories || !time) {
    throw createError({ statusCode: 400, statusMessage: '缺少必填字段' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // 1. 先插入或获取 food_item_id（简化处理：假设食物已存在，或直接用name关联）
    // 这里先临时用一个默认值，实际项目中应该先查询food_items表获取id
    const foodItemId = 1; // 临时处理，后续可优化为根据name查询food_items表

    // 2. 计算总热量
    const finalTotalCalories = total_calories || (portion / 100) * calories;
    // 3. 转换时间为date类型
    const recordDate = new Date(time).toISOString().split('T')[0];

    // 插入数据库（适配表字段名）
    const result = await sql`
      INSERT INTO food_records (
        user_id, food_item_id, meal_type, quantity_grams, total_calories, record_date
      ) VALUES (
        ${userId}, ${foodItemId}, '其他', ${portion}, ${finalTotalCalories}, ${recordDate}
      ) RETURNING *;
    `;

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('插入失败:', error);
    throw createError({ statusCode: 500, statusMessage: '数据库操作失败' });
  }
});