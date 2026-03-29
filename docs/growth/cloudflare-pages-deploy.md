---
title: 使用 Cloudflare Pages 部署静态网站
date: 2025-03-30
tags: [部署, Cloudflare, 前端]
---

# 使用 Cloudflare Pages 部署静态网站

## 为什么选择 Cloudflare Pages

### 与 Vercel 对比

| 特性 | Cloudflare Pages | Vercel |
|------|-----------------|--------|
| 国内访问 | ✅ 速度快，可直接访问 | ❌ 需要VPN |
| 免费额度 | 无限制 | 100GB/月 |
| 构建时间 | 无限制 | 6000分钟/月 |
| 自定义域名 | ✅ 免费 | ✅ 免费 |
| HTTPS | ✅ 自动 | ✅ 自动 |
| 全球CDN | ✅ 300+节点 | ✅ 100+节点 |
| 私有仓库 | ✅ 免费 | ✅ 免费 |

**核心问题**：Vercel 在国内访问受限，需要 VPN 才能访问部署的网站。而 Cloudflare Pages 在国内可以直接访问，速度也很快。

## 部署步骤

### 1. 准备工作

- GitHub 账号
- Cloudflare 账号（可使用 GitHub 登录）
- 已推送代码的 GitHub 仓库

### 2. 创建 Cloudflare Pages 项目

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左侧菜单选择 **Workers & Pages**
3. 点击 **Create application**
4. 选择 **Pages** 标签
5. 点击 **Connect to Git**
6. 选择你的 GitHub 仓库

### 3. 配置构建设置

| 配置项 | 值 |
|--------|-----|
| Project name | 你的项目名称 |
| Production branch | `production` 或 `main` |
| Build command | `npm run docs:build` |
| Build output directory | `docs/.vitepress/dist` |

### 4. 开始部署

点击 **Save and Deploy**，等待构建完成。

## 常见框架配置

### VitePress

```bash
Build command: npm run docs:build
Build output: docs/.vitepress/dist
```

### VuePress

```bash
Build command: npm run build
Build output: docs/.vuepress/dist
```

### Next.js (静态导出)

```bash
Build command: npm run build
Build output: out
```

### Nuxt.js

```bash
Build command: npm run generate
Build output: dist
```

### React (Vite)

```bash
Build command: npm run build
Build output: dist
```

## 自动部署

配置完成后，每次推送到生产分支，Cloudflare 会自动：

1. 拉取最新代码
2. 运行构建命令
3. 部署到全球 CDN

## 自定义域名

### 1. 添加域名

在项目设置中：

1. 进入 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（如 `blog.example.com`）

### 2. 配置 DNS

在域名服务商处添加 CNAME 记录：

| 类型 | 名称 | 值 |
|------|------|-----|
| CNAME | blog | `<项目名>.pages.dev` |

### 3. 等待生效

DNS 生效后，Cloudflare 会自动配置 HTTPS 证书。

## 环境变量

在项目设置中可以添加环境变量：

1. 进入 **Settings** → **Environment variables**
2. 添加变量（如 `API_KEY`）
3. 在代码中通过 `import.meta.env.API_KEY` 访问

## 预览部署

每个 Pull Request 都会生成预览链接：

```
https://<commit-hash>.<项目名>.pages.dev
```

方便在合并前预览效果。

## 常见问题

### Q: 构建失败怎么办？

查看构建日志，常见原因：

- 依赖安装失败：检查 `package.json`
- 构建命令错误：确认命令正确
- 输出目录不存在：检查路径是否正确

### Q: 页面 404 怎么办？

- 检查输出目录是否正确
- 确认构建成功生成了 `index.html`

### Q: 样式加载失败？

- 检查 `base` 配置是否正确
- VitePress 中设置 `base: '/'`

## 总结

Cloudflare Pages 是国内用户部署静态网站的最佳选择：

- ✅ 国内可直接访问
- ✅ 免费且无限制
- ✅ 配置简单
- ✅ 自动部署
- ✅ 全球 CDN 加速

如果你的项目需要在国内被访问，强烈推荐使用 Cloudflare Pages 替代 Vercel。
