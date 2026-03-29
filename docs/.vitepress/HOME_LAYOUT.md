# 首页布局说明

## 布局结构

首页采用了现代化的卡片式布局，类似技术博客的风格，包含以下核心元素：

### 1. 顶部导航区
- **分类筛选器**：ALL / PRODUCT / TECH / OPERATION / GROWTH
- **搜索框**：右上角搜索入口

### 2. 文章卡片网格
- 响应式网格布局
- 每张卡片包含：
  - 分类标签（带颜色区分）
  - 文章标题
  - 文章摘要
  - 阅读时长
  - 发布日期

### 3. 文件结构

```
docs/
├── index.md                          # 首页（仅包含 Frontmatter）
└── .vitepress/
    └── theme/
        ├── components/
        │   ├── CustomHome.vue        # 首页卡片布局组件
        │   └── CustomLayout.vue      # 整体布局容器
        ├── custom.css                # 全局样式
        └── index.ts                  # 主题入口
```

## 核心组件

### CustomHome.vue
负责首页的卡片展示，包括：
- 分类筛选逻辑
- 文章数据展示
- 卡片样式和交互

### 自定义样式
- 采用粗边框设计（2px solid #000）
- 阴影效果（box-shadow: 8px 8px 0 #000）
- 悬停动画
- 分类标签颜色：
  - PRODUCT: 🟢 #00ff00
  - TECH: 🔵 #00ffff
  - OPERATION: 🟡 #ffff00
  - GROWTH: 🩷 #ff69b4

## 添加新文章

在 `CustomHome.vue` 中的 `articles` 数组添加新文章：

```typescript
const articles = ref([
  {
    id: 5,
    title: '文章标题',
    excerpt: '文章摘要...',
    category: 'PRODUCT', // 或 TECH / OPERATION / GROWTH
    date: 'MAR 28, 2026',
    readTime: '5 MIN READ',
    link: '/product/your-article'
  }
])
```

## 关于我页面

保持不变，仍保留简历展示功能：
- 支持切换不同简历版本
- 简历内容从 Markdown 文件动态加载
- 位于 `/about/` 路径

## 响应式设计

- 桌面端：3 列网格
- 平板端：2 列网格
- 移动端：1 列网格

断点：768px

## 注意事项

1. 首页的 `index.md` 只包含 Frontmatter，不包含实际内容
2. 实际内容在 `CustomHome.vue` 组件中渲染
3. 所有文章目前为静态数据，后续可改为动态加载
4. "关于我"页面未受影响，保持原有功能
