<template>
  <div>
    <div ref="textRef" class="leading-relaxed break-words">
      <span v-if="message.content === 'loading'" class="loading-box">
        <span />
        <span />
        <span />
      </span>
      <div v-else v-sanitize="text" class="inline-block markdown-body" />
    </div>
  </div>
</template>

<script>
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'
import mila from 'markdown-it-link-attributes'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import { copy } from '@/utils/common/index'

export default {
  props: {
    message: {
      type: Object,
      default: () => {
      }
    },
    isTerminal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      markdown: null
    }
  },
  computed: {
    text() {
      const value = this.message?.content || ''
      if (value && this.markdown) {
        return this.renderContentWithDetails(value)
      }
      return this.$xss.process(value)
    }
  },
  mounted() {
    this.init()
  },
  updated() {
    this.addEvents()
  },
  unmounted() {
    this.removeEvents()
  },
  methods: {
    init() {
      const vm = this
      this.markdown = new MarkdownIt({
        html: false,
        linkify: true,
        highlight(code, language) {
          const validLang = !!(language && hljs.getLanguage(language))
          if (validLang) {
            const lang = language || ''
            return vm.highlightBlock(hljs.highlight(lang, code, true).value, lang)
          }
          return vm.highlightBlock(hljs.highlightAuto(code).value, '')
        }
      })
      this.markdown.use(mila, { attrs: { target: '_blank', rel: 'noopener', class: 'link-style' } })
      this.markdown.use(mdKatex, { blockClass: 'katexmath-block rounded-md', errorColor: ' #cc0000' })
    },
    highlightBlock(str, lang) {
      let insertSpanHtml = `<span class="code-block-header__insert">${this.$t('Insert')}</span>`
      if (!this.isTerminal) {
        insertSpanHtml = ''
      }
      return `<pre class="code-block-wrapper">
        <div class="code-block-header">
        <span class="code-block-header__lang">${lang}</span>  
        <span class="code-block-header__actions">
        ${insertSpanHtml}
          <span class="code-block-header__copy">${this.$t('Copy')}</span>
        </span>
        </div>
        <code class="hljs code-block-body ${lang}">${str}</code></pre>`
    },
    addEvents() {
      this.addBtnClickEvents('.code-block-header__copy', this.handlerClickCopy)
      this.addBtnClickEvents('.code-block-header__insert', this.handlerClickInsert)
    },

    handlerClickCopy(event) {
      const wrapper = event.target.closest('.code-block-wrapper')
      if (wrapper) {
        // 查找里面的 code 元素
        const codeElement = wrapper.querySelector('code.code-block-body')
        if (codeElement) {
          const codeText = codeElement.textContent
          copy(codeText)
        }
      }
    },
    handlerClickInsert(event) {
      const wrapper = event.target.closest('.code-block-wrapper')
      if (wrapper) {
        // 查找里面的 code 元素
        const codeElement = wrapper.querySelector('code.code-block-body')
        if (codeElement) {
          const codeText = codeElement.textContent
          this.$emit('insert-code', codeText)
        }
      }
    },
    addBtnClickEvents(selector, callback) {
      const buttons = this.$refs.textRef.querySelectorAll(selector)
      buttons.forEach((btn) => {
        btn.addEventListener('click', callback)
      })
    },
    renderContentWithDetails(value) {
      // Kael responses may wrap reasoning/thinking in <details type="reasoning">; render them with a custom block.
      const detailRegex = /<details[^>]*>[\s\S]*?<\/details>/gi
      let result = ''
      let lastIndex = 0
      let match
      let hasDetails = false

      while ((match = detailRegex.exec(value))) {
        hasDetails = true
        const preceding = value.slice(lastIndex, match.index)
        if (preceding.trim()) {
          result += this.markdown.render(preceding)
        }
        result += this.renderDetailBlock(match[0])
        lastIndex = match.index + match[0].length
      }

      if (!hasDetails) {
        return this.markdown.render(value)
      }

      const remaining = value.slice(lastIndex)
      if (remaining.trim()) {
        result += this.markdown.render(remaining)
      }

      return result
    },
    renderDetailBlock(detailStr) {
      const attributes = this.extractAttributes(detailStr)
      const inner = detailStr.replace(/^<details[^>]*>/i, '').replace(/<\/details>$/i, '')
      const summaryMatch = inner.match(/<summary>([\s\S]*?)<\/summary>/i)
      const summary = summaryMatch ? this.decodeHtml(summaryMatch[1]) : ''
      const body = summaryMatch ? inner.replace(summaryMatch[0], '') : inner
      const bodyHtml = body.trim() ? this.markdown.render(this.decodeHtml(body.trim())) : ''

      const baseClass = 'kael-detail'
      if (attributes.type === 'reasoning') {
        const statusClass = attributes.done === 'true' ? 'is-done' : 'is-pending'
        const title = summary || this.$t('DeeplyThoughtAbout')
        return `<div class="${baseClass} ${baseClass}--reasoning ${statusClass}">
          <div class="${baseClass}__header">
            <span class="${baseClass}__status-dot"></span>
            <span class="${baseClass}__title">${title}</span>
          </div>
          ${bodyHtml ? `<div class="${baseClass}__body">${bodyHtml}</div>` : ''}
        </div>`
      }

      return `<div class="${baseClass}">
        ${summary ? `<div class="${baseClass}__header">${summary}</div>` : ''}
        ${bodyHtml ? `<div class="${baseClass}__body">${bodyHtml}</div>` : ''}
      </div>`
    },
    extractAttributes(detailStr) {
      const attrs = {}
      const attrMatch = detailStr.match(/^<details([^>]*)>/i)
      const attrStr = (attrMatch && attrMatch[1]) || ''
      attrStr.replace(/(\w+)="(.*?)"/g, (all, key, val) => {
        attrs[key] = val
        return all
      })
      return attrs
    },
    decodeHtml(str) {
      if (!str) return ''
      const textArea = document.createElement('textarea')
      textArea.innerHTML = str
      return textArea.value
    },
    removeBtnClickEvent(selector) {
      const buttons = this.$refs.textRef.querySelectorAll(selector)
      buttons.forEach((btn) => {
        btn.removeEventListener('click', () => {
        })
      })
    },
    removeEvents() {
      if (this.$refs.textRef) {
        this.removeBtnClickEvent('.code-block-header__copy')
        this.addBtnClickEvents('.code-block-header__insert')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.markdown-body {
  font-size: 13px;
  max-width: 300px;;

  &:deep(p) {
    margin-bottom: 0 !important;
  }

  background: inherit;

  &:deep(pre) {
    padding: 0 0 6px 0;

    .hljs.code-block-body {
      border-radius: 4px;
    }
  }

  &:deep(.code-block-wrapper) {
    background: #1F2329;
    padding: 0;
    margin: 5px 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .code-block-body {
      padding: 5px 10px;
    }

    .code-block-header {
      margin-bottom: 4px;
      overflow: hidden;
      background: #353946;
      color: #c2d1e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      width: 100%;
      box-sizing: border-box;

      .code-block-header__actions {
        display: flex;
        gap: 8px;

        .code-block-header__copy {
          cursor: pointer;

          &:hover {
            color: #6e747b;
          }
        }

        .code-block-header__insert {
          cursor: pointer;

          &:hover {
            color: #6e747b;
          }
        }
      }
    }

    .hljs.code-block-body.javascript {
      .hljs-comment {
        display: block;
      }
    }
  }
}

:deep(.link-style) {
  color: #487bf4;

  &:hover {
    color: #275ee3;
  }
}

.loading-box {
  margin-left: 6px;
}

.loading-box span {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 5px;
  border-radius: 50%;
  vertical-align: middle;
  background: #676A6c;
  animation: load 1.2s ease infinite;
}

.loading-box span:last-child {
  margin-right: 0;
}

@keyframes load {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.loading-box span:nth-child(1) {
  animation-delay: 0.23s;
}

.loading-box span:nth-child(2) {
  animation-delay: 0.36s;
}

.loading-box span:nth-child(3) {
  animation-delay: 0.49s;
}

.kael-detail {
  margin: 8px 0;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  background: #f7f8fa;

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #6b7280;
  }

  &__title {
    font-weight: 600;
  }

  &__status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10b981;
  }

  &__body {
    margin-top: 6px;
    padding-left: 8px;
    border-left: 2px solid #e5e5e5;
  }

  &--reasoning.is-pending {
    border-color: #f59e0b40;
    background: #fff8e6;

    .kael-detail__status-dot {
      background: #f59e0b;
      animation: kael-pulse 1.2s ease-in-out infinite;
    }
  }

  &--reasoning.is-done {
    border-color: #dbeafe;
    background: #f4f6ff;
  }
}

@keyframes kael-pulse {
  0% {
    opacity: 0.45;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.45;
  }
}
</style>
