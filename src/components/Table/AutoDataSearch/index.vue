<template>
  <span :class="{ 'is-folded': shouldFold }" class="auto-data-search">
    <el-button v-if="shouldFold" circle class="search-btn" size="small" @click="handleManualSearch">
      <svg-icon icon-class="search" />
    </el-button>
    <TagSearch
      v-bind="tagSearchAttrs()"
      v-show="!shouldFold"
      ref="tagSearch"
      :options="iOption"
      class="auto-data-search__field"
      @blur="handleBlur"
      @conditions-change="$emit('conditionsChange', $event)"
      @tag-search="handleTagSearch"
    />
  </span>
</template>

<script>
import { getActionMeta } from '@/api/common'
import TagSearch from '@/components/Table/TagSearch/index.vue'
import i18n from '@/i18n/i18n'

export default {
  name: 'AutoDataSearch',
  components: {
    TagSearch
  },
  emits: ['conditionsChange', 'tagSearch'],
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
      const options = [...this.options, ...this.internalOptions]
      return _.uniqBy(options, 'value')
    },
    hasTags() {
      if (Array.isArray(this.tags)) {
        return this.tags.length > 0
      }
      if (this.tags && typeof this.tags === 'object') {
        return Object.keys(this.tags).length > 0
      }
      return !!this.tags
    },
    shouldFold() {
      return this.fold && !this.hasTags && !this.manualSearch
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
    async focusSearch() {
      this.manualSearch = true
      await this.$nextTick()
      return this.$refs.tagSearch?.focusSearch()
    },
    removeCondition(key) {
      return this.$refs.tagSearch?.handleTagClose(key)
    },
    clearConditions() {
      return this.$refs.tagSearch?.clearConditions()
    },
    applyConditions(conditions) {
      return this.$refs.tagSearch?.applyConditions(conditions)
    },
    tagSearchAttrs() {
      const attrs = { ...this.$attrs }
      delete attrs.class
      delete attrs.style
      return attrs
    },
    handleTagSearch(tags) {
      if (_.isEqual(tags, this.tags)) {
        return
      }
      this.tags = tags || {}
      if (!tags || Object.keys(tags).length === 0) {
        this.manualSearch = false
      }
      this.$emit('tagSearch', tags)
    },
    handleBlur() {
      this.manualSearch = false
    },
    async handleManualSearch() {
      this.manualSearch = true
      await this.$nextTick()
      this.$refs.tagSearch?.focusSearch()
    },
    async genericOptions() {
      const vm = this // 透传This
      vm.internalOptions = [] // 重置
      const data = await this.optionUrlMeta()
      const meta = getActionMeta(data, 'GET')
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
          option.children = field.choices.map((item) => {
            if (typeof item.value === 'boolean') {
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
            { label: i18n.t('Yes'), value: true },
            { label: i18n.t('No'), value: false }
          ]
        }
        if (option.value === 'id') {
          option.label = 'ID'
        }
        vm.internalOptions.push(option)
      }
    },
    optionUrlMeta() {
      const url =
        this.url.indexOf('?') === -1
          ? `${this.url}?draw=1&display=1`
          : `${this.url}&draw=1&display=1`
      return this.$store.dispatch('common/getUrlMeta', { url: url })
    }
  }
}
</script>

<style lang="scss" scoped>
.auto-data-search {
  display: inline-flex;
  align-items: flex-start;
  box-sizing: border-box;
  min-width: 0;
  max-width: 100%;

  &.is-folded {
    width: auto;
  }
}

.auto-data-search__field {
  width: 100%;
  min-width: 0;
  min-height: 28px;
}

.search-btn {
  width: 30px;
  min-width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background-color: #fff;
  cursor: pointer;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}

:deep(.search-btn .svg-icon) {
  color: var(--color-icon-primary) !important;
}
</style>
