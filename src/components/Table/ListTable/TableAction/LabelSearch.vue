<template>
  <div class="label-search">
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
    this.showLabelSearch = window.innerWidth < 992
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
        this.showLabelSearch = true
        return
      }
      this.labelValue = [...this.labelValue, [label.name, label.value]]
      this.getLabelOptions()
      setTimeout(() => {
        this.showLabelSearch = true
      }, 500)
    },
    // 展开成 cascader 后就保留输入框形态：关闭下拉/失焦都不再变回标签图标按钮。
    // 折叠态仅由初始及视口宽度(listenViewPort)决定。
    handleCascaderVisibleChange() {
      this.$emit('showLabelSearch', this.showLabelSearch)
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
    listenViewPort() {
      window.addEventListener(
        'resize',
        _.debounce((e) => {
          const viewPort = e?.target?.innerWidth
          this.showLabelSearch = viewPort < 992
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
  margin-right: 10px;

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
