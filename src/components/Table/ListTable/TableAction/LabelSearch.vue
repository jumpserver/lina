<template>
  <div class="label-search">
    <el-button
      v-if="!showLabelSearch"
      class="label-button"
      size="small"
      @click="showSearchSelect"
    >
      <svg-icon icon-class="tag" />
      <span>{{ $t('common.Label') }}</span>
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
        <span v-if="!node.isLeaf"> ({{ data.children.length -1 }}) </span>
      </template>
      <i slot="prefix" class="el-input__icon el-icon-search" />
    </el-cascader>
  </div>
</template>

<script>

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
      placeholder: this.$t('labels.SelectLabelFilter')
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
  mounted() {
    this.$eventBus.$on('labelSearch', label => {
      if (!label) {
        this.labelValue = []
        this.showLabelSearch = true
        return
      }
      const labels = label.split(',').map(item => item.split(':'))
      const notExistLabels = labels.filter(item => {
        return !this.labelValue.find(label => label[0] === item[0] && label[1] === item[1])
      })
      this.labelValue = [...this.labelValue, ...notExistLabels]
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
      if (visible) {
        setTimeout(() => {
          this.$refs.labelCascader.updateStyle()
        },)
        return
      } else {
        const input = this.$refs.labelCascader.$el.getElementsByClassName('el-input--suffix')[0].querySelector('input')
        input.style.height = '34px'
      }
      if (this.labelValue.length === 0) {
        this.showLabelSearch = false
      }
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
          const all = { value: '*', label: this.$t('common.All') }
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
    }
  }
}
</script>

<style lang='scss' scoped>
.label-search {
  margin-right: 10px;
}

.label-button {
  padding: 10px 13px 10px 12px;
}

.label-select {
}

.label-cascader {
  width: 300px;
  >>> .el-input--suffix.el-input {
    input {
      height: 34px;
    }
  }
  >>> .el-input__inner {
    font-size: 13px;
  }
  >>> .el-cascader__search-input {
    display: none;
    margin: 0 0 2px 13px;
  }
  >>> .el-input.is-focus + .el-cascader__tags .el-cascader__search-input {
    display: inline;
  }
  >>> .el-input.is-focus + .el-cascader__tags {
    flex-wrap: wrap;
  }
  >>> .el-cascader__tags {
    white-space: nowrap;
    flex-wrap: nowrap;
    overflow: hidden;
  }
}

</style>
