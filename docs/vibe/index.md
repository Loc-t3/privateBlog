---
title: 创作
---

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vitepress'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  // 检查当前路由是否是 vibe 目录且不带.html
  if (route.path.startsWith('/vibe/') && !route.path.endsWith('.html') && !route.path.endsWith('/')) {
    // 自动重定向到带.html 的 URL
    router.go(route.path + '.html')
  }
  
  // 拦截链接点击
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a')
    if (!target) return
    
    const href = target.getAttribute('href')
    if (!href || !href.startsWith('/')) return
    
    if (href.startsWith('/vibe/') && !href.endsWith('.html') && !href.endsWith('/')) {
      e.preventDefault()
      router.go(href + '.html')
    }
  })
})
</script>

# 🎨 Vibe Coding 创作

这里记录我的 Vibe Coding 创意产出，包括网页作品、视频演示等。

## 网页作品

- [创意网页示例](/vibe/creator)

## 视频演示

- [B 站视频测试](/vibe/video-intro)

## 关于

这个分类展示了我的创意编程作品，包括：
- 交互式网页应用
- 创意视觉效果
- 原型演示
- 作品录制视频
