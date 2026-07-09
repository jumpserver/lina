<template>
  <div :class="{ 'is-expanded': showLabelSearch }" class="label-search">
    <el-button v-if="!showLabelSearch" class="label-button" size="small" @click="showSearchSelect">
      <svg-icon icon-class="tag" />
    </el-button>
    <el-cascader
      v-else
      ref="labelCascader"
      v-model="labelValue"
      :options="labelOptions"
      :placeholder="placeholder"
      :props="labelProps"
      clearable
      filterable
      separator=": "
      size="small"
      @focus="handleCascaderFocus"
      @visible-change="handleCascaderVisibleChange"
    >
      <template #default="{ node, data }">
        <span>{{ data.label }}</span>
        <span v-if="!node.isLeaf"> ({{ data.children.length - 1 }}) </span>
      </template>
    </el-cascader>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'LabelSearch',
  data() {
    return {
      showLabelSearch: false,
      isMobileView: false,
      labelProps: {
        multiple: true
      },
      labelOptions: [],
      labelValue: [],
      placeholder: this.$t('SelectLabelFilter')
    }
  },
  watch: {
    labelValue(newValue) {
      if (!newValue || newValue.length === 0) {
        // 清空(点 clearable ×)后仍留在 cascader，不再变回标签图标按钮。
        this.$emit('labelSearch', '')
        return
      }
      const labelSearch = newValue.map((item) => item.join(':')).join(',')
      this.$emit('labelSearch', labelSearch)
    },
    showLabelSearch(newValue) {
      this.$emit('showLabelSearch', newValue)
    }
  },
  created() {
    this.syncLabelSearchState(window.innerWidth)
    this.listenViewPort()
  },
  mounted() {
    this.$eventBus.$on('labelSearch', this.labelSearchHandler)
  },
  beforeUnmount() {
    this.$eventBus.$off('labelSearch', this.labelSearchHandler)
  },
  methods: {
    handleCascaderFocus() {
      this.setSearchFocus()
    },
    labelSearchHandler(label) {
      if (!label) {
        this.labelValue = []
        this.showLabelSearch = this.isMobileView
        return
      }
      this.labelValue = [...this.labelValue, [label.name, label.value]]
      this.getLabelOptions()
      setTimeout(() => {
        this.showLabelSearch = true
      }, 500)
    },
    handleCascaderVisibleChange(visible) {
      if (visible) {
        this.$emit('showLabelSearch', true)
        return
      }

      if (this.labelValue?.length > 0) {
        this.$emit('showLabelSearch', true)
        return
      }

      this.showLabelSearch = this.isMobileView
    },
    getLabelOptions() {
      if (this.labelOptions.length > 0) {
        return
      }
      const url = '/api/v1/labels/labels/'
      this.$axios.get(url).then((data) => {
        const groupedLabelOptions = _.groupBy(data, 'name')
        const labelOptions = []
        for (const [key, labels] of Object.entries(groupedLabelOptions)) {
          const all = { value: '*', label: this.$t('All') }
          const children = _.sortBy(labels, 'value').map((label) => ({
            value: label.value,
            label: label.value
          }))
          labelOptions.push({
            value: key,
            label: key,
            children: [all, ...children]
          })
        }
        this.labelOptions = _.sortBy(labelOptions, 'label')
      })
    },
    setSearchFocus() {
      setTimeout(() => {
        const cascaderEl = this.$refs.labelCascader?.$el
        const searchInput =
          cascaderEl?.querySelector?.('.el-cascader__search-input') ||
          cascaderEl?.getElementsByClassName?.('el-cascader__search-input')?.[0]
        if (searchInput) searchInput.focus()
      }, 100)
    },
    showSearchSelect() {
      this.getLabelOptions()
      this.showLabelSearch = true
      setTimeout(() => {
        this.$refs.labelCascader?.togglePopperVisible?.(true) ||
          this.$refs.labelCascader?.toggleDropDownVisible?.(true)
        this.setSearchFocus()
      }, 200)
    },
    syncLabelSearchState(viewPort) {
      this.isMobileView = viewPort < 992
      this.showLabelSearch = this.isMobileView || this.labelValue.length > 0
    },
    listenViewPort() {
      window.addEventListener(
        'resize',
        _.debounce((e) => {
          const viewPort = e?.target?.innerWidth
          this.syncLabelSearchState(viewPort)
        }, 100),
        false
      )
    }
  }
}
</script>

<style lang="scss" scoped>
// el-cascader 一律使用 Element Plus 原生样式，不做任何覆盖（此前的内部 hack 反而导致
// tags 飞出、双层边框等问题）。这里只保留：与右侧搜索框的间距、折叠态标签图标按钮的外观。
.label-search {
  display: inline-flex;
  align-items: center;
  max-width: 100%;

  &.is-expanded {
    flex: 1 1 240px;
    min-width: 180px;
    max-width: 320px;
  }

  // 展开态 cascader 与工具栏其它控件同高 30px（EP small 默认 24px 偏矮）。
  // 只调高度，不动内部结构，避免此前 hack 导致的 tags 飞出/双边框问题。
  :deep(.el-cascader) {
    --el-input-height: 30px;
    width: 100%;
    min-width: 0;
    line-height: 30px;

    .el-input {
      height: inherit;
      width: 100%;
      min-width: 0;

      .el-input__wrapper {
        padding: 4px 8px;
        border-radius: 0;
      }
    }
  }

  // 聚焦时隐藏 placeholder：filterable cascader 聚焦后会叠加一个搜索输入框，其光标落在
  // placeholder 文字上形成重叠。聚焦时把 placeholder 透明化，只留光标；失焦后恢复。
  :deep(.el-cascader:focus-within input::placeholder) {
    color: transparent;
  }

  // 折叠态：标签图标按钮（独立、与工具栏其它控件同高 30px）。
  :deep(.el-button.label-button) {
    height: 30px;
    padding: 0 10px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background-color: #fff;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  :deep(.svg-icon) {
    color: var(--color-icon-primary) !important;
  }
}
</style>
