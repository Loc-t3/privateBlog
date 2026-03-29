# mounc的个人主页

基于 VitePress 构建的个人博客，记录产品、技术、运营与成长。

## 项目结构

```
privateBlog/
├── docs/                      # 文档目录
│   ├── index.md               # 首页
│   ├── product/               # 产品分类
│   │   ├── index.md           # 分类首页
│   │   └── *.md               # 文章文件
│   ├── tech/                  # 技术分类
│   ├── operation/             # 运营分类
│   ├── growth/                # 成长分类
│   ├── about/                 # 关于我
│   ├── public/                # 静态资源
│   │   ├── logo.svg           # 网站Logo
│   │   └── resume/            # 简历文件
│   │       ├── default.md     # 默认简历
│   │       └── full.md        # 完整简历
│   └── .vitepress/
│       ├── config.ts          # VitePress配置
│       └── theme/             # 主题定制
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions部署配置
├── package.json
└── .gitignore
```

## 配置说明

### 导航栏配置

在 `docs/.vitepress/config.ts` 中修改 `NAV_CONFIG` 数组来配置导航栏：

```typescript
export const NAV_CONFIG = [
  { text: '首页', link: '/', icon: '🏠' },
  { text: '产品', link: '/product/', icon: '📦', description: '产品思考与设计' },
  { text: '技术', link: '/tech/', icon: '💻', description: '技术探索与实践' },
  { text: '运营', link: '/operation/', icon: '📊', description: '运营策略与增长' },
  { text: '成长', link: '/growth/', icon: '🌱', description: '个人成长与反思' },
  { text: '关于我', link: '/about/', icon: '👤', description: '了解更多关于我' }
]
```

### 添加新分类

1. 在 `docs/` 目录下创建新文件夹，如 `docs/new-category/`
2. 在文件夹中创建 `index.md` 作为分类首页
3. 在 `config.ts` 的 `NAV_CONFIG` 中添加导航项
4. 在 `sidebar` 配置中添加侧边栏配置

### 简历管理

简历文件存放在 `docs/public/resume/` 目录下：

- `default.md` - 默认简历
- `full.md` - 完整简历

可以在 `CustomLayout.vue` 中的 `resumeFiles` 数组添加更多简历版本。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run docs:dev

# 构建生产版本
npm run docs:build

# 预览生产版本
npm run docs:preview
```

## 部署到 GitHub Pages

### 首次部署

1. 在 GitHub 创建仓库
2. 推送代码到 main 分支
3. 在仓库设置中启用 GitHub Pages：
   - 进入 Settings > Pages
   - Source 选择 "GitHub Actions"
4. GitHub Actions 会自动构建和部署

### 自动部署

每次推送到 `main` 分支，GitHub Actions 会自动：
1. 构建项目
2. 部署到 GitHub Pages

## 写作指南

### 创建新文章

1. 在对应分类文件夹下创建 `.md` 文件
2. 在文件开头添加 Frontmatter：

```markdown
---
title: 文章标题
date: 2024-01-15
tags: [标签1, 标签2]
---

# 文章标题

文章内容...
```

### Markdown 语法

支持标准 Markdown 语法，包括：
- 标题、段落、列表
- 代码块、引用
- 表格、链接、图片
- 自定义容器

## 技术栈

- [VitePress](https://vitepress.dev/) - 静态站点生成器
- [Vue 3](https://vuejs.org/) - 前端框架
- [markdown-it](https://github.com/markdown-it/markdown-it) - Markdown 解析器
- GitHub Actions - CI/CD
- GitHub Pages - 静态托管
