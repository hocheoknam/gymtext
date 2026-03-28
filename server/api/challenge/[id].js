import { defineEventHandler, readBody, getMethod } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const id = event.context.params.id; // 获取 URL 中的 challenge ID

  // 1. 处理 GET 请求：获取挑战详情 (原有的功能)
  if (method === 'GET') {
    // 检查是否是查询报名状态的请求
    const url = event.node.req.url || '';
    if (url.includes('?check_participation')) {
      try {
        // 从请求体中读取数据
        const body = await readBody(event);
        const { user_id } = body; // 前端需要在请求体中带上当前用户ID

        console.log('检查报名状态 - user_id:', user_id);
        console.log('检查报名状态 - challenge_id:', id);

        if (!user_id) {
          return {
            code: 400,
            message: '缺少 user_id',
            data: null
          };
        }

        // 直接查询关联表
        const result = await sql`
          SELECT id FROM user_challenges 
          WHERE user_id = ${user_id} AND challenge_id = ${id}
        `;

        console.log('检查报名状态 - 查询结果:', result);

        // 如果有记录，说明已报名
        return {
          code: 200,
          message: 'success',
          data: {
            participated: result.length > 0 // 关键返回值
          }
        };

      } catch (error) {
        console.error('检查报名状态失败:', error);
        return {
          code: 500,
          message: error.message,
          data: null
        };
      }
    }
    
    // 原有的获取挑战详情逻辑
    try {
      const challenge = await sql`
        SELECT 
          id, 
          title, 
          description, 
          status, 
          target_duration, 
          start_date, 
          end_date, 
          participant_count, 
          completion_rate,
          created_at,
          updated_at
        FROM challenge_activities
        WHERE id = ${id}
      `;

      // 检查挑战是否存在
      if (challenge.length === 0) {
        return {
          code: 404,
          message: '挑战不存在',
          data: null
        };
      }

      return {
        code: 200,
        message: 'success',
        data: challenge[0]
      };
    } catch (error) {
      console.error('获取挑战详情失败:', error);
      return {
        code: 500,
        message: '服务器错误',
        error: error.message,
        data: null
      };
    }
  }

  // 2. 处理 POST 请求：创建用户参与记录 (新增的功能)
  if (method === 'POST') {
    try {
      // 从请求体中读取数据
      const body = await readBody(event);
      const { user_id } = body; // 前端会传过来当前登录用户的 ID

      // 打印参数，用于调试
      console.log('收到的 user_id:', user_id);
      console.log('收到的 challenge_id:', id);
      console.log('完整请求体:', body);

      if (!user_id) {
        return {
          code: 400,
          message: '缺少 user_id',
          data: null
        };
      }

      // 防止重复报名：先检查是否已经报名
      const existing = await sql`
        SELECT id 
        FROM user_challenges 
        WHERE user_id = ${user_id} AND challenge_id = ${id}
      `;

      if (existing.length > 0) {
        return {
          code: 400,
          message: '您已经报名过该挑战',
          data: null
        };
      }

      // --- 关键修改点 ---
      // 原来的代码可能在检查外键时使用了错误的表名 'users'
      // 根据你的数据库截图，正确的表名是 'gym_app_user'

      // 先检查用户是否存在（修正表名）
      const userExists = await sql`
        SELECT id FROM gym_app_user WHERE id = ${user_id}
      `;

      if (userExists.length === 0) {
        return {
          code: 400,
          message: '用户不存在，无法报名',
          data: null
        };
      }

      // 先检查挑战是否存在（确保数据完整性）
      const challengeExists = await sql`
        SELECT id FROM challenge_activities WHERE id = ${id}
      `;

      if (challengeExists.length === 0) {
        return {
          code: 400,
          message: '挑战不存在，无法报名',
          data: null
        };
      }

      // 执行插入操作
      try {
        // 开始事务
        await sql`BEGIN`;
        
        // 插入用户挑战记录
        const result = await sql`
          INSERT INTO user_challenges (user_id, challenge_id, status, start_date)
          VALUES (${user_id}, ${id}, 'progress', CURRENT_DATE)
          RETURNING id
        `;
        
        // 更新挑战表中的参与人数
        await sql`
          UPDATE challenge_activities
          SET participant_count = participant_count + 1
          WHERE id = ${id}
        `;
        
        // 提交事务
        await sql`COMMIT`;

        // 返回成功信息
        return {
          code: 200,
          message: '报名成功',
          data: {
            participation_id: result[0].id
          }
        };
      } catch (insertError) {
        // 回滚事务
        await sql`ROLLBACK`;
        
        console.error('插入数据失败:', insertError);
        
        // 这里可以保留，但上面的预检查通常能拦截大部分问题
        if (insertError.message.includes('foreign key constraint')) {
          return {
            code: 400,
            message: '外键约束错误，请检查用户ID和挑战ID是否有效',
            data: null
          };
        }
        
        throw insertError;
      }

    } catch (error) {
      console.error('报名失败:', error);
      return {
        code: 500,
        message: '服务器内部错误',
        error: error.message,
        data: null
      };
    }
  }

  // 如果是其他请求方法，返回 405 Method Not Allowed
  event.node.res.statusCode = 405;
  return {
    code: 405,
    message: 'Method Not Allowed',
    data: null
  };
});