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
import { copy } from '@/utils/common'

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
        return this.markdown?.render(value)
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
  destroyed() {
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
      this.markdown.use(mila, { attrs: { target: '_blank', rel: 'noopener', class: 'link-style' }})
      this.markdown.use(mdKatex, { blockClass: 'katexmath-block rounded-md', errorColor: ' #cc0000' })
    },
    highlightBlock(str, lang) {
      let insertSpanHmtl = `<span class="code-block-header__insert">${this.$t('insert')}</span>`
      if (!this.isTerminal) {
        insertSpanHmtl = ''
      }
      return `<pre class="code-block-wrapper">
        <div class="code-block-header">
        <span class="code-block-header__lang">${lang}</span>  
        <span class="code-block-header__actions">
        ${insertSpanHmtl}
          <span class="code-block-header__copy">${'Copy'}</span>
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

  &::v-deep p {
    margin-bottom: 0 !important;
  }

  background: inherit;

  &::v-deep pre {
    padding: 0 0 6px 0;

    .hljs.code-block-body {
      border-radius: 4px;
    }
  }

  &::v-deep .code-block-wrapper {
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

::v-deep .link-style {
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
</style>
