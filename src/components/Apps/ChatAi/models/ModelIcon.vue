<template>
  <component
    :is="resolvedIcon"
    v-if="resolvedIcon"
    :class-name="className"
    :stroke-width="strokeWidth"
  />
</template>

<script>
import ChatGPTIcon from './ChatGPT.vue'
import DeepSeekIcon from './DeepSeek.vue'
import GrokIcon from './Grok.vue'
import ClaudeIcon from './Claude.vue'
import GeminiIcon from './Gemini.vue'

export default {
  name: 'ModelIcon',
  props: {
    name: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: 'size-5'
    },
    strokeWidth: {
      type: [String, Number],
      default: '1.5'
    }
  },
  computed: {
    normalizedName() {
      return (this.name || '').toLowerCase()
    },
    resolvedIcon() {
      const name = this.normalizedName
      if (!name) return null
      if (name.includes('gpt')) return ChatGPTIcon
      if (name.includes('deep-seek')) return DeepSeekIcon
      if (name.includes('grok')) return GrokIcon
      if (name.includes('claude')) return ClaudeIcon
      if (name.includes('gemini')) return GeminiIcon
      return null
    }
  }
}
</script>
