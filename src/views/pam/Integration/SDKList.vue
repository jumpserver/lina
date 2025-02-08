<template>
  <div>
    <IBox class="radio-box">
      <div class="code-container">
        <el-tabs v-model="currentLanguage" @tab-click="handleInput">
          <el-tab-pane v-for="language in languages" :key="language.value" :label="language.label" :name="language.value">
            <template>
              <vue-markdown v-if="readme" :source="readme" />
              <span v-else>{{ $tc('NoData') }}</span>
            </template>
          </el-tab-pane>
        </el-tabs>
        <div class="copy-btn">
          <i
            class="copy-btn el-icon-copy-document"
            @click="copyContent"
          />
        </div>
      </div>
    </IBox>
  </div>
</template>

<script>
import { IBox } from '@/components'
import VueMarkdown from 'vue-markdown'
import { highlightBlock } from 'highlight.js'

export default {
  name: 'SDKList',
  components: {
    IBox,
    VueMarkdown
  },
  data() {
    return {
      currentLanguage: 'python',
      readme: '',
      languages: [
        { label: 'Python', value: 'python' },
        { label: 'Go', value: 'go' }
      ]
    }
  },
  mounted() {
    this.getSdkInfo()
  },
  methods: {
    async copyContent() {
      try {
        await navigator.clipboard.writeText(this.readme)
        this.$message.success('复制成功')
      } catch (err) {
        this.$message.error('复制失败')
      }
    },
    highlightCode() {
      const codeBlocks = this.$el.querySelectorAll('pre code')
      codeBlocks.forEach((block) => {
        if (block?.dataset?.highlighted !== 'yes') {
          highlightBlock(block)
        }
      })
    },
    getSdkInfo() {
      const url = `/api/v1/accounts/integration-applications/sdks/?language=${this.currentLanguage}`
      this.$axios.get(url).then(res => {
        this.readme = res.readme
        this.$nextTick(() => {
          this.highlightCode()
        })
      })
    },
    handleInput() {
      this.getSdkInfo()
    }
  }
}
</script>
<style lang="less" scoped>
.code-container {
  position: relative;
}

.copy-btn {
  font-size: 20px;
  position: absolute;
  top: 8px;
  right: 5px;
}
</style>
