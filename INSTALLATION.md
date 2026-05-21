# 健身挑战管理系统 - 安装配置说明

## 项目概述

这是一个基于 **Nuxt 3 + Vue 3** 构建的健身挑战管理系统，包含以下核心功能：
- 动作库管理（集成 ExerciseDB API）
- 挑战系统（打卡、进度追踪、勋章奖励）
- AI 健身计划生成（集成 DeepSeek API）
- 营养饮食管理

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | Nuxt | 3.x |
| 前端 | Vue | 3.x |
| 构建工具 | Vite | 6.x |
| 组件库 | Element Plus | 2.x |
| 数据库 | PostgreSQL | 16.x (Neon) |
| 认证 | JWT | - |

## 安装步骤

### 1. 环境要求

- Node.js >= 20.0.0
- npm >= 10.0.0 或 yarn >= 4.0.0

### 2. 克隆项目

```bash
git clone <repository-url>
cd gymtext
```

### 3. 安装依赖

使用 npm：
```bash
npm install
```

或使用 yarn：
```bash
yarn install
```

### 4. 配置环境变量

创建 `.env` 文件（或复制 `.env.example`）：

```env
# 数据库配置 (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@hostname:5432/database"

# JWT 密钥
JWT_SECRET="your-jwt-secret-key-here"

# ExerciseDB API Key (用于获取动作数据)
RAPID_API_KEY="your-rapidapi-key-here"

# 服务端口 (可选，默认 3000)
PORT=3000
```

#### 4.1 数据库配置说明

本项目使用 **Neon PostgreSQL** 作为数据库，配置步骤：

1. 访问 [Neon Console](https://console.neon.tech/)
2. 创建新项目
3. 创建数据库（如 `gym_db`）
4. 获取连接字符串，格式如下：
   ```
   postgresql://<username>:<password>@<hostname>.neon.tech:5432/<database_name>?sslmode=require
   ```

#### 4.2 API Key 获取

**RapidAPI Key（动作库数据）**：
1. 访问 [RapidAPI](https://rapidapi.com/)
2. 搜索 "ExerciseDB"
3. 订阅免费计划
4. 获取 API Key

**DeepSeek API Key（AI 计划生成）**：
1. 访问 [DeepSeek Console](https://platform.deepseek.com/)
2. 注册账号并创建 API Key
3. 用户需在前端页面手动配置此 Key

### 5. 数据库初始化

项目启动时会自动创建必要的数据库表结构。首次启动前建议执行：

```bash
# 同步动作数据（可选）
curl http://localhost:3000/api/sync_exercises

# 或直接启动项目，系统会自动初始化
```

### 6. 启动开发服务器

```bash
npm run dev
```

或使用 yarn：
```bash
yarn dev
```

访问地址：`http://localhost:3000`

### 7. 构建生产版本

```bash
npm run build
```

启动生产服务器：
```bash
npm run start
```

## 目录结构

```
gymtext/
├── app/                      # 前端应用目录
│   ├── pages/               # 页面组件
│   │   ├── action.vue       # 动作库页面
│   │   ├── challenge/       # 挑战相关页面
│   │   │   ├── [id].vue     # 挑战详情页
│   │   │   └── index.vue    # 挑战列表页
│   │   ├── jihua.vue        # AI 计划生成页面
│   │   ├── login/           # 登录页面
│   │   └── yingyang.vue     # 营养管理页面
│   └── api/                 # 前端 API 调用封装
├── server/                  # 后端 API 目录
│   ├── api/                 # Nitro 服务器路由
│   │   ├── challenge/       # 挑战相关 API
│   │   ├── checkin/         # 打卡相关 API
│   │   └── sync_exercises.get.js  # 动作数据同步
│   └── middleware/          # 中间件
├── public/                  # 静态资源
├── .env                     # 环境变量
├── nuxt.config.ts           # Nuxt 配置
└── package.json             # 项目依赖
```

## 核心功能说明

### 1. 动作库管理
- 从 ExerciseDB API 同步健身动作数据
- 支持动作分类、搜索和详情展示
- GIF 动图展示动作示范

### 2. 挑战系统
- 创建和参与挑战
- 每日打卡功能
- 进度追踪和勋章奖励
- 全站统计和个人进度展示

### 3. AI 健身计划生成
- 使用 DeepSeek API 生成个性化计划
- 支持自定义训练参数（体重、体脂率、训练频率等）
- 生成 7 天详细训练计划

### 4. 营养饮食管理
- 饮食记录和追踪
- 营养成分分析
- AI 生成饮食计划

## API 接口列表

### 挑战相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/challenge/:id` | GET | 获取挑战详情 |
| `/api/challenge/check` | GET | 检查挑战状态和统计 |
| `/api/check-user-challenge` | GET | 检查用户参与状态 |
| `/api/checkin/create` | POST | 创建打卡记录 |
| `/api/user-achievements` | GET | 获取用户成就 |

### 动作库相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/sync_exercises` | GET | 同步动作数据 |

### 认证相关

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/login` | POST | 用户登录 |
| `/api/register` | POST | 用户注册 |
| `/api/sendCode` | POST | 发送验证码 |

## 常见问题

### Q1: 启动时提示数据库连接失败

确保 `.env` 文件中的 `DATABASE_URL` 正确配置，且 Neon 数据库服务正常运行。

### Q2: 动作库页面显示空白

检查 `RAPID_API_KEY` 是否正确配置，并确保网络可以访问 RapidAPI。

### Q3: AI 计划生成失败

确保用户已在前端页面配置了 DeepSeek API Key，且 Key 有效。

### Q4: 打卡时报错 "用户未参与该挑战"

需要先在挑战详情页点击"参与挑战"按钮，才能进行打卡。

## 技术支持

如有问题，请检查以下日志：
- 开发服务器日志：终端输出
- 前端控制台：浏览器开发者工具
- 数据库连接：Neon Console

---

**文档版本**: 1.0  
**最后更新**: 2026-05  
**项目状态**: 开发中
