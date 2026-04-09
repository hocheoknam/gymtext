// server/api/food-records.post.js
import { neon } from '@neondatabase/serverless';
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // 1. 确保从 body 中获取了蛋白质、脂肪、碳水等原始数据
  const { 
    name, portion, calories, time, user_id, food_item_id,
    protein, fat, carbs // 接收前端传来的每100g含量或单价
  } = body;

  const userId = user_id || 3;

  if (!name || !calories || !time || !food_item_id) {
    throw createError({ statusCode: 400, statusMessage: '缺少必填字段' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // 2. 计算总值时，确保数值类型转换并限制位数
    const factor = (portion || 0) / 100;
    
    // 使用 Number() 包裹确保它是数字，toFixed 限制位数
    const finalTotalCalories = Number((factor * (calories || 0)).toFixed(2));
    const finalTotalProtein = Number((factor * (protein || 0)).toFixed(2));
    const finalTotalFat = Number((factor * (fat || 0)).toFixed(2));
    const finalTotalCarbs = Number((factor * (carbs || 0)).toFixed(2));
    
    // 3. 处理时间并【自动判断早午晚】
    const recordDate = new Date(time);
    const hour = recordDate.getHours();
    let mealType = '加餐'; // 默认值

    if (hour >= 5 && hour < 11) {
      mealType = '早餐';
    } else if (hour >= 11 && hour < 17) {
      mealType = '午餐';
    } else if (hour >= 17 && hour < 23) {
      mealType = '晚餐';
    } else {
      mealType = '深夜加餐';
    }

    const createdAt = recordDate.toISOString();

    // 3. 修改 INSERT 语句，包含所有列
    const result = await sql`
      INSERT INTO food_records (
        user_id, 
        food_item_id, 
        meal_type, 
        portion, 
        total_calories, 
        total_protein, 
        total_fat, 
        total_carbs, 
        time,
        created_at
      ) VALUES (
        ${userId}, 
        ${food_item_id}, 
        ${mealType}, 
        ${portion}, 
        ${finalTotalCalories}, 
        ${finalTotalProtein}, 
        ${finalTotalFat}, 
        ${finalTotalCarbs}, 
        ${createdAt}, -- 记录发生的业务时间
        NOW()         -- 记录存入数据库的系统时间
      ) RETURNING *;
    `;

    return { success: true, data: result[0] };
  } catch (error) {
    console.error('插入失败:', error);
    throw createError({ statusCode: 500, statusMessage: '数据库操作失败' });
  }
});