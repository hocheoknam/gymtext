import { defineEventHandler, readBody } from 'h3';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    // 1. 获取请求体数据
    const body = await readBody(event);
    const { challenge_id, proof } = body;

    // 2. 从请求头中获取令牌
    const authHeader = event.node.req.headers.authorization;
    
    if (!authHeader) {
      return {
        code: 401,
        message: '未提供认证令牌',
        data: null
      };
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return {
        code: 401,
        message: '未提供认证令牌',
        data: null
      };
    }

    // 3. 验证令牌
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      console.error('令牌验证失败:', error);
      return {
        code: 401,
        message: '无效的认证令牌',
        data: null
      };
    }

    // 4. 从令牌中获取用户 ID
    const user_id = decoded.user_id;

    // 5. 基础参数校验
    if (!user_id || !challenge_id) {
      return {
        code: 400,
        message: '缺少必要参数：user_id 或 challenge_id',
        data: null
      };
    }

    // 6. 检查用户是否参与了该挑战
    const userChallengeResult = await sql`
      SELECT id, current_progress, target_duration
      FROM user_challenges
      WHERE user_id = ${user_id} AND challenge_id = ${challenge_id}
    `;

    if (userChallengeResult.length === 0) {
      return {
        code: 400,
        message: '用户未参与该挑战，请先参与挑战',
        data: null
      };
    }

    const userChallengeId = userChallengeResult[0].id;
    const currentProgress = userChallengeResult[0].current_progress;
    const targetDuration = userChallengeResult[0].target_duration;

    // 7. 检查今天是否已经打卡
    const todayCheckin = await sql`
      SELECT id
      FROM checkins
      WHERE user_id = ${user_id}
      AND challenge_id = ${userChallengeId}
      AND DATE(checkin_time) = CURRENT_DATE
    `;

    if (todayCheckin.length > 0) {
      return {
        code: 400,
        message: '今天已经打卡过了，每个挑战每天只能打卡一次',
        data: null
      };
    }

    // 8. 获取挑战信息（包括奖励勋章代码）
    const challengeInfo = await sql`
      SELECT reward_achievement_code
      FROM challenge_activities
      WHERE id = ${challenge_id}
    `;

    const rewardAchievementCode = challengeInfo.length > 0 ? challengeInfo[0].reward_achievement_code : null;

    // 🎯 核心事务控制：使用 PostgreSQL 事务确保数据一致性
    let checkinResult = null;
    let achievementResult = null;

    try {
      // 开始事务（Neon PostgreSQL 支持 BEGIN/COMMIT/ROLLBACK）
      await sql`BEGIN`;

      // 步骤 1：向 checkins 插入打卡记录
      checkinResult = await sql`
        INSERT INTO checkins (user_id, challenge_id, proof)
        VALUES (${user_id}, ${userChallengeId}, ${proof || null})
        RETURNING id, user_id, challenge_id, checkin_time, proof
      `;

      // 步骤 2：更新 user_challenges 的已打卡天数
      const newProgress = (currentProgress || 0) + 1;
      await sql`
        UPDATE user_challenges
        SET current_progress = ${newProgress}
        WHERE id = ${userChallengeId}
      `;

      // 步骤 3：判断是否达到完成阈值，若是则发放成就
      if (newProgress >= targetDuration && rewardAchievementCode) {
        // 更新挑战状态为已完成
        await sql`
          UPDATE user_challenges
          SET status = 'completed'
          WHERE id = ${userChallengeId}
        `;

        // 发放成就（使用 ON CONFLICT 避免重复发放）
        achievementResult = await sql`
          INSERT INTO user_achievements (user_id, achievement_code, awarded_at)
          VALUES (${user_id}, ${rewardAchievementCode}, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id, achievement_code) DO NOTHING
          RETURNING id, user_id, achievement_code, awarded_at
        `;
      }

      // 提交事务
      await sql`COMMIT`;

      console.log('✅ 打卡事务提交成功');
      
    } catch (transactionError) {
      // 回滚事务
      await sql`ROLLBACK`;
      
      console.error('❌ 打卡事务回滚:', transactionError.message);
      
      return {
        code: 500,
        message: '打卡失败：事务回滚',
        error: transactionError.message,
        data: null
      };
    }

    // 9. 返回结果
    return {
      code: 200,
      message: achievementResult ? '打卡成功，恭喜获得成就！' : '打卡成功',
      data: {
        checkin: checkinResult[0],
        achievement: achievementResult?.[0] || null,
        new_progress: (currentProgress || 0) + 1,
        target_duration: targetDuration
      }
    };

  } catch (error) {
    console.error('打卡失败:', error);

    // 判断是否是外键约束错误
    if (error.code === '23503') {
      return {
        code: 400,
        message: '提交失败：用户挑战关系无效，请确认后再试。',
        error: error.message,
        data: null
      };
    }

    // 通用服务器错误
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: null
    };
  }
});
