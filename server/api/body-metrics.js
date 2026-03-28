import { defineEventHandler, readBody, getQuery } from 'h3';
import { neon } from '@neondatabase/serverless';

// 统一的 Neon PostgreSQL 连接方式
const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    const method = event.node.req.method;

    // 处理GET请求 - 获取体重和体脂率数据
    if (method === 'GET') {
      // 获取查询参数
      const { user_id } = getQuery(event);

      if (!user_id) {
        return {
          code: 400,
          message: '请提供 user_id',
          data: []
        };
      }

      // 查询体重和体脂率数据
      // 注意：这里我们关联了 gym_app_user 表，以便查询时能看到用户名，如果你不需要用户名，可以去掉 JOIN 部分
      const metrics = await sql`
        SELECT 
          m.id,
          m.user_id,
          u.username, -- 关联查询用户名（可选）
          m.weight_kg AS weight, 
          m.body_fat, 
          m.height_cm AS height,
          m.measurement_date, 
          m.created_at
        FROM body_metrics m
        LEFT JOIN gym_app_user u ON m.user_id = u.id -- 左连接用户表，避免用户被删后数据丢失
        WHERE m.user_id = ${user_id}
        ORDER BY m.measurement_date ASC -- 按日期正序排列，便于前端绘制趋势图
      `;

      // 为每条记录计算BMI
      const metricsWithBMI = (metrics || []).map(record => {
        let bmi = null;
        
        // 只有当身高和体重都有值时才计算
        if (record.weight && record.height) {
          const heightInMeters = record.height / 100; // 厘米转米
          bmi = (record.weight / (heightInMeters * heightInMeters)).toFixed(1); // 保留1位小数
        }
        
        return {
          ...record,
          bmi: bmi
        };
      });

      return {
        code: 200,
        message: 'success',
        data: metricsWithBMI
      };
    }

    // 处理POST请求 - 添加或更新体重记录
    if (method === 'POST') {
      const body = await readBody(event);
      console.log('收到的POST请求数据:', body);

      // 验证必要字段
      if (!body.user_id || !body.weight_kg || !body.measurement_date) {
        return {
          code: 400,
          message: '缺少必要字段: user_id, weight_kg, measurement_date',
          data: null
        };
      }

      try {
        // 开始事务
        await sql`BEGIN`;

        // 插入体重记录 (增加了 height_cm)
        const result = await sql`
          INSERT INTO body_metrics (user_id, weight_kg, body_fat, height_cm, measurement_date, created_at, updated_at)
          VALUES (${body.user_id}, ${body.weight_kg}, ${body.body_fat || 0}, ${body.height_cm || null}, ${body.measurement_date}, NOW(), NOW())
          RETURNING id, user_id, weight_kg AS weight, height_cm AS height, body_fat, measurement_date
        `;

        // 提交事务
        await sql`COMMIT`;

        // 计算BMI
        const userData = result[0];
        let bmi = null;
        
        // 只有当身高和体重都有值时才计算
        if (userData.weight && userData.height) {
          const heightInMeters = userData.height / 100; // 厘米转米
          bmi = (userData.weight / (heightInMeters * heightInMeters)).toFixed(1); // 保留1位小数
        }
        
        // 把计算好的BMI附加到返回数据中
        return {
          code: 200,
          message: 'success',
          data: {
            ...userData,
            bmi: bmi // 前端直接拿这个用
          }
        };
      } catch (insertError) {
        // 回滚事务
        await sql`ROLLBACK`;
        
        console.error('插入体重数据失败:', insertError);
        
        if (insertError.message.includes('foreign key constraint')) {
          return {
            code: 400,
            message: '外键约束错误，请检查用户ID是否有效',
            data: null
          };
        }
        
        return {
          code: 500,
          message: '服务器错误',
          error: insertError.message,
          data: null
        };
      }
    }

    // 处理DELETE请求 - 删除体重记录
    if (method === 'DELETE') {
      const body = await readBody(event);
      console.log('收到的DELETE请求数据:', body);

      // 验证必要字段
      if (!body.id) {
        return {
          code: 400,
          message: '缺少必要字段: id',
          data: null
        };
      }

      try {
        // 开始事务
        await sql`BEGIN`;

        // 删除体重记录
        const result = await sql`
          DELETE FROM body_metrics 
          WHERE id = ${body.id}
          RETURNING id
        `;

        // 如果没有记录被删除，说明记录不存在
        if (result.length === 0) {
          await sql`ROLLBACK`;
          return {
            code: 400,
            message: '体重记录不存在',
            data: null
          };
        }

        // 提交事务
        await sql`COMMIT`;

        return {
          code: 200,
          message: 'success',
          data: {
            deleted: true
          }
        };
      } catch (error) {
        // 回滚事务
        await sql`ROLLBACK`;
        return {
          code: 500,
          message: '服务器错误',
          error: error.message,
          data: null
        };
      }
    }

    // 处理不支持的请求方法
    return {
      code: 405,
      message: '不支持的请求方法',
      data: null
    };

  } catch (error) {
    console.error('处理体重数据失败:', error);
    return {
      code: 500,
      message: '服务器错误',
      error: error.message,
      data: []
    };
  }
});