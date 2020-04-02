<template>
  <div class="table-header">
    <slot name="header">
      <!--TODO: 事件交互 -->
      <div class="table-header-left-side">
        <ActionsGroup :actions="actions" :more-actions="moreActions" class="header-action" @actionClick="handleActionClick"></ActionsGroup>
      </div>
      <!-- TODO: 事件交互 -->
      <div class="table-action-right-side">
        <el-input v-model="keyword" suffix-icon="el-icon-search" :placeholder="$tc('Search')" class="right-side-item action-search" size="small" clearable @change="handleSearch" @input="handleSearch"></el-input>
        <ActionsGroup :is-fa="true" :actions="rightSideActions" class="right-side-actions right-side-item" @actionClick="handleActionClick"></ActionsGroup>
      </div>
    </slot>
  </div>
</template>

<script>
import ActionsGroup from '@/components/ActionsGroup'
const defaultTrue = { type: Boolean, default: true }
export default {
  name: 'TableAction',
  components: {
    ActionsGroup
  },
  props: {
    hasExport: defaultTrue,
    hasImport: defaultTrue,
    hasRefresh: defaultTrue,
    hasCreate: defaultTrue,
    hasDelete: defaultTrue,
    hasUpdate: defaultTrue,
    hasLeftActions: defaultTrue,
    hasSearch: defaultTrue,
    hasRightActions: defaultTrue
  },
  data() {
    return {
      defaultRightSideActions: {
        Export: { name: 'actionExport', fa: 'fa-download' },
        Import: { name: 'actionImport', fa: 'fa-upload' },
        Refresh: { name: 'actionRefresh', fa: 'fa-refresh' }
      },
      defaultCreateAction: {
        name: 'actionCreate',
        title: this.$tc('Create'),
        type: 'primary'
      },
      keyword: '',
      defaultMoreActions: {
        Delete: {
          title: this.$tc('Delete selected'),
          name: 'actionDeleteSelected'
        },
        Update: {
          title: this.$tc('Update selected'),
          name: 'actionUpdateSelected'
        }
      }
    }
  },
  computed: {
    rightSideActions() {
      const actions = []
      for (const k in this.defaultRightSideActions) {
        if (this['has' + k]) {
          actions.push(this.defaultRightSideActions[k])
        }
      }
      return actions
    },
    actions() {
      const actions = []
      if (this.hasCreate) {
        actions.push(this.defaultCreateAction)
      }
      return actions
    },
    moreActions() {
      const actions = []
      for (const k in this.defaultMoreActions) {
        if (this['has' + k]) {
          actions.push(this.defaultMoreActions[k])
        }
      }
      return actions
    }
  },
  methods: {
    handleSearch(keyword) {
      console.log('Search: ', keyword)
    },
    handleActionClick(item) {
      this.$emit('clickAction', item)
    }
  }
}
</script>

<style scoped>
  .table-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .right-side-item {
  }

  .right-side-actions >>> .el-button {
    border: none;
    padding: 5px;
    font-size: 14px;
    width: 26px;
    height: 26px;
    color: #888;
    background-color: transparent;
  }

  .right-side-actions >>> .fa {
    height: 16px;
    width: 16px;
  }

  .right-side-actions >>> .el-button:hover {
    background-color: rgb(0, 0, 0, 0.05);
  }

  .action-search >>> .el-input__suffix i {
    font-weight: 500;
    color: #888;
  }

  .right-side-actions {
    display: flex;
    padding-left: 10px;
    justify-content:center;
  }

  .table-action-right-side {
    display: flex;
    justify-content:center;
  }

</style>
