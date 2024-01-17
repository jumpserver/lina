<template>
  <div class="filter-field">
    <el-cascader
      v-show="options.length > 0"
      ref="Cascade"
      :options="options"
      :props="config"
      @change="handleMenuItemChange"
    />
    <el-tag
      v-for="(v, k) in filterTags"
      :key="k"
      :disable-transitions="true"
      :name="k"
      class="filter-tag"
      closable
      size="small"
      type="info"
      @click="handleTagClick(v,k)"
      @close="handleTagClose(k)"
    >
      <strong v-if="v.label">{{ v.label + ':' }}</strong>
      <span v-if="v.valueLabel">{{ v.valueLabel }}</span>
      <span v-else>{{ v.value }}</span>
    </el-tag>
    <span v-if="keyLabel" slot="prefix" class="filterTitle">{{ keyLabel + ':' }}</span>
    <el-input
      ref="SearchInput"
      v-model="filterValue"
      :class="options.length < 1 ? 'search-input2': ''"
      :placeholder="placeholder"
      :validate-event="false"
      class="search-input"
      suffix-icon="el-icon-search"
      @blur="focus = false"
      @change="handleConfirm"
      @focus="focus = true"
      @keyup.enter.native="handleConfirm"
      @keyup.delete.native="handleDelete"
    />
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
    getUrlQuery: {
      type: Boolean,
      default: () => true
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
      emptyCount: 0,
      filterTags: this.default || {},
      focus: false
    }
  },
  computed: {
    keyLabel() {
      if (!this.filterKey) return ''
      for (const field of this.options) {
        if (field.value === this.filterKey) {
          return field?.label
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
        if (key.startsWith('search')) {
          data['search'] = (data.search ? data.search + ',' : '') + value
        } else {
          data[key] = value
        }
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
    options: {
      handler(newVal, oldVal) {
        if (newVal && newVal.length > 0) {
          const routeFilter = this.checkInTableColumns(newVal)
          if (oldVal.length > 0 && newVal.length !== oldVal.length) {
            const beforeRouteFilter = this.checkInTableColumns(oldVal)
            // 如果2次过滤的参数相同就不在重复请求
            if (_.isEqual(routeFilter, beforeRouteFilter)) {
              return
            }
          }
          this.filterTagSearch(routeFilter)
        }
      },
      deep: true
    },
    filterTags: {
      handler() {
        this.$emit('tag-search', this.filterMaps)
      },
      deep: true
    },
    filterValue(newValue, oldValue) {
      if (newValue === '' && oldValue !== '') {
        this.emptyCount = 1
      }
    }
  },
  methods: {
    // 获取url中的查询条件，判断是不是包含在当前查询条件里
    checkInTableColumns(options) {
      const searchFieldOptions = {}
      const queryInfoValues = options.map((i) => i.value)
      const routeQuery = this.getUrlQuery ? this.$route?.query : {}
      const routeQueryKeysLength = Object.keys(routeQuery).length
      if (routeQueryKeysLength < 1) return searchFieldOptions

      for (const [key, value] of Object.entries(routeQuery)) {
        const valueDecode = decodeURI(value)
        const isSearch = key === 'search'

        if (isSearch) {
          searchFieldOptions[key] = {
            key,
            label: '',
            value: valueDecode
          }
          continue
        }

        if (queryInfoValues.includes(key)) {
          searchFieldOptions[key] = this.getInQueryInfoFields(key, value)
        }
      }
      return searchFieldOptions
    },
    getInQueryInfoFields(key, value) {
      let searchFieldOption = {}
      let valueDecode = decodeURI(value)
      const currentOptions = this.options || []

      for (let k = 0, len = currentOptions.length; k < len; k++) {
        const current = currentOptions[k]
        if (key === current.value) {
          const curChildren = current.children || []
          if (current?.type === 'boolean') {
            valueDecode = !!valueDecode
          }
          searchFieldOption = {
            ...current,
            key,
            label: current.label,
            value: valueDecode
          }
          if (curChildren.length > 0) {
            for (const item of curChildren) {
              if (valueDecode === item.value) {
                searchFieldOption.valueLabel = item.label
                break
              }
            }
          }
          break
        }
      }

      return searchFieldOption
    },
    filterTagSearch(routeFilter) {
      const routerSearch = routeFilter.search || {}
      let routerSearchAttrs = []
      if (typeof routerSearch?.value === 'string') {
        routerSearchAttrs = routerSearch?.value?.split(',') || []
      }

      for (const attr of routerSearchAttrs) {
        routeFilter[`search_${attr}`] = {
          ...routerSearch,
          value: attr
        }
      }

      if (routerSearchAttrs.length !== 0) {
        delete routeFilter.search
      }
      const asFilterTags = _.cloneDeep(this.filterTags)
      this.filterTags = {
        ...asFilterTags,
        ...routeFilter
      }
    },
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
      if (this.getUrlQuery) {
        this.checkUrlFields(evt)
      }
      // this.$emit('tagSearch', this.filterMaps)
      return true
    },
    handleDelete() {
      const filterTags = Object.keys(this.filterTags)
      if (this.filterValue === '' && filterTags.length > 0) {
        if (this.emptyCount === 2) {
          this.handleTagClose(filterTags[filterTags.length - 1])
        } else {
          this.emptyCount++
        }
      }
    },
    handleConfirm() {
      if (this.filterValue === '') {
        this.handleTagClose(this.filterKey)
        this.filterKey = ''
        return
      }
      if (this.filterValue && !this.filterKey) {
        this.filterKey = 'search' + '_' + this.filterValue
      }
      setTimeout(() => {
        this.emptyCount = 2
      }, 10)
      const tag = {
        key: this.filterKey,
        label: this.keyLabel,
        value: this.filterValue,
        valueLabel: this.valueLabel
      }
      this.$set(this.filterTags, this.filterKey, tag)
      // this.$emit('tagSearch', this.filterMaps)

      // 修改查询参数时改变url中保存的参数
      if (this.getUrlQuery) {
        let newQuery = _.cloneDeep(this.$route.query)
        if (this.filterKey.startsWith('search')) {
          newQuery = { ...newQuery, search: encodeURI(this.filterMaps.search) }
        } else {
          newQuery = { ...newQuery, [this.filterKey]: encodeURI(this.filterValue) }
        }
        this.$router.replace({ query: newQuery })
      }

      this.filterKey = ''
      this.filterValue = ''
      this.valueLabel = ''
    },
    handleTagClick(v, k) {
      let unableChange = false
      for (const field of this.options) {
        if (field.value === v.key) {
          if (field.type === 'choice') {
            unableChange = true
          }
          if (field.type === 'boolean') {
            unableChange = true
          }
        }
      }
      if (unableChange) {
        return
      }
      if (this.filterValue.length !== 0) {
        this.handleConfirm()
      }
      this.$delete(this.filterTags, k)
      this.filterKey = v.key
      this.filterValue = v.value
      this.$refs.SearchInput.focus()
    },
    // 删除查询条件时改变url
    checkUrlFields(evt) {
      let newQuery = _.omit(this.$route.query, evt)
      if (this.getUrlQuery && evt.startsWith('search')) {
        if (newQuery.search) delete newQuery.search
        const filterMapsSearch = this.filterMaps.search || ''
        newQuery = {
          ...newQuery,
          ...(filterMapsSearch && { search: encodeURI(filterMapsSearch) })
        }
      }
      this.$router.replace({ query: newQuery })
    }
  }
}
</script>

<style lang="scss" scoped>
  .filter-field {
    display: flex;
    align-items:  center;
    min-width: 198px;
    border: 1px solid #dcdee2;
    border-radius: 3px;
    background-color:#fff;

  }
  .search-input  >>> .el-input__suffix {
    cursor: pointer;
  }
  .search-input2 >>> .el-input__inner {
    text-indent: 5px;
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
