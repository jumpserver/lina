<template>
  <div :class="device" class="table-header clearfix container">
    <slot name="header">
      <LeftSide
        v-bind="$attrs"
        v-if="hasLeftActions"
        :key="leftSideRenderKey"
        :on-create="onCreate"
        :selected-rows="selectedRows"
        :table-url="tableUrl"
        class="left-side"
        @init-actions-done="handleActionsDone"
      />

      <RightSide
        v-bind="$attrs"
        v-if="hasRightActions"
        :handle-table-setting-click="handleTableSettingClick"
        :quick-filter-expand="quickFilterExpand"
        :selected-rows="selectedRows"
        :table-url="tableUrl"
        class="right-side"
        @update:quick-filter-expand="$emit('update:quick-filter-expand', $event)"
      />

      <div :class="searchClass" class="search">
        <LabelSearch
          v-if="hasLabelSearch"
          @label-search="handleLabelSearch"
          @show-label-search="handleLabelSearchShowChange"
        />
        <AutoDataSearch
          v-bind="iSearchTableConfig"
          v-if="hasSearch"
          :fold="foldSearch"
          class="right-side-item action-search"
          @tag-search="handleTagSearch"
        />
        <DatetimeRangePicker
          v-bind="datePicker"
          v-if="hasDatePicker"
          class="datepicker"
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
  emits: ['update:quick-filter-expand', 'done'],
  props: {
    handleTableSettingClick: {
      type: Function,
      default: null
    },
    quickFilterExpand: {
      type: Boolean,
      default: true
    },
    hasLeftActions: defaultTrue,
    hasSearch: defaultTrue,
    hasRightActions: defaultTrue,
    hasDatePicker: defaultFalse,
    hasLabelSearch: defaultFalse,
    onCreate: {
      type: Function,
      default: null
    },
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
      default: (val) => {}
    },
    searchTable: {
      type: Function,
      default: (val) => {}
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
      iHasLeftActions: this.hasLeftActions,
      leftSideRenderVersion: 0
    }
  },
  computed: {
    hasSelectedRows() {
      return this.selectedRows.length > 0
    },
    leftSideRenderKey() {
      const rowKeys = this.selectedRows
        .map((row, index) => {
          return row?.id || row?.uuid || row?.pk || row?.name || `row-${index}`
        })
        .join(',')
      return `${this.leftSideRenderVersion}:${this.selectedRows.length}:${rowKeys}`
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
  watch: {
    selectedRows: {
      handler() {
        this.leftSideRenderVersion += 1
      },
      deep: true
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
    handleLabelSearchShowChange() {
      // 标签搜索的展开不应联动折叠旁边的普通搜索框(action-search)——两者相互独立。
      // 原先 `this.foldSearch = val` 会在标签搜索展开时把 action-search 折成图标并一直保持。
    },
    handleActionsDone(actions) {
      this.iHasLeftActions = actions.filter((i) => i && i.has !== false).length > 0
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
  // :deep(.data-actions) {
  //   display: flex;
  //   justify-content: center;
  //   align-items: flex-end;

  //   .el-button {
  //     padding: 2px 5px;
  //     font-size: 13px;
  //     display: inline-block !important;
  //     height: 30px;
  //     line-height: 30px;

  //     &:not(.is-plain) {
  //       color: $btn-text-color;
  //     }

  //     overflow: hidden;
  //     text-overflow: ellipsis;
  //     white-space: nowrap;

  //     // 确保按钮内部所有内容都垂直居中
  //     :deep(span) {
  //       display: inline-flex;
  //       align-items: center;
  //       line-height: 1;
  //       vertical-align: middle;
  //     }
  //   }

  //   :deep(.action-item.el-dropdown .el-button) {
  //     display: block;
  //     color: var(--color-primary);
  //     background-color: $color-btn-background;
  //     border-color: $color-btn-focus-background;

  //     &:focus {
  //       color: $btn-text-color;
  //       background-color: $color-btn-focus-background !important;
  //     }

  //     &:hover {
  //       color: $btn-text-color;
  //       background-color: $color-btn-focus-background;
  //     }
  //   }
  // }

  .left-side {
    display: block;
    //float: left;

    :deep(.action-item.el-dropdown > .el-button) {
      min-height: 30px;
    }

    :deep(.action-item.el-button) {
      min-height: 30px;
    }
  }

  .right-side {
    //float: right;
    height: 30px;
    align-self: flex-start;
  }

  .search {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 10px;
    min-width: 0;

    // 标签筛选与搜索框是两个相互独立的控件，各自单一边框、圆角，中间留间距。
    .right-side-item.action-search {
      flex: 0 1 auto;
      box-sizing: border-box;
      width: max-content;
      min-height: 30px;
      min-width: 210px;
      max-width: 100%;
      font-size: 13px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      overflow: hidden;
    }

    .right-side-item.action-search.is-folded {
      flex: 0 0 auto;
      width: auto;
      height: 30px;
      min-width: 30px;
      border: 0;
      overflow: visible;
    }
  }

  .search.left {
    padding: 0 !important;
  }

  .search.right {
    display: flex;
    flex-wrap: nowrap;
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
  align-self: flex-start;
}

.search {
  order: 2;
  flex: 1 1 auto;
  min-width: 0;
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
