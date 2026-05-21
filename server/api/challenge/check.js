import { defineEventHandler, getQuery } from 'h3';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  const { user_id, challenge_id } = getQuery(event);

  if (!user_id || !challenge_id) {
    return { code: 400, message: '缺少参数' };
  }

  try {
    // 1. 获取当前挑战的全站统计数据（针对所有参加此挑战的用户）
    const statsResult = await sql`
      SELECT 
        COUNT(*)::int as total_participants, 
        -- 只有目标天数大于 0 且进度达标才算真正完成
        COUNT(*) FILTER (WHERE target_duration > 0 AND current_progress >= target_duration)::int as completed_count
      FROM user_challenges 
      WHERE challenge_id = ${challenge_id}
    `;

    // 2. 获取当前用户的个人进度（用于显示 7/7 和勋章）
    const userResult = await sql`
      SELECT current_progress, target_duration 
      FROM user_challenges 
      WHERE user_id = ${user_id} AND challenge_id = ${challenge_id}
      LIMIT 1
    `;

    const stats = statsResult[0];
    const total = stats.total_participants || 0;
    const completed = stats.completed_count || 0;

    // 计算全站完成率：(完成人数 / 总人数)
    const globalCompletionRate = total > 0
      ? ((completed / total) * 100).toFixed(2)
      : "0.00";

    const userRecord = userResult[0] || { current_progress: 0, target_duration: 7 };

    return {
      code: 200,
      message: 'success',
      data: {
        // 个人数据
        checkinCount: Number(userRecord.current_progress),
        target_duration: Number(userRecord.target_duration),
        isCompleted: Number(userRecord.current_progress) >= Number(userRecord.target_duration),
        isJoined: userResult.length > 0,
        
        // 全站数据（对应你箭头指的那个位置）
        participant_count: total,
        global_completion_rate: globalCompletionRate
      }
    };
  } catch (error) {
    console.error('统计失败:', error);
    return { code: 500, message: '服务器错误' };
  }
});