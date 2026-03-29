<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import MarkdownIt from 'markdown-it'
import CustomHome from './CustomHome.vue'

const { Layout } = DefaultTheme
const { frontmatter, page } = useData()

const showResume = ref(false)
const resumeContent = ref('')
const md = new MarkdownIt({ html: true })

const resumeFiles = [
  { id: 'default', name: '默认简历', path: '/resume/default.md' },
  { id: 'full', name: '完整简历', path: '/resume/full.md' }
]

const currentResume = ref('default')

const isAboutPage = computed(() => {
  return page.value.relativePath === 'about/index.md'
})

const isHomePage = computed(() => {
  return frontmatter.value.layout === 'home'
})

async function toggleResume() {
  showResume.value = !showResume.value
  if (showResume.value) {
    await loadResume(currentResume.value)
  }
}

async function loadResume(resumeId: string) {
  currentResume.value = resumeId
  const resume = resumeFiles.find(r => r.id === resumeId)
  if (resume) {
    try {
      const response = await fetch(resume.path)
      if (response.ok) {
        const text = await response.text()
        resumeContent.value = md.render(text)
      }
    } catch (e) {
      console.error('Failed to load resume:', e)
    }
  }
}

onMounted(async () => {
  if (isAboutPage.value) {
    await loadResume(currentResume.value)
  }
  if (showResume.value && isHomePage.value) {
    await loadResume(currentResume.value)
  }
})
</script>

<template>
  <div class="home-wrapper" v-if="isHomePage">
    <CustomHome />
  </div>
  <Layout v-else>
    <template #doc-after>
      <div class="about-resume-section" v-if="isAboutPage">
        <div class="resume-cards-container">
          <h3 class="section-title">📋 我的简历</h3>
          
          <div class="resume-tabs">
            <button 
              v-for="resume in resumeFiles" 
              :key="resume.id"
              class="resume-tab"
              :class="{ active: currentResume === resume.id }"
              @click="loadResume(resume.id)"
            >
              <span class="tab-icon">{{ resume.id === 'default' ? '📄' : '📑' }}</span>
              {{ resume.name }}
            </button>
          </div>
          
          <div class="resume-card-wrapper">
            <div class="resume-card about-resume-card">
              <div class="resume-body" v-html="resumeContent"></div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>

<style>
.home-wrapper {
  min-height: 100vh;
}
</style>

<style scoped>
.resume-toggle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.resume-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resume-toggle-btn:hover {
  background: var(--vp-c-brand-1);
  color: white;
}

.resume-toggle-btn.active {
  background: var(--vp-c-brand-1);
  color: white;
}

.btn-icon {
  font-size: 1.2rem;
}

.resume-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.selector-label {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.resume-option {
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resume-option:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.resume-option.selected {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.resume-content {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

.resume-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

.resume-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.resume-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--vp-c-text-1);
}

.resume-body {
  padding: 1.5rem;
  line-height: 1.8;
  color: var(--vp-c-text-1);
}

.resume-body :deep(h1),
.resume-body :deep(h2),
.resume-body :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--vp-c-text-1);
}

.resume-body :deep(h1) { font-size: 1.5rem; }
.resume-body :deep(h2) { font-size: 1.25rem; }
.resume-body :deep(h3) { font-size: 1.1rem; }

.resume-body :deep(ul),
.resume-body :deep(ol) {
  padding-left: 1.5rem;
}

.resume-body :deep(li) {
  margin: 0.5rem 0;
}

.resume-body :deep(p) {
  margin: 1rem 0;
}

.resume-body :deep(strong) {
  color: var(--vp-c-brand-1);
}

.resume-body :deep(a) {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.resume-body :deep(a:hover) {
  text-decoration: underline;
}

.resume-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--vp-c-divider);
  margin: 1.5rem 0;
}

.resume-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.resume-body :deep(th),
.resume-body :deep(td) {
  border: 1px solid var(--vp-c-divider);
  padding: 0.75rem;
  text-align: left;
}

.resume-body :deep(th) {
  background: var(--vp-c-bg);
  font-weight: 600;
}

.about-resume-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.resume-cards-container {
  max-width: 900px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 1.5rem;
  color: var(--vp-c-text-1);
  margin-bottom: 1.5rem;
}

.resume-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.resume-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  background: var(--vp-c-bg-soft);
  border: 2px solid var(--vp-c-divider);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resume-tab:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.resume-tab.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: white;
}

.tab-icon {
  font-size: 1.1rem;
}

.resume-card-wrapper {
  padding: 0 1rem;
}

.about-resume-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.about-resume-card:hover {
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.15);
  border-color: var(--vp-c-brand-1);
}
</style>
