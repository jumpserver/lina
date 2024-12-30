<template>
  <div>
    <IBox class="radio-box">
      <el-radio-group v-model="currentLanguage" @input="handleInput">
        <el-radio label="python">Python</el-radio>
        <el-radio label="go">Go</el-radio>
      </el-radio-group>
    </IBox>
    <TwoCol>
      <template>
        <IBox title="README">
          <vue-markdown v-if="readme" :source="readme" />
          <span v-else>{{ $tc('NoData') }}</span>
        </IBox>
      </template>
      <template #right>
        <QuickActions :actions="quickActions" type="primary" />
      </template>
    </TwoCol>
  </div>
</template>

<script>
import { IBox } from '@/components'
import { download } from '@/utils/common'
import QuickActions from '@/components/QuickActions/index.vue'
import VueMarkdown from 'vue-markdown'
import { highlightBlock } from 'highlight.js'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'SDKList',
  components: {
    TwoCol,
    QuickActions,
    IBox,
    VueMarkdown
  },
  data() {
    return {
      currentLanguage: 'python',
      readme: '',
      filenameMap: {
        python: 'jms_pam-0.0.1-py3-none-any.whl',
        go: 'jms_pam.go'
      },
      quickFilters: [
        {
          label: this.$t('Language'),
          options: [
            {
              label: 'Python',
              active: false,
              filter: {
                category: 'python'
              }
            },
            {
              label: 'GO',
              filter: {
                category: 'go'
              }
            }
          ]
        }
      ],
      quickActions: [
        {
          title: this.$t('Action'),
          attrs: {
            type: 'primary',
            label: this.$tc('Download'),
            model: this.currentLanguage
          },
          callbacks: {
            click: () => {
              const filename = this.filenameMap[this.currentLanguage]
              download(`/download/public/sdks/${filename}/`)
            }
          }
        }
      ]
    }
  },
  mounted() {
    this.getSdkInfo()
  },
  methods: {
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

<style lang="scss" scoped>
.radio-box {
  margin-bottom: 5px;
}
</style>
