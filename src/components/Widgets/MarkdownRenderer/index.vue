<template>
  <div
    v-if="show"
    ref="root"
    class="markdown-renderer"
    v-html="renderedHtml"
    @click="handleClick"
  />
</template>

<script>
import 'highlight.js/styles/atom-one-light.css'
import { renderMarkdown } from '@/utils/markdown'
import { copy } from '@/utils/common/index'

let rendererId = 0

export default {
  name: 'MarkdownRenderer',
  emits: ['headings-change'],
  props: {
    source: {
      type: String,
      default: ''
    },
    html: {
      type: Boolean,
      default: false
    },
    show: {
      type: Boolean,
      default: true
    },
    copyableCode: {
      type: Boolean,
      default: false
    },
    collectHeadings: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      headingPrefix: `markdown-${++rendererId}`
    }
  },
  computed: {
    renderedHtml() {
      return renderMarkdown(this.source, { html: this.html })
    }
  },
  watch: {
    renderedHtml() {
      this.decorateContent()
    },
    '$i18n.locale'() {
      this.decorateContent()
    }
  },
  mounted() {
    this.decorateContent()
  },
  methods: {
    decorateContent() {
      this.$nextTick(() => {
        const root = this.$refs.root
        if (!root) return

        if (this.collectHeadings) {
          const headings = [...root.querySelectorAll('h2, h3')].map((heading, index) => {
            const item = {
              id: `${this.headingPrefix}-heading-${index + 1}`,
              text: heading.textContent.trim(),
              level: Number(heading.tagName.slice(1))
            }
            heading.id = item.id
            return item
          })
          this.$emit('headings-change', headings)
        }

        if (this.copyableCode) {
          root.querySelectorAll('pre').forEach((pre) => this.decorateCodeBlock(pre))
        }
      })
    },
    decorateCodeBlock(pre) {
      if (pre.parentElement?.classList.contains('markdown-code-block')) {
        const button = pre.parentElement.querySelector('.markdown-code-block__copy')
        button.textContent = this.$t('Copy')
        button.setAttribute('aria-label', this.$t('Copy'))
        return
      }

      const wrapper = document.createElement('div')
      const header = document.createElement('div')
      const language = document.createElement('span')
      const button = document.createElement('button')

      wrapper.className = 'markdown-code-block'
      header.className = 'markdown-code-block__header'
      language.textContent = pre.dataset.language || 'text'
      button.className = 'markdown-code-block__copy'
      button.type = 'button'
      button.textContent = this.$t('Copy')
      button.setAttribute('aria-label', this.$t('Copy'))

      pre.before(wrapper)
      header.append(language, button)
      wrapper.append(header, pre)
    },
    handleClick(event) {
      const button = event.target.closest('.markdown-code-block__copy')
      if (!button) return
      const code = button.closest('.markdown-code-block')?.querySelector('code')?.textContent
      if (code) copy(code)
    }
  }
}
</script>

<style lang="scss" scoped>
.markdown-renderer {
  min-width: 0;
}

.markdown-renderer :deep(.markdown-code-block) {
  margin: 16px 0;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-light);
}

.markdown-renderer :deep(.markdown-code-block__header) {
  display: flex;
  min-height: 36px;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  color: var(--color-text-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.markdown-renderer :deep(.markdown-code-block__copy) {
  min-width: 44px;
  min-height: 28px;
  padding: 4px 8px;
  border: 0;
  border-radius: 4px;
  color: var(--el-color-primary);
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.markdown-renderer :deep(.markdown-code-block__copy:hover) {
  background: var(--el-color-primary-light-9);
}

.markdown-renderer :deep(.markdown-code-block__copy:focus-visible) {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}

.markdown-renderer :deep(.markdown-code-block pre) {
  max-width: 100%;
  margin: 0;
  overflow-x: auto;
  border: 0;
  border-radius: 0;
}
</style>
