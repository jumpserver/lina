<template>
  <div class="filter-field">
    <el-cascader ref="Cascade" :options="options" :props="config" @change="handleMenuItemChange" />
    <el-tag v-for="(v, k) in filterTags" :key="k" :name="k" closable size="small" class="filter-tag" type="info" @close="handleTagClose(k)">
      <strong v-if="v.label">{{ v.label + ':' }}</strong> {{ v.value }}
    </el-tag>
    <span v-if="filterLabel" slot="prefix" class="filterTitle">{{ filterLabel + ':' }}</span>
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
    }
  },
  data() {
    return {
      filterKey: '',
      filterValue: '',
      filterTags: {},
      focus: false
    }
  },
  computed: {
    filterLabel() {
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
        if (val) {
          this.$emit('tagSearch', this.filterMaps)
        }
      },
      deep: true
    }
  },
  methods: {
    handleMenuItemChange(keys) {
      this.$log.debug('Tag search keys: ', keys)
      if (keys.length === 0) {
        return
      }
      if (keys.length === 1) {
        this.filterKey = keys[0]
        this.$refs.SearchInput.focus()
      } else if (keys.length === 2) {
        this.filterKey = keys[0]
        this.filterValue = keys[1]
        this.handleConfirm()
      }
      this.$nextTick(() => this.$refs.Cascade.handleClear())
      // setTimeout(() => this.$refs.Cascade.handleClear(), 100)
    },
    handleTagClose(evt) {
      this.$delete(this.filterTags, evt)
      return true
    },
    handleConfirm() {
      if (this.filterValue && !this.filterKey) {
        this.filterKey = 'search'
      }
      this.$set(this.filterTags, this.filterKey, { label: this.filterLabel, value: this.filterValue })
      this.filterKey = ''
      this.filterValue = ''
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
