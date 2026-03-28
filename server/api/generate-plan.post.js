import { defineEventHandler, readBody } from 'h3';
import { getCacheKey, getFromCache, setToCache } from '../utils/cache';

// 配置OpenAI客户端
function createOpenAI(apiKey) {
  return {
    async chatCompletionsCreate({ model, messages, stream }) {
      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            stream
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'API调用失败');
        }

        if (stream) {
          // 处理流式响应
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let result = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            result += chunk;
          }

          return result;
        } else {
          // 处理非流式响应
          return await response.json();
        }
      } catch (error) {
        console.error('DeepSeek API调用失败:', error);
        throw error;
      }
    }
  };
}

// 调用模型API
async function callModelAPI(prompt, api_key) {
  // 创建OpenAI客户端
  const openai = createOpenAI(api_key);

  // 调用DeepSeek API
  const response = await openai.chatCompletionsCreate({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: prompt }],
    stream: false
  });

  // 打印响应结构
  console.log('API响应结构:', response);
  console.log('响应类型:', typeof response);
  console.log('是否有choices:', 'choices' in response);
  if ('choices' in response) {
    console.log('choices长度:', response.choices.length);
    if (response.choices.length > 0) {
      console.log('第一个choice:', response.choices[0]);
      console.log('是否有message:', 'message' in response.choices[0]);
      if ('message' in response.choices[0]) {
        console.log('message:', response.choices[0].message);
        console.log('是否有content:', 'content' in response.choices[0].message);
        if ('content' in response.choices[0].message) {
          console.log('content:', response.choices[0].message.content);
        }
      }
    }
  }

  // 提取生成的内容
  let content = response.choices[0]?.message?.content || '';
  console.log('提取的content:', content);

  // 清洗数据：去掉Markdown代码块标记
  if (content.startsWith('```json')) {
    content = content.slice(7); // 去掉开头的 ```json
  } else if (content.startsWith('```')) {
    content = content.slice(3); // 去掉开头的 ```
  }
  if (content.endsWith('```')) {
    content = content.slice(0, -3); // 去掉结尾的 ```
  }
  // 去除首尾空白
  content = content.trim();
  console.log('清洗后的content:', content);

  return {
    code: 200,
    message: 'success',
    data: {
      content
    }
  };
}

export default defineEventHandler(async (event) => {
  console.log('收到generate-plan请求');
  try {
    const body = await readBody(event);
    console.log('请求体:', body);
    const { prompt, api_key } = body;

    if (!prompt || !api_key) {
      console.log('缺少必填字段');
      return {
        code: 400,
        message: '缺少必填字段: prompt, api_key',
        data: null
      };
    }

    // 调试打印（确认拿到的字符串是干净的）
    console.log('当前使用的 Key:', api_key);
    console.log('Key 长度:', api_key.length);

    // 生成缓存键
    const cacheKey = getCacheKey(prompt);
    console.log('生成的缓存键:', cacheKey);

    // 2. 调用模型生成输出
    const modelResponse = await callModelAPI(prompt, api_key);
    console.log('模型响应:', modelResponse);

    // 3. 将“输入→输出”存入缓存，设置过期时间（1小时）
    await setToCache(cacheKey, JSON.stringify(modelResponse), 3600);
    console.log('缓存已保存，过期时间：1小时');

    return modelResponse;
  } catch (error) {
    console.error('生成计划失败:', error);
    return {
      code: 500,
      message: '生成计划失败: ' + error.message,
      data: null
    };
  }
});
