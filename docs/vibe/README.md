# Vibe 创作 - 使用指南

## 📁 文件放置位置

所有 Vibe Coding 创作相关的 HTML 文件都应该放在 **`docs/vibe/`** 目录下（不是 `docs/public/vibe/`）。

## 🔗 链接格式

由于配置了 `cleanUrls: true`，链接中**不需要** `.html` 后缀：

```markdown
<!-- 正确 ✅ -->
- [创意网页](/vibe/creator)
- [视频作品](/vibe/video-intro)
- [B 站测试](/vibe/test-bilibili)

<!-- 错误 ❌ -->
- [创意网页](/vibe/creator.html)
```

## 📝 添加新作品步骤

### 1. 创建 HTML 文件

在 `docs/vibe/` 目录下创建新的 HTML 文件，例如：

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

编辑 `docs/vibe/index.md`，添加新作品的链接：

```markdown
## 网页作品

- [我的新作品](/vibe/你的文件名)
```

### 3. 构建并测试

```bash
npm run docs:build
```

然后在浏览器中访问：`/vibe/你的文件名`

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

已经创建的测试页面：

| 页面 | 访问地址 | 说明 |
|------|----------|------|
| 简单测试 | `/vibe/simple-test` | 最简化的 B 站视频测试 |
| 详细测试 | `/vibe/test-bilibili` | 包含故障排查说明 |
| 视频模板 | `/vibe/video-intro` | 视频作品展示模板 |

---

## ❓ 常见问题

### Q: 点击链接显示 404？

A: 确保：
1. HTML 文件放在 `docs/vibe/` 目录
2. 链接中不带 `.html` 后缀
3. 已经重新构建：`npm run docs:build`

### Q: B 站视频无法播放？

A: 参考 `/vibe/test-bilibili` 页面的故障排查说明。

### Q: 如何删除某个作品？

A: 
1. 删除 `docs/vibe/` 目录下对应的 HTML 文件
2. 在 `docs/vibe/index.md` 中删除相关链接
3. 重新构建并推送到 GitHub

---

## 📦 目录结构

```
docs/
├── vibe/
│   ├── index.md              # 创作分类首页
│   ├── GUIDE.md              # 使用指南
│   ├── creator.html          # 网页作品示例
│   ├── video-intro.html      # 视频作品模板
│   ├── test-bilibili.html    # B 站视频测试
│   └── simple-test.html      # 简单测试页面
└── public/
    └── vibe/                 # 不需要这个目录！
```

**重要**：HTML 文件应该放在 `docs/vibe/`，不是 `docs/public/vibe/`！

---

## 🚀 部署

推送到 GitHub 后，GitHub Actions 会自动构建并部署。

访问地址：`https://你的用户名.github.io/仓库名/vibe/你的作品`
