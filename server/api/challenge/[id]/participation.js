import { defineEventHandler, readBody, getMethod } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  const id = event.context.params.id; // 获取 URL 中的 challenge ID

  // 处理 DELETE 请求：取消报名
  if (method === 'DELETE') {
    try {
      // 从请求体中读取数据
      const body = await readBody(event);
      const { user_id } = body; // 前端需要在请求体中带上当前用户ID

      console.log('取消报名 - user_id:', user_id);
      console.log('取消报名 - challenge_id:', id);

      if (!user_id) {
        return {
          code: 400,
          message: '缺少 user_id',
          data: null
        };
      }

      // 执行删除操作
      try {
        // 开始事务
        await sql`BEGIN`;
        
        // 删除用户挑战记录
        const result = await sql`
          DELETE FROM user_challenges 
          WHERE user_id = ${user_id} AND challenge_id = ${id}
          RETURNING id
        `;

        console.log('取消报名 - 删除结果:', result);

        // 如果没有记录被删除，说明用户未报名
        if (result.length === 0) {
          await sql`ROLLBACK`;
          return {
            code: 400,
            message: '您未报名该挑战',
            data: null
          };
        }
        
        // 更新挑战表中的参与人数
        await sql`
          UPDATE challenge_activities
          SET participant_count = participant_count - 1
          WHERE id = ${id}
        `;
        
        // 提交事务
        await sql`COMMIT`;

        // 取消报名成功
        return {
          code: 200,
          message: '取消报名成功',
          data: {
            deleted: true
          }
        };
      } catch (error) {
        // 回滚事务
        await sql`ROLLBACK`;
        throw error;
      }

    } catch (error) {
      console.error('取消报名失败:', error);
      return {
        code: 500,
        message: error.message,
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
