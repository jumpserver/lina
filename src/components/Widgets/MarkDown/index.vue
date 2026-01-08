<template>
  <div class="markdown-body">
    <el-row v-if="preview">
      <div class="action-bar">
        <div class="action">
          <span>
            <i class="fa" :class="[!isShow ? 'fa-eye' : 'fa-eye-slash']" @click="onView" />
          </span>
        </div>
      </div>
      <el-col :span="span" :style="{'height': height + 'px' }">
        <el-input
          v-model="iValue"
          autosize
          :rows="rows"
          type="textarea"
          @change="onChange"
        />
      </el-col>
      <el-col v-show="isShow" :span="span">
        <VueMarkdown class="result-html" :source="sanitizedValue" :html="false" :show="true" />
      </el-col>
    </el-row>
    <VueMarkdown v-else class="source" :html="false" :source="sanitizedValue" />
  </div>
</template>

<script>
import DOMPurify from 'dompurify'
import VueMarkdown from 'vue-markdown'

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
      this.resizeObserver = new ResizeObserver(entries => {
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
        ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'blockquote', 'a'],
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

<style lang='scss' scoped>
.markdown-body * {
  color: #1a1a1a;
  font-size: 13px;
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
  border: 1px solid #DCDFE6;
  @import "~github-markdown-css/github-markdown-light.css";
}

.action-bar {
  position: relative;
  height: 0;
  border-bottom: none;
  z-index: 999;

  .action {
    position: absolute;
    right: 6px;

    i {
      cursor: pointer;
    }
  }
}
</style>
