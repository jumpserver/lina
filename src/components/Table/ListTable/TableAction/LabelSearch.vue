<template>
  <div class="label-search">
    <el-button
      v-if="showLabelButton"
      class="label-button"
      plain
      size="small"
      @click="showSearchSelect"
    >
      <svg-icon icon-class="tag" />
      <span>{{ $t('common.Label') }}</span>
    </el-button>
    <el-cascader
      v-show="showLabelSearch"
      ref="labelCascader"
      v-model="labelValue"
      :options="labelOptions"
      :placeholder="placeholder"
      :props="labelProps"
      class="label-cascader"
      clearable
      filterable
      separator=": "
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
      showLabelButton: true,
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
        this.showLabelButton = true
        this.showLabelSearch = false
      }

      if (!newValue || newValue.length === 0) {
        this.$emit('labelSearch', '')
        return
      }

      const labelSearch = newValue.map(item => item.join(':')).join(',')
      console.log('Label search: ', labelSearch)
      this.$emit('labelSearch', labelSearch)
    }
  },
  methods: {
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
    showSearchSelect() {
      this.getLabelOptions()
      this.showLabelSearch = true
      this.showLabelButton = false
      setTimeout(() => {
        this.$refs.labelCascader.toggleDropDownVisible(true)
      }, 100)
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
  >>> .el-input__inner {
    font-size: 13px;
  }
  >>> .el-cascader__search-input {
  }
}

</style>
