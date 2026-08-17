<template>
  <span :class="{ 'is-folded': shouldFold }" class="auto-data-search">
    <el-button v-if="shouldFold" circle class="search-btn" size="small" @click="handleManualSearch">
      <svg-icon icon-class="search" />
    </el-button>
    <TagSearch
      v-bind="tagSearchAttrs()"
      v-show="!shouldFold"
      ref="tagSearch"
      :options="internalOptions"
      :search-config="searchMeta"
      class="auto-data-search__field"
      @blur="handleBlur"
      @conditions-change="$emit('conditionsChange', $event)"
      @tag-search="handleTagSearch"
    />
  </span>
</template>

<script>
import { getFilterMeta, getSearchMeta } from '@/api/common'
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
    getTableMetadata: {
      type: Function,
      default: null
    },
    singleChoiceFields: {
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
      manualSearch: false,
      searchMeta: {},
      optionsRequestId: 0
    }
  },
  computed: {
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
      const requestId = ++this.optionsRequestId
      const data = await this.optionUrlMeta()
      const filters = getFilterMeta(data)
      const options = []
      for (const [name, field] of Object.entries(filters)) {
        const option = {
          custom: field.custom === true,
          label: field.label,
          multiple: field.multiple !== false && !this.singleChoiceFields.includes(name),
          operators: field.operators,
          type: field.type,
          value: name
        }
        if (['choice', 'labeled_choice'].indexOf(field.type) > -1 && field.choices) {
          option.isBooleanChoice =
            field.choices.length > 0 &&
            field.choices.every((item) => typeof item.value === 'boolean')
          option.children = field.choices.map((item) => {
            if (typeof item.value === 'boolean') {
              if (item.value) {
                return { label: item.label, value: 'true' }
              } else {
                return { label: item.label, value: 'false' }
              }
            }
            return { label: item.label, value: item.value }
          })
        }
        if (field.type === 'boolean') {
          option.children = [
            { label: i18n.t('Yes'), value: 'true' },
            { label: i18n.t('No'), value: 'false' }
          ]
        }
        if (option.value === 'id') {
          option.label = 'ID'
        }
        options.push(option)
      }
      if (requestId !== this.optionsRequestId) {
        return
      }
      this.searchMeta = getSearchMeta(data)
      this.internalOptions = options
    },
    optionUrlMeta() {
      if (this.getTableMetadata) {
        return this.getTableMetadata()
      }
      const url = this.url.indexOf('?') === -1 ? `${this.url}?display=1` : `${this.url}&display=1`
      return this.$store.dispatch('common/getUrlMeta', { url })
    }
  }
}
</script>

<style lang="scss" scoped>
.auto-data-search {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
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
