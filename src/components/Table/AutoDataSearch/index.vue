<template>
  <span>
    <el-button v-if="shouldFold" circle class="search-btn" size="mini" @click="handleManualSearch">
      <svg-icon icon-class="search" />
    </el-button>
    <TagSearch v-else :options="iOption" v-bind="$attrs" v-on="$listeners" @tag-search="handleTagSearch" />
  </span>
</template>

<script>
import TagSearch from '@/components/Table/TagSearch/index.vue'
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
    },
    // 建议折叠
    fold: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      internalOptions: [],
      tags: [],
      manualSearch: false
    }
  },
  computed: {
    iOption() {
      const options = this.options.concat(this.internalOptions)
      return _.uniqWith(options, _.isEqual)
    },
    shouldFold() {
      return this.fold && this.tags.length === 0 && !this.manualSearch
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
    handleTagSearch(tags) {
      if (_.isEqual(tags, this.tags)) {
        return
      }
      this.tags = tags
      if (tags.length === 0) {
        this.manualSearch = false
      }
      this.$emit('tagSearch', tags)
    },
    handleManualSearch() {
      this.manualSearch = true
    },
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
        if (['choice', 'labeled_choice'].indexOf(field.type) > -1 && field.choices) {
          option.children = field.choices.map(item => {
            if (typeof (item.value) === 'boolean') {
              if (item.value) {
                return { label: item.label, value: 'True' }
              } else {
                return { label: item.label, value: 'False' }
              }
            }
            return { label: item.label, value: item.value }
          })
        }
        if (field.type === 'boolean') {
          option.children = [
            { label: i18n.t('common.Yes'), value: true },
            { label: i18n.t('common.No'), value: false }
          ]
        }
        if (option.value === 'id') {
          option.label = 'ID'
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
.search-btn {
  margin-top: 4px;
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
}
</style>
