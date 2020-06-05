<template>
  <TagSearch :options="options" v-bind="$attrs" v-on="$listeners" />
</template>

<script>
import TagSearch from '@/components/TagSearch'
export default {
  name: 'AutoDataSearch',
  components: { TagSearch },
  props: {
    url: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    options() {
      // 空函数，方便子组件刷新
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
        if (field.type === 'boolean') {
          option.children = [
            { label: this.$t('common.Yes'), value: true },
            { label: this.$t('common.No'), value: false }
          ]
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
