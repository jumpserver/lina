<template>
  <div class="table-header">
    <slot name="header">
      <!--TODO: 事件交互 -->
      <div class="table-header-left-side">
        <ActionsGroup :actions="actions" :more-actions="moreActions" class="header-action"></ActionsGroup>
      </div>
      <!-- TODO: 事件交互 -->
      <div class="table-action-right-side">
        <el-input v-model="keyword" suffix-icon="el-icon-search" :placeholder="$tc('Search')" class="right-side-item action-search" size="small" clearable @change="handleSearch" @input="handleSearch"></el-input>
        <ActionsGroup :is-fa="true" :actions="rightSideActions" class="right-side-actions right-side-item"></ActionsGroup>
<!--        <el-button-group class="right-side-actions right-side-item">-->
<!--          <el-button size="mini"><i class="fa fa-download"></i></el-button>-->
<!--          <el-button size="mini"><i class="fa fa-upload"></i></el-button>-->
<!--          <el-button size="mini"><i class="fa fa-refresh"></i></el-button>-->
<!--        </el-button-group>-->
      </div>
    </slot>
  </div>
</template>

<script>
import ActionsGroup from '@/components/ActionsGroup'
export default {
  name: 'TableAction',
  components: {
    ActionsGroup
  },
  data() {
    return {
      hasLeftActions: true,
      hasSearch: true,
      hasRightActions: true,
      createAction: {
        name: 'create',
        title: this.$tc('Create'),
        type: 'primary'
      },
      actions: [{
        name: 'create',
        title: this.$tc('Create'),
        type: 'primary'
      }],
      rightSideActions: [
        {
          name: 'export',
          fa: 'fa-download'
        },
        {
          name: 'import',
          fa: 'fa-upload'
        },
        {
          name: 'refresh',
          fa: 'fa-refresh'
        }
      ],
      keyword: '',
      moreActions: [
        {
          title: this.$tc('Delete selected'),
          name: 'deleteSelected'
        },
        {
          title: this.$tc('Update selected'),
          name: 'updateSelected'
        }
      ]
    }
  },
  methods: {
    handleSearch(keyword) {
      console.log('Search: ', keyword)
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
