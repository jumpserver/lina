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
$innerHeight: 28px;
$headerHeight: 30px;

.table-header {
  .left-side {
    display: block;
    float: left;

    ::v-deep .action-item.el-dropdown > .el-button {
      height: 100%;
    }
  }

  .right-side {
    float: right;
  }

  .search {
    display: flex;
    flex-direction: row;

    .right-side-item.action-search {
      height: $headerHeight;
    }
  }

  .search.left {
    float: left;
    padding: 0 !important;
  }

  .search.right {
    float: right;
  }
}

.export-item {
  display: block;
  padding: 5px 20px;
}

.mobile .search {
  display: inherit;
}

.mobile .search .datepicker {
  margin-left: 0;
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
</style>
