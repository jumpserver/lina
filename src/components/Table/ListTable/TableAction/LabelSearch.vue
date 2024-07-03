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
      <template slot-scope="{ node, data }">
        <span>{{ data.label }}</span>
        <span v-if="!node.isLeaf"> ({{ data.children.length - 1 }}) </span>
      </template>
      <i slot="prefix" class="el-input__icon el-icon-search" />
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
    this.$eventBus.$on('labelSearch', label => {
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
    })
  },
  destroyed() {
    this.$eventBus.$off('labelSearch')
  },
  methods: {
    handleCascaderFocus() {
      this.setSearchFocus()
    },
    handleCascaderVisibleChange(visible) {
      const input = this.$refs.labelCascader.$el
        .getElementsByClassName('el-input--suffix')[0]
        .querySelector('input')
      if (visible) {
        setTimeout(() => {
          this.$refs.labelCascader.updateStyle()
          input.style.height = '30px'
        },)
        return
      } else {
        input.style.height = '30px'
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
        this.$refs.labelCascader.toggleDropDownVisible(true)
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
  margin-right: 10px;
  border: 1px solid var(--color-border);
  overflow: hidden;

  ::v-deep .el-button.label-button {
    height: 28px;
    border: none;
  }

  .label-cascader {
    width: 300px;
    height: 28px;
    line-height: 28px;

    ::v-deep .el-input {
      .el-input__inner {
        height: 28px !important;
        line-height: 28px;
        font-size: 13px;
        border: none;
      }

      .el-input__suffix {
        color: var(--color-icon-primary) !important;;
      }
    }

    ::v-deep .el-cascader__tags {
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

  ::v-deep .svg-icon {
    color: var(--color-icon-primary) !important;
  }
}
</style>
