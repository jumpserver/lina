<template>
  <div class="filter-field">
    <el-dropdown placement="bottom-start" @command="handleMenuItemClick">
      <span class="el-dropdown-link">
        <i class="el-icon-arrow-down el-icon--right" />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item v-for="option in filterFields" :key="option.key" :command="option.key" :value="option.label" :name="option.key">{{ option.label }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-tag v-for="(v, k) in filterTags" :key="k" :name="k" closable size="small" class="fieldtag" type="info" @close="handleTagClose(k)">
      <strong v-if="v.label">{{ v.label + ':' }}</strong> {{ v.value }}
    </el-tag>
    <span v-if="filterLabel" slot="prefix" class="filterTitle">{{ filterLabel + ':' }}</span>
    <el-input ref="SearchInput" v-model="filterValue" placeholder="添加筛选条件" style="max-width: 100px; border: none;" @change="handleConfirm" />
  </div>

</template>
<script>
export default {
  name: 'TagSearch',
  props: {
    filterFields: {
      type: Array,
      default() {
        return [
          {
            label: '用户名',
            key: 'username'
          },
          {
            label: 'ID',
            key: 'id'
          }
        ]
      }
    }
  },
  data() {
    return {
      filterKey: '',
      filterValue: '',
      filterTags: {

      }
    }
  },
  computed: {
    // eslint-disable-next-line vue/return-in-computed-property
    filterLabel() {
      for (const field of this.filterFields) {
        if (field.key === this.filterKey) {
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
    handleMenuItemClick(key) {
      this.filterKey = key
      this.$refs.SearchInput.focus()
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

<style lang="less" scoped>
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
  .el-input /deep/ .el-input__inner{
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
  .fieldtag{
    margin: 2px 4px 2px 0;
  }
  .el-icon--right{
    margin-left: 5px;
    margin-right: 5px;
  }
  a {
    color: #000;
  }
</style>
