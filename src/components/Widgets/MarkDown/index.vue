<template>
  <div class="markdown-body">
    <el-row v-if="preview">
      <div class="action-bar">
        <button class="preview-toggle" type="button" :title="$t('View')" @click="onView">
          <i class="fa" :class="[!isShow ? 'fa-eye' : 'fa-eye-slash']" />
        </button>
      </div>
      <el-col :span="span" :style="{ height: height + 'px' }">
        <el-input v-model="iValue" autosize :rows="rows" type="textarea" @change="onChange" />
      </el-col>
      <el-col v-show="isShow" :span="span">
        <VueMarkdown class="result-html" :source="sanitizedValue" :html="false" :show="true" />
      </el-col>
    </el-row>
    <VueMarkdown v-else class="source" :html="html" :source="sanitizedValue" />
  </div>
</template>

<script>
import DOMPurify from 'dompurify'
import VueMarkdown from '@/components/Widgets/VueMarkdown/index.vue'

export default {
  components: {
    VueMarkdown
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    preview: {
      type: Boolean,
      default: false
    },
    html: {
      type: Boolean,
      default: false
    },
    rows: {
      type: Number,
      default: 4
    }
  },
  data() {
    return {
      height: 0,
      resizeObserver: null,
      span: 12,
      isShow: true,
      iValue: this.sanitizeContent(this.value)
    }
  },
  computed: {
    sanitizedValue() {
      const content = this.iValue.replace(/\\/g, '\\\\').replace(/\$/g, '\\$')

      return this.sanitizeContent(content)
    }
  },
  watch: {
    value(newVal) {
      this.iValue = this.sanitizeContent(newVal)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.resizeObserver = new ResizeObserver((entries) => {
        const height = entries[0].target.offsetHeight
        if (height) {
          this.height = height
        }
      })
      const el = document.querySelector('.result-html')
      if (el) {
        this.resizeObserver.observe(el)
      }
    })
  },
  beforeUnmount() {
    const el = document.querySelector('.result-html')
    if (el) {
      this.resizeObserver.unobserve(el)
    }
    this.resizeObserver = null
  },
  methods: {
    sanitizeContent(content) {
      if (!content) return ''

      return DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          'p',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'ul',
          'ol',
          'li',
          'strong',
          'em',
          'code',
          'pre',
          'blockquote',
          'a'
        ],
        ADD_ATTR: ['target'],
        FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
      })
    },
    onChange() {
      const sanitizedValue = this.sanitizeContent(this.iValue)
      this.iValue = sanitizedValue
      this.$emit('change', sanitizedValue)
    },
    onView() {
      this.isShow = !this.isShow
      if (this.isShow) {
        this.span = 12
      } else {
        this.span = 24
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.markdown-body {
  width: 100%;
}

.markdown-body * {
  color: #1a1a1a;
  font-size: 13px;
}

.markdown-body :deep(.el-row) {
  position: relative;
  width: 100%;
}

:deep(.el-textarea) {
  height: 100% !important;

  .el-textarea__inner {
    min-height: 210px !important;
    height: 100% !important;
  }
}

.source {
  padding: 6px;
}

:deep(.result-html) {
  min-height: 210px;
  margin-left: 4px;
  padding: 5px 10px;
  border: 1px solid #dcdfe6;
  @import '~github-markdown-css/github-markdown-light.css';
}

.action-bar {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;

  .preview-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    color: #606266;
    cursor: pointer;
    background: rgb(255 255 255 / 90%);
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    &:hover {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary-light-5);
    }

    &:focus-visible {
      outline: 2px solid var(--el-color-primary-light-5);
      outline-offset: 1px;
    }
  }
}
</style>
