<template>
  <div>
    <div ref="textRef" class="leading-relaxed break-words">
      <span v-if="message.content === 'loading'" class="loading-box">
        <span />
        <span />
        <span />
      </span>
      <div v-else class="inline-block markdown-body" v-html="text" />
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

/* eslint-disable vue/no-v-html */
export default {
  props: {
    message: {
      type: Object,
      default: () => {}
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
    this.addCopyEvents()
  },
  destroyed() {
    this.removeCopyEvents()
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
      return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">${'Copy'}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
    },
    addCopyEvents() {
      const copyBtn = document.querySelectorAll('.code-block-header__copy')
      copyBtn.forEach((btn) => {
        btn.addEventListener('click', () => {
          const code = btn.parentElement?.nextElementSibling?.textContent
          if (code) {
            copy(code)
          }
        })
      })
    },
    removeCopyEvents() {
      if (this.$refs.textRef) {
        const copyBtn = this.$refs.textRef.querySelectorAll('.code-block-header__copy')
        copyBtn.forEach((btn) => {
          btn.removeEventListener('click', () => {})
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.markdown-body {
  font-size: 13px;
  &>>> p {
    margin-bottom: 0 !important;
  }
  background: inherit;
  &>>> pre {
    padding: 0 0 6px 0;
    .hljs.code-block-body {
      border-radius: 4px;
    }
  }
  &>>> .code-block-wrapper {
    background: #1F2329;
    padding: 2px 6px;
    margin: 5px 0;

    .code-block-body {
      padding: 5px 10px 0;
    };
    .code-block-header {
      margin-bottom: 4px;
      overflow: hidden;
      background: #353946;
      color: #c2d1e1;

      .code-block-header__copy {
        float: right;
        cursor: pointer;
        &:hover {
          color: #6e747b;
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
>>> .link-style {
  color: #487bf4;
  &:hover {
    color: #275ee3;
  }
}
.loading-box{
  margin-left: 6px;
}
.loading-box span{
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 5px;
  border-radius: 50%;
  vertical-align: middle;
  background: #676A6c;
  animation: load 1.2s ease infinite;
}
.loading-box span:last-child{
  margin-right: 0;
}
@keyframes load{
  0%{
    opacity: 1;
  }
  100%{
    opacity: 0;
  }
}
.loading-box span:nth-child(1){
  animation-delay: 0.23s;
}
.loading-box span:nth-child(2){
  animation-delay: 0.36s;
}
.loading-box span:nth-child(3){
  animation-delay: 0.49s;
}
</style>
