<template>
  <div>
    <div class="table-header">
      <slot name="header">
        <!--TODO: 事件交互 -->
        <HeaderActions :actions="totalActions" :more-actions="moreActions" />
        <!-- TODO: 事件交互 -->
        <search v-if="hasSearch" class="search" @serachAction="handleSearch" />
      </slot>
    </div>
    <DataTable :config="tableConfig" class="table-content" />
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import search from './search'
import DataTable from '../DataTable'
import HeaderActions from './HeaderActions'
export default {
  name: 'ListTable',
  components: {
    HeaderActions,
    DataTable,
    search
  },
  props: {
    // 定义 table 的配置
    tableConfig: {
      type: Object,
      default: () => {}
    },
    // 是否显示table左侧的action
    hasAction: {
      type: Boolean,
      default: true
    },
    hasSearch: {
      type: Boolean,
      default: true
    },
    hasCreate: {
      type: Boolean,
      default: true
    },
    createTitle: {
      type: String,
      default() {
        return this.$tc('Create')
      }
    },
    createAction: {
      type: Object,
      default() {
        return {
          type: 'primary',
          name: 'create',
          title: this.createTitle
        }
      }
    },
    moreActions: {
      type: Array,
      default: () => []
    },
    actions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
    }
  },
  computed: {
    totalActions() {
      let actions = this.actions
      if (this.hasCreate) {
        actions = [
          this.createAction,
          ... actions
        ]
      }
      return actions
    }
  },
  methods: {
    handleSearch(val) {
      this.loading = true
      // this.getData({ search: val, draw: this.current_page, limit: this.page_size, offset: this.offset }, { row: 1 }).then(response => {
      //   console.log(response)
      //   this.tabledata = response.results
      //   this.total = response.count
      //   this.loading = false
      // })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      (val.length > 0) ? (this.selectDisable = false) : (this.selectDisable = true)
    },
    handleEdit: function(index, row) {
      try {
        this.$router.push({ name: this.action.hasEdit, params: { id: row.id }})
      } catch (error) {
        console.log(error)
      }
    },
    handleHeaderActionClick(item) {
      this.$emit('headerActionClick', item)
    },
    handleDelete: (index, row) => {
    },
    get(draw, limit, offset) {
      this.loading = true
      // this.getData({ draw, limit, offset }, { row: 1 }).then(response => {
      //   console.log(response)
      //   this.tabledata = response.results
      //   this.total = response.count
      //   this.loading = false
      // })
    }

  }
}
</script>

<style lang="less" scoped>
  .table-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .table-content {
    margin-top: 15px;
  }
  //修改颜色
  // .el-button--text{
  //   color: #409EFF;
  // }
</style>
