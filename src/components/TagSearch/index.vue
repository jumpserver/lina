<template>
  <div class="filter-field">
    <el-cascader ref="Cascade" :options="options" :props="config" @change="handleMenuItemChange" />
    <el-tag v-for="(v, k) in filterTags" :key="k" :name="k" closable size="small" class="filter-tag" type="info" @close="handleTagClose(k)">
      <strong v-if="v.label">{{ v.label + ':' }}</strong>
      <span v-if="v.valueLabel">{{ v.valueLabel }}</span>
      <span v-else>{{ v.value }}</span>
    </el-tag>
    <span v-if="keyLabel" slot="prefix" class="filterTitle">{{ keyLabel + ':' }}</span>
    <el-input ref="SearchInput" v-model="filterValue" :placeholder="placeholder" class="search-input" @blur="focus = false" @focus="focus = true" @change="handleConfirm" />
  </div>
</template>

<script>
export default {
  name: 'TagSearch',
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    options: {
      type: Array,
      default: () => []
    },
    default: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      filterKey: '',
      filterValue: '',
      valueLabel: '',
      filterTags: this.default || {},
      focus: false
    }
  },
  computed: {
    keyLabel() {
      for (const field of this.options) {
        if (field.value === this.filterKey) {
          return field.label
        }
      }
      return ''
    },
    filterMaps() {
      const data = {}
      for (let key in this.filterTags) {
        const value = this.filterTags[key]['value']
        if (key === '') {
          key = 'search'
        }
        data[key] = value
      }
      return data
    },
    placeholder() {
      if (this.focus && this.filterKey) {
        return this.$t('common.EnterForSearch')
      }
      return this.$t('common.Search')
    }
  },
  watch: {
    filterTags: {
      handler(val) {
        this.$nextTick(() => this.$emit('tagSearch', this.filterMaps))
        // this.$emit('tagSearch', this.filterMaps)
      },
      deep: true
    }
  },
  mounted() {
    setTimeout(() => {
      if (Object.keys(this.filterMaps).length > 0) {
        return this.$emit('tagSearch', this.filterMaps)
      }
    }
    , 400)
    // this.$nextTick(() => this.$emit('tagSearch', this.filterMaps))
  },
  methods: {
    getValueLabel(key, value) {
      for (const field of this.options) {
        if (field.value !== key) {
          continue
        }
        if (!field.children) {
          continue
        }
        for (const child of field.children) {
          if (child.value === value) {
            return child.label
          }
        }
      }
      return ''
    },
    handleMenuItemChange(keys) {
      if (keys.length === 0) {
        return
      }
      if (keys.length === 1) {
        this.filterKey = keys[0]
        this.$refs.SearchInput.focus()
      } else if (keys.length === 2) {
        this.filterKey = keys[0]
        this.filterValue = keys[1]
        this.valueLabel = this.getValueLabel(keys[0], keys[1])
        this.handleConfirm()
      }
      this.$nextTick(() => this.$refs.Cascade.handleClear())
    },
    handleTagClose(evt) {
      this.$delete(this.filterTags, evt)
      return true
    },
    handleConfirm() {
      if (this.filterValue && !this.filterKey) {
        this.filterKey = 'search'
      }
      const tag = { key: this.filterKey, label: this.keyLabel, value: this.filterValue, valueLabel: this.valueLabel }
      this.$set(this.filterTags, this.filterKey, tag)
      this.filterKey = ''
      this.filterValue = ''
      this.valueLabel = ''
    }
  }
}
</script>

<style lang="scss" scoped>
  .filter-field {
    display: flex;
    align-items:  center;
    border: 1px solid #dcdee2;
    border-radius: 3px;
    background-color:#fff;
  }
  .search-input >>> .el-input__inner {
    /*max-width:inherit !important;*/
    max-width: 200px;
    border: none;
    padding-left: 5px;
  }
  .el-input >>> .el-input__inner{
    border: none !important;
    font-size: 13px;
  }

  .filterTitle {
    padding-right: 2px;
    line-height: 100%;
    text-align: center;
    flex-shrink: 0;
    border-collapse: separate;
    box-sizing: border-box;
    color: rgb(96, 98, 102);
    display: inline;
    font-size: 13px;
    height: auto;
  }
  .filter-tag{
    margin: 2px 4px 2px 0;
  }
  .el-icon--right{
    margin-left: 5px;
    margin-right: 5px;
  }
  a {
    color: #000;
  }

  .filter-field >>> .el-cascader .el-input--suffix .el-input__inner {
    padding-right: 20px;
  }

  .filter-field >>> .el-cascader .el-input input {
    width: 0;
    border: none;
  }

  .filter-field >>> .el-input__inner {
    height: 30px;
  }

  .el-cascader-menu__wrap {
    height: inherit;
  }
</style>
