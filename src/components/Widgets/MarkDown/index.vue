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
        <VueMarkdown class="result-html" :source="iValue" :show="true" :html="false" />
      </el-col>
    </el-row>
    <VueMarkdown v-else class="source" :source="iValue" :html="false" />
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import 'github-markdown-css/github-markdown-light.css'

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
      iValue: this.value
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.resizeObserver = new ResizeObserver(entries => {
        // 监听高度变化
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
  beforeDestroy() {
    const el = document.querySelector('.result-html')
    if (el) {
      this.resizeObserver.unobserve(el)
    }
    this.resizeObserver = null
  },
  methods: {
    onChange() {
      this.$emit('change', this.iValue)
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

>>> .el-textarea {
  height: 100% !important;
  .el-textarea__inner {
    min-height: 210px !important;
    height: 100% !important;
  }
}
.source {
  padding: 6px;
}
.result-html {
  min-height: 210px;
  margin-left: 4px;
  padding: 5px 10px;
  border: 1px solid #DCDFE6;
}
.action-bar {
  position: relative;
  height: 30px;
  line-height: 30px;
  border: 1px solid #dcdfe6;
  border-bottom: none;
  .action {
    position: absolute;
    right: 6px;
    i {
      cursor: pointer;
    }
  }
}
</style>
