<template>
  <div class="table-action">
    <div
      :class="[device, { 'has-left-actions': iHasLeftActions }]"
      class="table-header table-action__toolbar"
    >
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
          :selected-rows="selectedRows"
          :table-url="tableUrl"
          class="right-side"
        />

        <div :class="[searchClass, { 'has-label-filter': hasLabelSearch }]" class="search">
          <NodeSearch
            v-bind="nodeSearchConfig"
            v-if="hasNodeSearch"
            ref="nodeSearch"
            class="search-filter"
            @node-search="handleNodeSearch"
          />
          <LabelSearch
            v-bind="labelSearchConfig"
            v-if="hasLabelSearch"
            ref="labelSearch"
            class="search-filter"
            @label-search="handleLabelSearch"
            @show-label-search="handleLabelSearchShowChange"
          />
          <AutoDataSearch
            v-bind="iSearchTableConfig"
            v-if="hasSearch"
            ref="autoDataSearch"
            :fold="foldSearch"
            :get-table-metadata="getTableMetadata"
            class="right-side-item action-search search-primary"
            @conditions-change="handleTagConditionsChange"
            @tag-search="handleTagSearch"
          />
          <el-popover
            v-if="savedSearchPresets.length"
            v-model:visible="searchHistoryVisible"
            :fallback-placements="['bottom-end']"
            :popper-options="searchHistoryPopperOptions"
            :show-arrow="false"
            placement="bottom-end"
            popper-class="search-history-popper"
            trigger="click"
          >
            <template #reference>
              <el-button
                :aria-label="$t('SavedSearchConditions')"
                :title="$t('SavedSearchConditions')"
                class="search-history-button search-filter"
                size="small"
              >
                <svg-icon icon-class="history" />
              </el-button>
            </template>
            <div class="search-history-menu">
              <div class="search-history-menu__header">
                {{ $t('SavedSearchHistoryHint') }}
              </div>
              <el-tooltip
                v-for="preset in savedSearchPresets"
                :key="preset.id"
                :content="getSearchPresetDisplayTitle(preset)"
                :show-after="300"
                placement="top-start"
                popper-class="search-history-detail-popper"
              >
                <div
                  class="search-history-menu__item"
                  role="button"
                  tabindex="0"
                  @click="applySearchPreset(preset)"
                  @keydown.enter.prevent="applySearchPreset(preset)"
                >
                  <span class="search-history-menu__name">{{ preset.name }}</span>
                  <button
                    :aria-label="$t('Delete')"
                    class="search-history-menu__delete"
                    type="button"
                    @click.stop="removeSearchPreset(preset.id)"
                  >
                    <el-icon><Delete /></el-icon>
                  </button>
                </div>
              </el-tooltip>
            </div>
          </el-popover>
          <DatetimeRangePicker
            v-bind="datePicker"
            v-if="hasDatePicker"
            class="datepicker search-filter"
            @date-change="handleDateChange"
          />
          <el-tooltip
            v-if="hasQuickFilter"
            :content="$t('Filter')"
            :show-after="300"
            placement="top"
          >
            <el-button
              :aria-pressed="quickFilterExpand"
              :class="{ 'is-active': quickFilterExpand }"
              :title="$t('Filter')"
              class="quick-filter-toggle search-filter"
              @click="$emit('update:quick-filter-expand', !quickFilterExpand)"
            >
              <svg-icon icon-class="filter" />
            </el-button>
          </el-tooltip>
        </div>
      </slot>
    </div>

    <div v-if="activeSearchConditions.length" class="condition-bar">
      <div v-if="activeSearchConditions.length" class="condition-bar__active">
        <el-tag
          v-for="condition in activeSearchConditions"
          :key="condition.id"
          :title="condition.title"
          class="condition-chip"
          closable
          disable-transitions
          effect="plain"
          @close="removeSearchCondition(condition)"
        >
          <span class="condition-chip__text">
            <span v-if="condition.displayKey" class="condition-chip__key">
              {{ condition.displayKey }}
              <span v-if="!condition.displayOperator">:</span>
            </span>
            <span v-if="condition.displayOperator" class="condition-chip__operator">
              {{ condition.displayOperator }}
            </span>
            <span class="condition-chip__value">
              {{ condition.displayValue }}
            </span>
          </span>
        </el-tag>
        <button class="condition-bar__action" type="button" @click="clearAllSearchConditions">
          {{ $t('SearchConditionsClear') }}
        </button>
        <el-popover
          v-model:visible="presetSaveVisible"
          :width="320"
          placement="bottom-start"
          popper-class="search-preset-popper"
          trigger="click"
          @show="handlePresetSaveShow"
        >
          <template #reference>
            <button class="condition-bar__action" type="button">
              {{ $t('SearchConditionsSave') }}
            </button>
          </template>
          <div class="search-preset-editor">
            <el-input
              ref="presetNameInput"
              v-model="presetName"
              :placeholder="$t('SearchPresetNamePlaceholder')"
              clearable
              @keyup.enter="saveSearchPreset"
            />
            <el-button
              :disabled="!presetName.trim()"
              class="search-preset-editor__save"
              type="primary"
              @click="saveSearchPreset"
            >
              {{ $t('SearchConditionsSave') }}
            </el-button>
          </div>
        </el-popover>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import LeftSide from './LeftSide.vue'
import RightSide from './RightSide.vue'
import AutoDataSearch from '@/components/Table/AutoDataSearch/index.vue'
import DatetimeRangePicker from '@/components/Form/FormFields/DatetimeRangePicker.vue'
import { getDaysAgo, getDaysFuture } from '@/utils/common/time'
import LabelSearch from '@/components/Table/ListTable/TableAction/LabelSearch.vue'
import NodeSearch from '@/components/Table/ListTable/TableAction/NodeSearch.vue'
import { ObjectLocalStorage } from '@/utils/common/objectLocalStorage'

const defaultTrue = { type: Boolean, default: true }
const defaultFalse = { type: Boolean, default: false }
export default {
  name: 'TableAction',
  components: {
    LabelSearch,
    NodeSearch,
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
    hasNodeSearch: defaultFalse,
    hasQuickFilter: defaultFalse,
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
    labelSearchConfig: {
      type: Object,
      default: () => ({})
    },
    nodeSearchConfig: {
      type: Object,
      default: () => ({})
    },
    tableUrl: {
      type: String,
      default: ''
    },
    getTableMetadata: {
      type: Function,
      default: null
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
      leftSideRenderVersion: 0,
      tagSearchQuery: {},
      tagConditions: [],
      labelSearchQuery: {},
      labelConditions: [],
      nodeSearchQuery: {},
      nodeCondition: null,
      nodeSelectionSnapshot: null,
      savedSearchPresets: [],
      applyingSearchPreset: false,
      presetSaveVisible: false,
      presetName: '',
      searchHistoryVisible: false
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
    },
    searchPresetStorageKey() {
      try {
        return new URL(this.tableUrl || this.$route.path, 'http://jumpserver.local').pathname
      } catch {
        return this.tableUrl || this.$route.path || 'default'
      }
    },
    activeSearchConditions() {
      return [
        ...this.tagConditions.map((condition) => {
          const fieldLabel =
            condition.label ||
            (condition.key?.startsWith('search') ? this.$t('Search') : condition.key)
          return {
            ...condition,
            id: `tag:${condition.conditionKey || condition.key}`,
            source: 'tag',
            displayKey: fieldLabel,
            displayOperator: this.getConditionOperatorLabel(condition),
            displayValue:
              condition.valueLabel !== '' && condition.valueLabel != null
                ? condition.valueLabel
                : condition.value
          }
        }),
        ...this.labelConditions,
        ...(this.nodeCondition ? [this.nodeCondition] : [])
      ]
    },
    searchHistoryPopperOptions() {
      return {
        modifiers: [
          {
            name: 'flip',
            enabled: false
          },
          {
            name: 'preventOverflow',
            options: {
              mainAxis: false,
              altAxis: false,
              tether: false
            }
          }
        ]
      }
    }
  },
  watch: {
    selectedRows: {
      handler() {
        this.leftSideRenderVersion += 1
      },
      deep: true
    },
    searchPresetStorageKey: {
      handler() {
        this.loadSavedSearchPresets()
      },
      immediate: true
    }
  },
  created() {
    this.$emit('done')
  },
  methods: {
    focusSearch() {
      return this.$refs.autoDataSearch?.focusSearch()
    },
    closeNodeSearch() {
      return this.$refs.nodeSearch?.closePopover()
    },
    handleTagSearch(val) {
      this.tagSearchQuery = val || {}
      this.searchWithFilters()
    },
    handleTagConditionsChange(conditions) {
      this.tagConditions = conditions || []
    },
    handleDateChange(val) {
      this.datePick(val)
    },
    handleLabelSearch(val, selection) {
      if (!val || val.length === 0) {
        this.labelSearchQuery = {}
        this.labelConditions = []
        this.searchWithFilters()
        return
      }

      const selectedLabels = Array.isArray(selection)
        ? selection
        : val.split(',').map((label) => {
            const separatorIndex = label.lastIndexOf(':')
            return [label.slice(0, separatorIndex), label.slice(separatorIndex + 1)]
          })
      this.labelSearchQuery = { labels: val }
      this.labelConditions = selectedLabels.map(([key, value]) => {
        const displayValue =
          value === '*'
            ? `${this.$t('LabelFilterKeyLabel')} ${key}`
            : `${this.$t('LabelFilterKeyLabel')} ${key}/${this.$t(
                'LabelFilterValueLabel'
              )} ${value}`
        return {
          id: `label:${key}:${value}`,
          source: 'label',
          displayKey: this.$t('Label'),
          displayValue,
          value: `${key}:${value}`,
          title: `${this.$t('Label')}: ${displayValue}`
        }
      })
      this.searchWithFilters()
    },
    handleNodeSearch(val, snapshot) {
      this.nodeSearchQuery = val || {}
      this.nodeSelectionSnapshot = snapshot || null
      this.nodeCondition = snapshot
        ? {
            id: 'node',
            source: 'node',
            displayKey: this.$t('NodeFilterConditionLabel'),
            displayValue: snapshot.label,
            title: `${this.$t('NodeFilterConditionLabel')}: ${snapshot.label}`
          }
        : null
      this.searchWithFilters()
    },
    searchWithFilters() {
      if (this.applyingSearchPreset) {
        return
      }
      this.searchTable({
        ...this.tagSearchQuery,
        ...this.labelSearchQuery,
        ...this.nodeSearchQuery
      })
    },
    handleLabelSearchShowChange() {
      // 标签搜索的展开不应联动折叠旁边的普通搜索框(action-search)——两者相互独立。
      // 原先 `this.foldSearch = val` 会在标签搜索展开时把 action-search 折成图标并一直保持。
    },
    handleActionsDone(actions) {
      this.iHasLeftActions = actions.filter((i) => i && i.has !== false).length > 0
    },
    removeSearchCondition(condition) {
      if (condition.source === 'tag') {
        this.$refs.autoDataSearch?.removeCondition(condition.conditionKey || condition.key)
      } else if (condition.source === 'label') {
        this.$refs.labelSearch?.removeLabel(condition.value)
      } else if (condition.source === 'node') {
        this.$refs.nodeSearch?.clearSelection()
      }
    },
    clearAllSearchConditions() {
      this.$refs.autoDataSearch?.clearConditions()
      this.$refs.labelSearch?.clearSelection()
      this.$refs.nodeSearch?.clearSelection()
    },
    getSearchPresetPayload() {
      return {
        tagConditions: _.cloneDeep(this.tagConditions),
        tagSearchQuery: _.cloneDeep(this.tagSearchQuery),
        labelSelection: this.$refs.labelSearch?.getSelectionSnapshot?.() || [],
        nodeSelection: _.cloneDeep(this.nodeSelectionSnapshot)
      }
    },
    getConditionOperator(condition) {
      let operator = condition?.operator
      const values = String(condition?.value || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
      if (condition?.key?.startsWith('search') && values.length <= 1) {
        operator = 'icontains'
      }
      return operator
    },
    getConditionOperatorLabel(condition) {
      const operator = this.getConditionOperator(condition)
      const labels = {
        exact: this.$t('SearchOperatorEquals'),
        icontains: this.$t('SearchOperatorContains'),
        startswith: this.$t('SearchOperatorStartsWith'),
        icontains_any: this.$t('SearchOperatorContainsAny'),
        icontains_all: this.$t('SearchOperatorContainsAll'),
        in: this.$t('SearchOperatorEqualsAny')
      }
      return labels[operator] || ''
    },
    getTagConditionTitle(condition, preset) {
      const baseLabel =
        condition?.label ||
        (condition?.key?.startsWith('search') ? this.$t('Search') : condition?.key || '')
      const operatorLabel = this.getConditionOperatorLabel(condition)
      const label = operatorLabel ? `${baseLabel} ${operatorLabel}`.trim() : baseLabel
      let value =
        condition?.valueLabel !== '' && condition?.valueLabel != null
          ? condition.valueLabel
          : condition?.value

      if ((value === '' || value == null) && preset?.tagSearchQuery) {
        const queryKey = Object.keys(preset.tagSearchQuery).find((key) => {
          return (
            key === condition?.key ||
            key.replace(/__(?:exact|icontains|icontains_any|icontains_all|in)$/, '') ===
              condition?.key
          )
        })
        value = queryKey ? preset.tagSearchQuery[queryKey] : value
      }

      if (value === '' || value == null) {
        return label
      }
      return label ? `${label}: ${value}` : String(value)
    },
    getSearchPresetConditionTitles(preset) {
      const tagTitles = (preset?.tagConditions || [])
        .map((condition) => this.getTagConditionTitle(condition, preset))
        .filter(Boolean)
      const labelTitles = (preset?.labelSelection || []).map((selection) => {
        if (!Array.isArray(selection)) {
          return `${this.$t('Label')}: ${selection}`
        }
        const [key, value] = selection
        const displayValue = value === '*' ? this.$t('LabelFilterAllValues') : value
        return `${key}: ${displayValue}`
      })
      const nodeTitles = preset?.nodeSelection?.label
        ? [`${this.$t('NodeFilterConditionLabel')}: ${preset.nodeSelection.label}`]
        : []

      return [...tagTitles, ...labelTitles, ...nodeTitles]
    },
    getSearchPresetSummary(preset) {
      if (preset?.summary) {
        return preset.summary
      }
      return this.getSearchPresetConditionTitles(preset).join(' · ')
    },
    getSearchPresetDisplayTitle(preset) {
      const conditionTitles = this.getSearchPresetConditionTitles(preset)
      if (conditionTitles.length) {
        return conditionTitles.join('\n')
      }

      const summary = this.getSearchPresetSummary(preset)
      return summary && summary !== preset.name
        ? summary
            .split(/\s*·\s*/)
            .filter(Boolean)
            .join('\n')
        : ''
    },
    handlePresetSaveShow() {
      this.presetName = ''
      this.$nextTick(() => this.$refs.presetNameInput?.focus())
    },
    saveSearchPreset() {
      const payload = this.getSearchPresetPayload()
      const summary = this.getSearchPresetSummary(payload)
      const name = this.presetName.trim()
      if (!name) {
        return
      }
      const existing = this.savedSearchPresets.find((preset) => preset.name === name)
      const preset = {
        id: existing?.id || `${Date.now()}`,
        name,
        ...payload,
        summary
      }
      this.savedSearchPresets = [
        preset,
        ...this.savedSearchPresets.filter((item) => item.id !== preset.id)
      ]
      this.persistSearchPresets()
      this.presetSaveVisible = false
      this.presetName = ''
    },
    async applySearchPreset(preset) {
      this.searchHistoryVisible = false
      this.applyingSearchPreset = true
      this.$refs.autoDataSearch?.applyConditions(preset.tagConditions || [])
      this.$refs.labelSearch?.applySelectionSnapshot(preset.labelSelection || [])
      await this.$refs.nodeSearch?.applySelectionSnapshot(preset.nodeSelection)
      await this.$nextTick()
      this.applyingSearchPreset = false
      this.searchWithFilters()
    },
    removeSearchPreset(id) {
      this.savedSearchPresets = this.savedSearchPresets.filter((preset) => preset.id !== id)
      this.persistSearchPresets()
    },
    loadSavedSearchPresets() {
      const storage = new ObjectLocalStorage('tableSearchPresets')
      const presets = storage.get(this.searchPresetStorageKey, [])
      this.savedSearchPresets = Array.isArray(presets) ? presets : []
    },
    persistSearchPresets() {
      const storage = new ObjectLocalStorage('tableSearchPresets')
      storage.set(this.searchPresetStorageKey, this.savedSearchPresets)
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

.table-action {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

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
    --data-actions-gap: 5px;

    display: inline-flex;
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
    align-items: center;
    gap: 2px;
    min-width: 0;

    .search-primary {
      margin-right: 6px;
    }

    &.has-label-filter .search-primary {
      margin-left: 6px;
    }

    // 搜索框与前后的图标按钮保持清晰间距。
    .right-side-item.action-search {
      flex: 0 0 280px;
      box-sizing: border-box;
      width: 280px;
      min-height: 30px;
      min-width: 280px;
      max-width: 280px;
      font-size: 13px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      overflow: hidden;
      outline: none;
      box-shadow: none;
      transition: none;

      &:hover,
      &:focus,
      &:focus-visible,
      &:focus-within {
        border-color: var(--color-border) !important;
        outline: none;
        box-shadow: none !important;
      }
    }

    .right-side-item.action-search.is-folded {
      flex: 0 0 auto;
      width: auto;
      height: 30px;
      min-width: 30px;
      border: 0;
      overflow: visible;
    }

    .quick-filter-toggle,
    .search-history-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: 30px;
      min-width: 30px;
      height: 30px;
      margin: 0;
      padding: 0;
      color: var(--color-text-primary) !important;
      border: 0;
      border-radius: 4px;
      background-color: transparent;

      .svg-icon {
        width: 13px;
        height: 13px;
        margin: 0;
        color: inherit !important;
        fill: currentColor !important;
        opacity: 1;
      }

      &:hover {
        color: var(--color-text-primary) !important;
        background-color: rgba(0, 0, 0, 0.05);
      }

      &.is-active {
        color: var(--color-text-primary) !important;
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
  }

  .search.left {
    justify-content: flex-start;
    margin-right: auto;
    margin-left: 0;
    padding: 0 !important;
  }

  .search.right {
    display: flex;
    flex-wrap: nowrap;
    padding-right: 0;
  }
}

.table-action__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  gap: 10px 4px;

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
  flex: 0 1 auto;
  min-width: 0;
  margin-left: auto;
}

.right-side {
  order: 3;
}

@media (max-width: 1100px) {
  .table-action__toolbar {
    display: grid;
    grid-template-columns: auto auto minmax(0, 1fr);
    align-items: center;
    gap: 12px 4px;

    .left-side {
      grid-row: 1;
      grid-column: 1 / -1;
      justify-self: start;
    }

    .search {
      grid-row: 1;
      grid-column: 1;
      justify-content: flex-start;
      justify-self: start;
      margin-left: 0;
      gap: 2px;

      .right-side-item.action-search {
        flex: 0 0 clamp(240px, 28vw, 280px);
        width: clamp(240px, 28vw, 280px);
        min-width: clamp(240px, 28vw, 280px);
        max-width: clamp(240px, 28vw, 280px);
      }
    }

    .right-side {
      grid-row: 1;
      grid-column: 2;
      align-self: center;
      justify-self: start;
    }

    &.has-left-actions {
      .search,
      .right-side {
        grid-row: 2;
      }
    }
  }

  .table-action__toolbar.mobile .search {
    justify-content: flex-start;
    gap: 2px;
  }
}

@media (max-width: 640px) {
  .table-action__toolbar {
    grid-template-columns: minmax(0, 1fr);

    .search {
      grid-row: 1;
      grid-column: 1;
      justify-content: flex-start;
      justify-self: start;
      width: 100%;
      min-width: 0;

      .right-side-item.action-search {
        flex: 1 1 0;
        width: 0;
        min-width: 0;
        max-width: 100%;
      }

      .search-filter,
      .quick-filter-toggle,
      .search-history-button {
        flex: 0 0 auto;
      }
    }

    .right-side {
      grid-row: 2;
      grid-column: 1;
      justify-self: start;
    }

    &.has-left-actions {
      .search {
        grid-row: 2;
      }

      .right-side {
        grid-row: 3;
      }
    }
  }

  .table-action__toolbar.mobile .search {
    justify-content: flex-start;
  }
}

.condition-bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background-color: #fff;

  &__active,
  &__saved {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
  }

  &__title {
    margin-right: 2px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    flex: 0 0 auto;
  }

  &__action {
    height: auto;
    padding: 0 2px;
    color: var(--el-text-color-placeholder);
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.4;
    border: 0;
    background: transparent;
    cursor: pointer;

    &:hover {
      color: var(--el-text-color-primary);
    }
  }
}

.condition-chip {
  height: 28px;
  padding: 0 8px;
  color: var(--el-text-color-regular);
  line-height: 26px;
  border-color: var(--el-border-color);
  background-color: transparent;
  max-width: min(480px, 100%);
  cursor: pointer;

  :deep(.el-tag__content) {
    display: inline-flex;
    align-items: center;
    height: 100%;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover {
    color: var(--el-text-color-regular);
    border-color: var(--el-border-color);
    background-color: var(--el-fill-color-light);
  }

  :deep(.el-tag__close) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    margin-left: 6px;
    color: var(--el-text-color-primary) !important;
    font-size: 10px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.08);

    &:hover {
      color: #000 !important;
      background-color: rgba(0, 0, 0, 0.16);
    }
  }
}

.condition-chip {
  :deep(.el-tag__content) {
    line-height: inherit;
  }

  &__text {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__key {
    color: var(--el-text-color-secondary);
    cursor: text;
    user-select: text;
  }

  &__operator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    margin: 0 7px;
    padding: 3px 5px;
    color: var(--el-text-color-primary);
    font-size: 11px;
    font-weight: 500;
    line-height: 10px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    background-color: var(--el-fill-color-light);
    box-shadow: inset 0 -1px 0 var(--el-border-color-lighter);
    cursor: default;
    flex: 0 0 auto;
  }

  &__value {
    color: var(--el-text-color-primary);
    cursor: text;
    user-select: text;
  }
}

.search-preset-editor {
  display: flex;
  align-items: center;
  gap: 8px;

  :deep(.el-input) {
    min-width: 0;
    flex: 1 1 auto;
  }

  :deep(.el-input__wrapper),
  :deep(.el-input__wrapper:hover),
  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--el-border-color) inset !important;
  }

  &__save {
    flex: 0 0 auto;
  }
}

.export-item {
  display: block;
  padding: 5px 20px;
}
</style>

<style lang="scss">
.search-history-popper {
  width: max-content !important;
  min-width: 110px !important;
  max-width: min(210px, calc(100vw - 32px)) !important;
  padding: 6px !important;

  .search-history-menu {
    width: max-content;
    min-width: 98px;
    max-width: min(198px, calc(100vw - 44px));
    max-height: min(300px, calc(100vh - 160px));
    overflow: auto;

    &__header {
      position: sticky;
      top: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      height: 32px;
      margin-bottom: 4px;
      padding: 0 8px;
      color: var(--el-text-color-placeholder);
      font-size: 12px;
      white-space: nowrap;
      border-bottom: 1px solid var(--el-border-color-lighter);
      background-color: #fff;
    }

    &__item {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      height: 34px;
      padding: 0 8px;
      color: var(--el-text-color-regular);
      border-radius: 3px;
      cursor: pointer;
      outline: none;

      &:hover,
      &:focus-visible {
        color: var(--el-text-color-primary);
        background-color: var(--el-fill-color-light);
      }

      &:hover .search-history-menu__delete,
      &:focus-within .search-history-menu__delete {
        opacity: 1;
      }
    }

    &__name {
      flex: 1 1 auto;
      min-width: 0;
      padding-right: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__delete {
      position: sticky;
      right: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      min-width: 24px;
      height: 24px;
      margin-left: auto;
      padding: 0;
      color: var(--el-text-color-placeholder);
      border: 0;
      border-radius: 3px;
      background-color: inherit;
      cursor: pointer;
      opacity: 0;

      &:hover {
        color: var(--el-color-danger);
        background-color: var(--el-color-danger-light-9);
      }
    }
  }
}

.search-history-detail-popper {
  width: max-content;
  max-width: min(320px, calc(100vw - 32px)) !important;
  line-height: 1.5;
  text-align: left;
  white-space: pre-wrap !important;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
