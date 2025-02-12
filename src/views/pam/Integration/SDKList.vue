<template>
  <div>
    <IBox class="radio-box">
      <div class="code-container">
        <el-tabs v-model="currentLanguage" @tab-click="handleInput">
          <el-tab-pane v-for="language in languages" :key="language.value" :label="language.label" :name="language.value">
            <two-col>
              <template>
                <vue-markdown class="code-markdown" :source="readme" />
              </template>
              <template #right>
                <vue-markdown class="code-demo" :source="code" />
              </template>
            </two-col>
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
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'SDKList',
  components: {
    TwoCol,
    IBox,
    VueMarkdown
  },
  data() {
    return {
      currentLanguage: 'python',
      readme: '',
      code: '',
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
        await navigator.clipboard.writeText(this.code)
        this.$message.success(this.$tc('CopySuccess'))
      } catch (err) {
        this.$message.error(this.$tc('CopyFailed'))
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
        this.code = `\`\`\`${this.currentLanguage}\n${res.code}\n\`\`\``
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
.code-markdown {
  min-height: 210px;
  padding: 10px 20px;
  border: 1px solid #DCDFE6;
  ::v-deep .table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    th, td {
      border: 1px solid #ebeef5;
      padding: 10px;
      text-align: left;
  }
   th {
      background-color: #f5f7fa;
    }
  }
}
.code-demo{
  @import "~highlight.js/styles/atom-one-light.css";
  min-height: 210px;
  padding: 10px 20px;
  border: 1px solid #DCDFE6;
}
.copy-btn {
  font-size: 20px;
  position: absolute;
  top: 8px;
  right: 5px;
}
</style>
