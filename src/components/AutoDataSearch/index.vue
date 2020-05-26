<template>
  <TagSearch v-if="options !== []" :options="options" :config="defaultConfig" v-on="$listeners" />
</template>

<script>
const merge = require('deepmerge')
// import { optionUrlMeta } from '@/api/common'
import TagSearch from '@/components/TagSearch'
export default {
  name: 'AutoDataSearch',
  components: { TagSearch },
  props: {
    url: {
      type: String,
      default: () => {}
    },
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      defaultConfig: {
        expandTrigger: 'hover'
      },
      options: []
    }
  },
  computed: {
    iConfig() {
      return this.config ? merge(this.defaultConfig, this.config) : this.defaultConfig
    }
  },
  watch: {
    options() {
      // 空函数，方便子组件刷新
    }
  },
  mounted() {
    this.genericOptions()
  },
  methods: {
    async genericOptions() {
      const vm = this // 透传This
      const data = await this.optionUrlMeta()
      const meta = data.actions['GET'] || {}
      for (const [name, field] of Object.entries(meta)) {
        if (!field.filter) {
          continue
        }
        const option = {
          label: field.label,
          value: name
        }
        if (field.type === 'choice' && field.choices) {
          option.children = field.choices.map(item => {
            return { label: item.display_name, value: item.value }
          })
        }
        vm.options.push(option)
      }
    },
    optionUrlMeta() {
      const url = (this.url.indexOf('?') === -1) ? `${this.url}?draw=1&display=1` : `${this.url}&draw=1&display=1`
      return this.$store.dispatch('common/getUrlMeta', { url: url })
    }
  }
}
</script>

<style lang='less' scoped>

</style>
