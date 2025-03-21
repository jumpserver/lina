<template>
  <div>
    <IBox class="radio-box">
      <div class="code-container">
        <el-tabs v-model="currentLanguage" @tab-click="handleInput">
          <el-tab-pane
            v-for="language in languages"
            :key="language.value"
            :label="language.label"
            :name="language.value"
          >
            <two-col>
              <template>
                <vue-markdown :source="readme" class="code-markdown" />
              </template>
              <template #right>
                <vue-markdown :source="code" class="code-demo" />
              </template>
            </two-col>
          </el-tab-pane>
        </el-tabs>

        <div class="copy-btn">
          <el-tooltip :content="$t('Copy')" placement="top">
            <i
              class="copy-btn el-icon-copy-document"
              @click="copyContent"
            />
          </el-tooltip>
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
      currentLanguage: 'curl',
      readme: '',
      code: '',
      languages: [
        { label: 'cURL', value: 'curl' },
        { label: 'Python', value: 'python' },
        { label: 'Go', value: 'go' },
        { label: 'Java', value: 'java' },
        { label: 'Node.js', value: 'node' }
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
        const highlightMapper = {
          'curl': 'bash',
          'python': 'python',
          'go': 'go',
          'java': 'java',
          'node': 'javascript'
        }
        const language = highlightMapper[this.currentLanguage] || 'bash'
        this.code = `\`\`\`${language}\n${res.code}\n\`\`\``
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

.code-demo {
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
  cursor: pointer;
}
</style>
