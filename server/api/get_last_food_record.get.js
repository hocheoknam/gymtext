import { defineEventHandler, getQuery } from 'h3';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  const { food_name, user_id } = getQuery(event);

  if (!food_name || !user_id) return { code: 400, message: "参数不足" };

  try {
    // 查找该用户记录过的、名称完全匹配的、时间最晚的一条记录
    const lastRecord = await sql`
      SELECT fr.portion, fr.total_calories, fr.total_protein, fr.total_carbs, fr.total_fat
      FROM food_records fr
      JOIN food_items fi ON fr.food_item_id = fi.id
      WHERE fr.user_id = ${user_id} AND fi.name = ${food_name}
      ORDER BY fr.time DESC
      LIMIT 1
    `;

    if (lastRecord.length > 0) {
      return { code: 200, data: lastRecord[0] };
    } else {
      return { code: 404, message: "无历史记录" };
    }
  } catch (error) {
    return { code: 500, message: error.message };
  }
});