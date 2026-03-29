# Vibe 创作 - 使用指南

## 📁 文件放置位置

所有 Vibe Coding 创作相关的 HTML 文件都应该放在 **`docs/public/vibe/`** 目录下。

这些文件会被原样复制到构建输出目录，可以通过 URL 直接访问。

## 🔗 链接格式

**重要**：放在 `public` 目录的 HTML 文件**需要**在链接中包含 `.html` 后缀：

```markdown
<!-- 正确 ✅ -->
- [创意网页](/vibe/creator.html)
- [视频作品](/vibe/video-intro.html)
- [B 站测试](/vibe/test-bilibili.html)

<!-- 错误 ❌ -->
- [创意网页](/vibe/creator)
```

**原因**：
- `public/` 目录的文件是静态资源，VitePress 不会处理它们的路由
- 必须使用完整的文件名（包括 `.html` 后缀）才能访问

## 📝 添加新作品步骤

### 1. 创建 HTML 文件

在 `docs/public/vibe/` 目录下创建新的 HTML 文件，例如：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的作品</title>
</head>
<body>
  <!-- 你的创意内容 -->
</body>
</html>
```

### 2. 更新索引页面

编辑 `docs/vibe/index.md`，添加新作品的链接（**注意要带 .html**）：

```markdown
## 网页作品

- [我的新作品](/vibe/你的文件名.html)
```

### 3. 构建并测试

```bash
npm run docs:build
```

然后在浏览器中访问：`/vibe/你的文件名.html`

---

## 🎬 B 站视频嵌入

### 正确的 iframe 格式

```html
<iframe 
  src="https://player.bilibili.com/player.html?bvid=你的 BV 号&page=1&high_quality=1" 
  scrolling="no" 
  border="0" 
  frameborder="0" 
  framespacing="0" 
  allowfullscreen="true"
  sandbox="allow-same-origin allow-scripts allow-presentation allow-forms">
</iframe>
```

### 关键点

1. **使用 HTTPS**：`https://player.bilibili.com`
2. **一行内写完**：`src` 属性值不要换行
3. **添加 sandbox**：允许必要的权限
4. **使用 BV 号**：从视频 URL 中复制

### 获取 BV 号

1. 打开 B 站视频页面
2. 从 URL 中复制 `BV` 开头的字符串
   - 例如：`https://www.bilibili.com/video/BV1abc123DEF`
   - BV 号：`BV1abc123DEF`

---

## 🧪 测试页面

已经创建的测试页面（都在 `public/vibe/` 目录）：

| 页面 | 访问地址 | 说明 |
|------|----------|------|
| 简单测试 | `/vibe/simple-test.html` | 最简化的 B 站视频测试 |
| 详细测试 | `/vibe/test-bilibili.html` | 包含故障排查说明 |
| 视频模板 | `/vibe/video-intro.html` | 视频作品展示模板 |
| 创意网页 | `/vibe/creator.html` | 网页作品示例 |

---

## ❓ 常见问题

### Q: 点击链接显示 404？

A: 确保：
1. HTML 文件放在 `docs/public/vibe/` 目录
2. 链接中**必须带 `.html` 后缀**
3. 已经重新构建：`npm run docs:build`

### Q: 为什么要带 .html 后缀？

A: 
- `public/` 目录的文件是静态资源，VitePress 不会处理它们的路由
- 必须使用完整的文件名才能访问
- 这与 `cleanUrls` 配置无关

### Q: B 站视频无法播放？

A: 参考 `/vibe/test-bilibili.html` 页面的故障排查说明。

### Q: 如何删除某个作品？

A: 
1. 删除 `docs/public/vibe/` 目录下对应的 HTML 文件
2. 在 `docs/vibe/index.md` 中删除相关链接
3. 重新构建并推送到 GitHub

---

## 📦 目录结构

```
docs/
├── vibe/
│   ├── index.md              # 创作分类首页（Markdown 文件）
│   └── README.md             # 使用指南
└── public/
    └── vibe/                 # HTML 文件放在这里
        ├── creator.html      # 网页作品示例
        ├── video-intro.html  # 视频作品模板
        ├── test-bilibili.html # B 站视频测试
        └── simple-test.html  # 简单测试页面
```

**重要**：
- ✅ HTML 文件放在 `docs/public/vibe/`
- ✅ Markdown 文件（index.md）放在 `docs/vibe/`
- ✅ 链接中必须包含 `.html` 后缀

---

## 🚀 部署

推送到 GitHub 后，GitHub Actions 会自动构建并部署。

访问地址：`https://你的用户名.github.io/仓库名/vibe/你的作品.html`

**注意**：部署后链接仍然需要 `.html` 后缀！
