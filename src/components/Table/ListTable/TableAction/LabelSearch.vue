<template>
  <div class="label-search">
    <el-button
      v-if="showLabelButton"
      class="label-button"
      size="small"
      @click="showSearchSelect"
    >
      <i class="fa fa-tag" />
    </el-button>
    <el-cascader
      v-show="showLabelSearch"
      v-model="labelValue"
      :options="labelOptions"
      :placeholder="placeholder"
      class="label-cascader"
      clearable
      filterable
      separator=": "
    >
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
      labelOptions: [],
      labelValue: '',
      placeholder: this.$t('labels.SelectLabelFilter')
    }
  },
  watch: {
    labelValue(newValue) {
      if (!newValue || newValue.length === 0) {
        this.showLabelButton = true
        this.showLabelSearch = false
      }
      this.$emit('labelSearch', newValue)
    }
  },
  mounted() {
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
          let children = _.sortBy(labels, 'value')
          children = [{ id: '*', value: this.$t('common.All') }, ...children]
          labelOptions.push({
            value: key,
            label: key,
            children: children.map(label => {
              return {
                value: label.id,
                label: label.value
              }
            })
          })
        }
        this.labelOptions = _.sortBy(labelOptions, 'label')
      })
    },
    showSearchSelect() {
      this.getLabelOptions()
      this.showLabelSearch = true
      this.showLabelButton = false
    }
  }
}
</script>

<style lang='scss' scoped>
.label-search {
  margin-right: 10px;
}

.label-button {
  padding:  10px 15px;
}

.label-select {
}

.label-cascader {
  >>> .el-input__inner {
    font-size: 13px;
  }
}

</style>
