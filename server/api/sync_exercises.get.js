import { defineEventHandler } from 'h3';
import { neon } from '@neondatabase/serverless';
import axios from 'axios';

const sql = neon(process.env.DATABASE_URL);

export default defineEventHandler(async (event) => {
  try {
    const RAPID_API_KEY = process.env.RAPID_API_KEY;
    let totalSaved = 0;

    // 循环 5 次，每次获取 10 条，利用 offset 跳过已获取的
    for (let i = 0; i < 5; i++) {
      const offset = i * 10;
      console.log(`正在获取第 ${offset + 1} 到 ${offset + 10} 条数据...`);

      const res = await axios.get('https://exercisedb.p.rapidapi.com/exercises', {
        params: { limit: '10', offset: offset.toString() },
        headers: {
          'X-RapidAPI-Key': RAPID_API_KEY,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
        }
      });

      const exercises = res.data;
      
      // 检查第一条数据的图片链接
      if (exercises.length > 0) {
        console.log('检查第一条数据的图片链接:', exercises[0].gifUrl);
      }

      for (const ex of exercises) {
        try {
          // 调试打印：如果你在终端看到 undefined，说明字段名还是错了
          console.log(`正在处理: ${ex.name}, 图片地址: ${ex.gifUrl}`);
          
          // 由于 API 返回的数据中没有 gifUrl 字段，我们使用占位图服务
          // 生成一个基于动作名称的图片链接
          const imgUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(ex.name)}`;

          await sql`
            INSERT INTO exercise_library (
              external_id, name_en, body_part, equipment, target_muscle, gif_url, instructions_en
            ) VALUES (
              ${ex.id},
              ${ex.name},
              ${ex.bodyPart},
              ${ex.equipment},
              ${ex.target},
              ${imgUrl}, -- 使用生成的图片链接
              ${JSON.stringify(ex.instructions)}
            )
            ON CONFLICT (external_id)
            DO UPDATE SET
              gif_url = EXCLUDED.gif_url,
              instructions_en = EXCLUDED.instructions_en;
          `;
          totalSaved++;
        } catch (dbError) {
          console.error(`数据库保存失败: ${dbError.message}`);
        }
      }
    }

    return { 
      code: 200, 
      message: '同步成功', 
      detail: `已成功入库并更新 ${totalSaved} 条数据` 
    };

  } catch (error) {
    console.error('同步崩溃:', error.message);
    return { code: 500, error: error.message };
  }
});