<template>
  <div class="table-header">
    <slot name="header">
      <div class="table-header-left-side">
        <LeftSide v-if="hasLeftActions" :selected-rows="selectedRows" :table-url="tableUrl" v-bind="$attrs" v-on="$listeners" />
        <span v-else>
          <AutoDataSearch v-if="hasSearch" class="right-side-item action-search" :config="searchConfig" :url="tableUrl" @tagSearch="handleTagSearch" />
        </span>
      </div>
      <div class="table-action-right-side">
        <AutoDataSearch v-if="hasLeftActions && hasSearch" class="right-side-item action-search" :config="searchConfig" :url="tableUrl" @tagSearch="handleTagSearch" />
        <RightSide v-if="hasRightActions" :selected-rows="selectedRows" :table-url="tableUrl" v-bind="$attrs" v-on="$listeners" />
      </div>
    </slot>
  </div>
</template>

<script>
import AutoDataSearch from '@/components/AutoDataSearch'
import LeftSide from './LeftSide'
import RightSide from './RightSide'

const defaultTrue = { type: Boolean, default: true }

export default {
  name: 'TableAction',
  components: {
    AutoDataSearch,
    LeftSide,
    RightSide
  },
  props: {
    hasLeftActions: defaultTrue,
    hasSearch: defaultTrue,
    hasRightActions: defaultTrue,
    searchConfig: {
      type: Object,
      default: () => ({})
    },
    tableUrl: {
      type: String,
      default: ''
    },
    searchTable: {
      type: Function,
      default: (val) => {}
    },
    selectedRows: {
      type: Array,
      default: () => []
    },
    testFields: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      keyword: ''
    }
  },
  computed: {
    hasSelectedRows() {
      return this.selectedRows.length > 0
    }
  },
  methods: {
    handleTagSearch(val) {
      this.searchTable(val)
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
    align-items: center;
    justify-content:center;
  }

  .table-action-right-side {
    display: flex;
    justify-content:center;
  }

  .export-item {
    display: block;
    padding: 5px 20px;
  }

</style>
