<template>
  <TagSearch :options="iOption" v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import TagSearch from '@/components/TagSearch'
import i18n from '@/i18n/i18n'
export default {
  name: 'AutoDataSearch',
  components: {
    TagSearch
  },
  props: {
    url: {
      type: String,
      default: ''
    },
    // 增加选项
    options: {
      type: Array,
      default: () => []
    },
    // 排除选项
    exclude: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      internalOptions: []
    }
  },
  computed: {
    iOption() {
      return this.options.concat(this.internalOptions)
    }
  },
  watch: {
    options() {
      // 空函数，方便子组件刷新
    },
    url() {
      this.genericOptions()
    }
  },
  mounted() {
    if (this.url) {
      this.genericOptions()
    }
  },
  methods: {
    async genericOptions() {
      const vm = this // 透传This
      vm.internalOptions = [] // 重置
      const data = await this.optionUrlMeta()
      const meta = data.actions['GET'] || {}
      for (const [name, field] of Object.entries(meta)) {
        if (!field.filter) {
          continue
        }
        if (vm.exclude.includes(name)) {
          continue
        }
        const option = {
          label: field.label,
          type: field.type,
          value: name
        }
        if (field.type === 'choice' && field.choices) {
          option.children = field.choices.map(item => {
            if (typeof (item.value) === 'boolean') {
              if (item.value) {
                return { label: item.display_name, value: 'True' }
              } else {
                return { label: item.display_name, value: 'False' }
              }
            }
            return { label: item.display_name, value: item.value }
          })
        }
        if (field.type === 'boolean') {
          option.children = [
            { label: i18n.t('common.Yes'), value: true },
            { label: i18n.t('common.No'), value: false }
          ]
        }
        vm.internalOptions.push(option)
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
