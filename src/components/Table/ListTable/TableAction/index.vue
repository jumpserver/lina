<template>
  <div :class="device" class="table-header clearfix">
    <slot name="header">
      <LeftSide
        v-if="hasLeftActions"
        :selected-rows="selectedRows"
        :table-url="tableUrl"
        class="left-side"
        v-bind="$attrs"
        v-on="$listeners"
      />
      <RightSide
        v-if="hasRightActions"
        :selected-rows="selectedRows"
        :table-url="tableUrl"
        class="right-side"
        v-bind="$attrs"
        v-on="$listeners"
      />
      <div :class="searchClass" class="search">
        <LabelSearch
          v-if="hasLabelSearch"
          @labelSearch="handleLabelSearch"
          @showLabelSearch="handleLabelSearchShowChange"
        />
        <AutoDataSearch
          v-if="hasSearch"
          :fold="foldSearch"
          class="right-side-item action-search"
          v-bind="iSearchTableConfig"
          @tagSearch="handleTagSearch"
        />
        <DatetimeRangePicker
          v-if="hasDatePicker"
          class="datepicker"
          v-bind="datePicker"
          @dateChange="handleDateChange"
        />
      </div>
    </slot>
  </div>
</template>

<script>
import LeftSide from './LeftSide.vue'
import RightSide from './RightSide.vue'
import AutoDataSearch from '@/components/Table/AutoDataSearch/index.vue'
import DatetimeRangePicker from '@/components/Form/FormFields/DatetimeRangePicker.vue'
import { getDaysAgo, getDaysFuture } from '@/utils/common'
import LabelSearch from '@/components/Table/ListTable/TableAction/LabelSearch.vue'

const defaultTrue = { type: Boolean, default: true }
const defaultFalse = { type: Boolean, default: false }
export default {
  name: 'TableAction',
  components: {
    LabelSearch,
    LeftSide,
    RightSide,
    AutoDataSearch,
    DatetimeRangePicker
  },
  props: {
    hasLeftActions: defaultTrue,
    hasSearch: defaultTrue,
    hasRightActions: defaultTrue,
    hasDatePicker: defaultFalse,
    hasLabelSearch: defaultFalse,
    datePicker: {
      type: Object,
      default: () => ({
        dateStart: getDaysAgo(7).toISOString(),
        dateEnd: getDaysFuture(1).toISOString()
      })
    },
    searchConfig: {
      type: Object,
      default: () => ({})
    },
    tableUrl: {
      type: String,
      default: ''
    },
    datePick: {
      type: Function,
      default: (val) => {
      }
    },
    searchTable: {
      type: Function,
      default: (val) => {
      }
    },
    selectedRows: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      keyword: '',
      foldSearch: false
    }
  },
  computed: {
    hasSelectedRows() {
      return this.selectedRows.length > 0
    },
    iSearchTableConfig() {
      const configDefault = {
        url: this.tableUrl
      }
      return Object.assign(configDefault, this.searchConfig)
    },
    device() {
      if (this.$store.state.app.device === 'mobile') {
        return 'mobile'
      }
      return ''
    },
    searchClass() {
      return this.hasLeftActions ? 'right' : 'left'
    }
  },
  methods: {
    handleTagSearch(val) {
      this.searchTable(val)
    },
    handleDateChange(val) {
      this.datePick(val)
    },
    handleLabelSearch(val) {
      if (!val || val.length === 0) {
        this.searchTable({ labels: '' })
        return
      }
      this.searchTable({ labels: val })
    },
    handleLabelSearchShowChange(val) {
      this.foldSearch = val
    }
  }
}
</script>

<style lang='scss' scoped>
  .table-header {
    /*display: flex;*/
    /*flex-direction: row;*/
    /*justify-content: space-between;*/
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

  .action-search >>> .el-cascader {
    line-height: 32px !important;
  }

  .right-side-actions {
    display: flex;
    padding-left: 10px;
    align-items: center;
    justify-content: center;
  }

  .table-action-right-side {
    display: flex;
    justify-content: center;
  }

  .export-item {
    display: block;
    padding: 5px 20px;
  }

  .datepicker {
    margin-left: 10px;
  }

  .table-header {
    line-height: 32px;
  }

  .left-side {
    float: left;
    display: block;
    &>>> .action-item.el-dropdown {
      height: 33px;
      &> .el-button {
        height: 100%;
      }
    }
  }

  .right-side {
    float: right;
  }

  .search {
    display: flex;
    flex-direction: row;
  }

  .mobile .search {
    display: inherit;
  }

  .mobile .search .datepicker {
    margin-left: 0;
  }

  .search.left {
    float: left;
    padding: 0 !important;
  }

  .search.right {
    float: right;
  }

  .mobile .search.right {
    float: none;
  }

  .mobile .search.right .action-search {
    width: 100%;
  }

  .mobile .right-side {
    padding-top: 5px;
  }

  .filter-field.right-side-item.action-search {
    height: 34px;
  }

</style>
