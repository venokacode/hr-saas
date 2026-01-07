# HR SaaS

一个基于 Next.js 和 Supabase 构建的人力资源管理系统。

## 技术栈

- **前端框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **数据库**: Supabase
- **包管理器**: pnpm

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env.local` 并填入你的 Supabase 配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 运行开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
hr-saas/
├── app/                 # Next.js App Router 页面
├── lib/                 # 工具函数和配置
│   └── supabase.ts     # Supabase 客户端配置
├── components/          # React 组件
├── public/             # 静态资源
└── .env.local          # 环境变量（不提交到 Git）
```

## Supabase 配置

项目已经配置好 Supabase 客户端，可以在任何组件中导入使用：

```typescript
import { supabase } from '@/lib/supabase'

// 示例：查询数据
const { data, error } = await supabase
  .from('your_table')
  .select('*')
```

## 开发指南

- 使用 TypeScript 进行类型安全开发
- 使用 Tailwind CSS 进行样式开发
- 遵循 Next.js App Router 最佳实践
- 使用 ESLint 保持代码质量

## 部署

推荐使用 [Vercel](https://vercel.com) 进行部署，它是 Next.js 的官方托管平台。

记得在部署平台配置环境变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 了解更多

关于 Next.js 的更多信息：

- [Next.js 文档](https://nextjs.org/docs) - 学习 Next.js 的特性和 API
- [学习 Next.js](https://nextjs.org/learn) - 交互式 Next.js 教程

## 许可证

MIT
