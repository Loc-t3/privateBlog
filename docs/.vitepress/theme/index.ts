import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import CustomLayout from './components/CustomLayout.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(CustomLayout)
  }
} satisfies Theme
