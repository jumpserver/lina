<template>
  <div class="filter-field">
    <el-dropdown ref="Dropdown" placement="bottom-start">
      <span class="el-dropdown-link">
        <i class="el-icon-arrow-down el-icon--right" />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-cascader-panel ref="Cascade" :options="options" :props="config" @change="handleMenuItemChange" />
      </el-dropdown-menu>
    </el-dropdown>
    <el-tag v-for="(v, k) in filterTags" :key="k" :name="k" closable size="small" class="filter-tag" type="info" @close="handleTagClose(k)">
      <strong v-if="v.label">{{ v.label + ':' }}</strong> {{ v.value }}
    </el-tag>
    <span v-if="filterLabel" slot="prefix" class="filterTitle">{{ filterLabel + ':' }}</span>
    <el-input ref="SearchInput" v-model="filterValue" :placeholder="this.$t('common.Search')" style="max-width: 100px; border: none" @change="handleConfirm" />
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
      filterTags: {}
    }
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    filterLabel() {
      for (const field of this.options) {
        if (field.value === this.filterKey) {
          return field.label
        }
      }
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
    }
  },
  watch: {
    filterTags: function(val) {
      if (val) {
        this.$emit('tagSearch', this.filterMaps)
      }
    }
  },
  methods: {
    handleMenuItemChange(keys) {
      this.$refs.Dropdown.hide()
      this.$refs.SearchInput.focus()
      if (keys.length !== 0) {
        this.filterKey = keys[0]
        this.$refs.Cascade.clearCheckedNodes()
      }
      console.log(this.filterKey)
    },
    handleTagClose(evt) {
      this.$delete(this.filterTags, evt)
      return true
    },
    handleConfirm() {
      this.$set(this.filterTags, this.filterKey, { label: this.filterLabel, value: this.filterValue })
      this.filterKey = ''
      this.filterValue = ''
    }
  }
}
</script>

<style scoped>
  .filter-field {
    display: flex;
    align-items:  center;
    border: 1px solid #dcdee2;
    border-radius: 3px;
    background-color:#fff;
  }
  .el-input{
    max-width:inherit !important;
  }
  .el-input >>> .el-input__inner{
    border: none !important;
  }
  .filterTitle{
    padding-right: 2px;
    line-height: 100%;
    text-align: center;
    flex-shrink: 0;

    border-collapse:separate;
    box-sizing:border-box;
    color:rgb(96, 98, 102);
    display:inline;
    font-size:14px;
    height:auto;
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
  /*// 去掉边框*/
  .el-dropdown-menu{
    border: none !important;
  }
  .el-cascader-panel{
    border: none !important;
  }

  /*// 重置表格高度*/
  .el-cascader-panel /deep/ .el-cascader-menu__wrap{
    height: inherit;
  }

  .filter-field >>> .el-input__inner {
    height: 30px;
  }
</style>
