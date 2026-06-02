<template>
  <div class="label-search">
    <el-button
      v-if="!showLabelSearch"
      class="label-button"
      size="small"
      @click="showSearchSelect"
    >
      <svg-icon icon-class="tag" />
    </el-button>
    <el-cascader
      v-else
      ref="labelCascader"
      v-model="labelValue"
      :options="labelOptions"
      :placeholder="placeholder"
      :props="labelProps"
      class="label-cascader"
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
      <template #prefix>
        <i class="el-input__icon el-icon-search" />
      </template>
    </el-cascader>
  </div>
</template>

<script>
import { debounce } from 'lodash'

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
        this.showLabelSearch = false
      }

      if (!newValue || newValue.length === 0) {
        this.$emit('labelSearch', '')
        return
      }

      const labelSearch = newValue.map(item => item.join(':')).join(',')
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
  beforeUnmount(label) {
    this.$eventBus.$off('labelSearch', this.labelSearchHandler)
  },
  methods: {
    getCascaderInput() {
      return this.$refs.labelCascader?.$el
        ?.getElementsByClassName('el-input--suffix')[0]
        ?.querySelector('input')
    },
    setCascaderVisible(visible) {
      const cascader = this.$refs.labelCascader
      if (!cascader) {
        return
      }
      if (typeof cascader.togglePopperVisible === 'function') {
        cascader.togglePopperVisible(visible)
        return
      }
      if (typeof cascader.toggleDropDownVisible === 'function') {
        cascader.toggleDropDownVisible(visible)
      }
    },
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
    handleCascaderVisibleChange(visible) {
      const input = this.getCascaderInput()
      if (!input) {
        return
      }
      if (visible) {
        setTimeout(() => {
          input.style.height = '32px'
        })
        return
      } else {
        input.style.height = '32px'
      }
      if (this.labelValue.length === 0) {
        this.showLabelSearch = false
      }
      this.$emit('showLabelSearch', this.showLabelSearch)
    },
    getLabelOptions() {
      if (this.labelOptions.length > 0) {
        return
      }
      const url = '/api/v1/labels/labels/'
      this.$axios.get(url).then(data => {
        const groupedLabelOptions = _.groupBy(data, 'name')
        const labelOptions = []
        for (const [key, labels] of Object.entries(groupedLabelOptions)) {
          const all = { value: '*', label: this.$t('All') }
          const children = _.sortBy(labels, 'value').map(label => ({
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
        this.$refs.labelCascader.$el.getElementsByClassName('el-cascader__search-input')[0].focus()
      }, 100)
    },
    showSearchSelect() {
      this.getLabelOptions()
      this.showLabelSearch = true
      setTimeout(() => {
        this.setCascaderVisible(true)
        this.setSearchFocus()
      }, 200)
    },
    listenViewPort() {
      window.addEventListener('resize', debounce((e) => {
        const viewPort = e?.target?.innerWidth
        this.showLabelSearch = viewPort < 992
      }, 100), false)
    }
  }
}
</script>

<style lang='scss' scoped>
.label-search {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background-color: var(--surface-panel);
  overflow: hidden;

  :deep(.el-button.label-button) {
    width: 32px;
    height: 32px;
    min-height: 32px;
    padding: 0;
    border: none;
    border-radius: 0;
    background-color: transparent;

    .svg-icon {
      width: 14px;
      height: 14px;
    }
  }

  .label-cascader {
    width: 300px;
    height: 32px;
    line-height: 32px;

    :deep(.el-input) {
      display: inline-flex;
      align-items: center;
      min-height: 32px;

      .el-input__wrapper {
        min-height: 32px;
        height: 32px;
        padding: 0 12px;
        border: none;
        border-radius: 0;
        background-color: transparent;
        box-shadow: none;
      }

      .el-input__inner {
        height: 32px !important;
        line-height: 32px;
        font-size: var(--font-size-base);
        border: none;
      }

      .el-input__suffix {
        display: inline-flex;
        align-items: center;
        color: var(--color-icon-primary) !important;
      }
    }

    :deep(.el-cascader__tags) {
      align-items: center;
      white-space: nowrap;
      flex-wrap: nowrap;
      overflow: hidden;

      .el-tag.el-tag--info {
        color: var(--color-text-primary) !important;
      }

      .el-cascader__search-input {
        display: none;
      }
    }
  }

  :deep(.svg-icon) {
    color: var(--color-icon-primary) !important;
  }
}
</style>
