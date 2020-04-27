<template>
  <TagSearch v-if="options !== []" :options="options" :config="defaultConfig" v-on="$listeners" />
</template>

<script>
const merge = require('deepmerge')
import { optionUrlMeta } from '@/api/common'
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
    internalConfig() {
      return this.config ? merge(this.defaultConfig, this.config) : this.defaultConfig
    }
  },
  watch: {
    options() {
      // 空函数，方便子组件刷新
    }
  },
  mounted() {
    this.optionUrlMeta()
  },
  methods: {
    genericOptions(data) {
      const _this = this // 透传This
      Object.keys(data).forEach(function(key) {
        if (data[key].filter) {
          _this.options.push(
            {
              label: data[key].label,
              value: key
            }
          )
        } else if (data[key].choices) {
          //
        }
      })
    },
    optionUrlMeta() {
      const url = (this.url.indexOf('?') === -1) ? `${this.url}?draw=1&display=1` : `${this.url}&draw=1&display=1`
      optionUrlMeta(url).then(data => {
        this.genericOptions(data.actions['GET'] || {})
      })
    }
  }
}
</script>

<style lang='less' scoped>

</style>
