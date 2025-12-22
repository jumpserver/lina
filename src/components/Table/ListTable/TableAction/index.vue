<template>
  <div :class="device" class="table-header clearfix container">
    <slot name="header">
      <LeftSide
        v-if="hasLeftActions"
        :selected-rows="selectedRows"
        :table-url="tableUrl"
        class="left-side"
        v-bind="$attrs"
        v-on="$listeners"
        @init-actions-done="handleActionsDone"
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
          @label-search="handleLabelSearch"
          @show-label-search="handleLabelSearchShowChange"
        />
        <AutoDataSearch
          v-if="hasSearch"
          :fold="foldSearch"
          class="right-side-item action-search"
          v-bind="iSearchTableConfig"
          @tag-search="handleTagSearch"
        />
        <DatetimeRangePicker
          v-if="hasDatePicker"
          class="datepicker"
          v-bind="datePicker"
          @date-change="handleDateChange"
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
import { getDaysAgo, getDaysFuture } from '@/utils/common/time'
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
      default: val => {}
    },
    searchTable: {
      type: Function,
      default: val => {}
    },
    selectedRows: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      keyword: '',
      foldSearch: false,
      iHasLeftActions: this.hasLeftActions
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
      return this.iHasLeftActions ? 'right' : 'left'
    }
  },
  created() {
    this.$emit('done')
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
    },
    handleActionsDone(actions) {
      this.iHasLeftActions = actions.filter(i => i && i.has !== false).length > 0
    }
  }
}
</script>

<style lang="scss" scoped>
$innerHeight: 28px;
$headerHeight: 30px;
$btn-text-color: #ffffff;
$color-btn-background: #e8f7f4;
$color-btn-focus-background: #83cbba;
$color-divided: #e4e7ed;
$color-drop-menu-title: #909399;
$color-drop-menu-border: #e4e7ed;

.table-header {
    // 主要是 Table 中的操作列
  :deep(.data-actions) {
    display: flex;
    justify-content: center;
    align-items: flex-end;

    .el-button {
      padding: 2px 5px;
      font-size: 13px;
      display: inline-block !important;
      height: 30px;
      line-height: 30px;

      &:not(.is-plain) {
        color: $btn-text-color;
      }

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      // 确保按钮内部所有内容都垂直居中
      :deep(span) {
        display: inline-flex;
        align-items: center;
        line-height: 1;
        vertical-align: middle;
      }
    }

    :deep(.action-item.el-dropdown .el-button) {
      display: block;
      color: var(--color-primary);
      background-color: $color-btn-background;
      border-color: $color-btn-focus-background;

      &:focus {
        color: $btn-text-color;
        background-color: $color-btn-focus-background !important;
      }

      &:hover {
        color: $btn-text-color;
        background-color: $color-btn-focus-background;
      }
    }
  }

  .left-side {
    display: block;
    //float: left;

    :deep(.action-item.el-dropdown > .el-button) {
      height: 100%;
    }
  }

  .right-side {
    //float: right;
    height: 30px;
  }

  .search {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;

    .right-side-item.action-search {
      border: 1px solid var(--color-border);
      overflow: hidden;
    }
  }

  .search.left {
    padding: 0 !important;
    gap: 10px;
  }

  .search.right {
    display: flex;
    flex-wrap: wrap;
    padding-right: 10px;
  }
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 0;

  &.mobile {
    justify-content: flex-start;

    .left-side {
      gap: 0;
    }

    .search {
      justify-content: flex-start;
      gap: 10px;
    }
  }
}

.left-side {
  order: 1;
}

.search {
  order: 2;
  flex-grow: 1; /* This allows it to grow and fill available space */
}

.right-side {
  order: 3;
}

/* When .left-side is not present, adjust the layout */
.container:not(:has(.left-side)) .search {
  margin-right: auto; /* Pushes .search to the left */
  justify-content: flex-start;
}

.export-item {
  display: block;
  padding: 5px 20px;
}
</style>
