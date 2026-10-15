<template>
  <div class="table-action">
    <div
      ref="toolbar"
      :class="[device, { 'has-left-actions': iHasLeftActions }]"
      :style="{ '--table-search-input-width': `${searchInputWidth}px` }"
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

        <div
          ref="search"
          :class="[searchClass, { 'has-label-filter': hasLabelSearch }]"
          class="search"
        >
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
            @ready="handleSearchReady"
            @tag-search="handleTagSearch"
          />
          <slot name="search-after" />
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
          :title="isEditingTagCondition(condition) ? '' : condition.title"
          :class="{
            'is-editing': isEditingTagCondition(condition),
            'is-value-hovered': isConditionValueHovered(condition)
          }"
          class="condition-chip"
          closable
          disable-transitions
          effect="plain"
          @close="removeSearchCondition(condition)"
        >
          <span v-if="isEditingTagCondition(condition)" class="condition-chip__editor" @click.stop>
            <span v-if="condition.displayKey" class="condition-chip__key">
              {{ condition.displayKey }}
              <span v-if="!condition.displayOperator">:</span>
            </span>
            <span v-if="condition.displayOperator" class="condition-chip__operator">
              {{ condition.displayOperator }}
            </span>
            <el-select
              v-if="conditionEditorConfig.type === 'select'"
              v-model="conditionEditorValue"
              :collapse-tags="conditionEditorConfig.multiple"
              :max-collapse-tags="1"
              :multiple="conditionEditorConfig.multiple"
              :show-arrow="false"
              class="condition-chip__select"
              popper-class="tag-search-field-popper condition-chip-value-popper"
              @change="handleConditionSelectChange"
              @keydown.esc.stop.prevent="cancelTagConditionEdit"
              @visible-change="handleConditionSelectVisibleChange"
            >
              <el-option
                v-for="option in conditionEditorConfig.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
                <span
                  :class="conditionEditorConfig.multiple ? 'has-checkbox' : 'has-radio'"
                  class="field-menu-option"
                >
                  <span
                    v-if="conditionEditorConfig.multiple"
                    :class="{ 'is-checked': isConditionEditorOptionSelected(option.value) }"
                    aria-hidden="true"
                    class="choice-value-checkbox"
                  />
                  <span
                    v-else
                    :class="{ 'is-checked': isConditionEditorOptionSelected(option.value) }"
                    aria-hidden="true"
                    class="choice-value-radio"
                  />
                  <span class="field-menu-option__label">{{ option.label }}</span>
                </span>
              </el-option>
            </el-select>
            <el-input
              v-else
              v-model="conditionEditorValue"
              class="condition-chip__input"
              @blur="commitTagConditionEdit"
              @keydown.esc.stop.prevent="cancelTagConditionEdit"
              @keydown.enter.stop="handleConditionEditorEnter"
            />
          </span>
          <span v-else class="condition-chip__text">
            <span v-if="condition.displayKey" class="condition-chip__key">
              {{ condition.displayKey }}
              <span v-if="!condition.displayOperator">:</span>
            </span>
            <span v-if="condition.displayOperator" class="condition-chip__operator">
              {{ condition.displayOperator }}
            </span>
            <span
              :class="{ 'is-editable': condition.source === 'tag' }"
              class="condition-chip__value"
              @click.stop="startEditingTagCondition(condition)"
              @mouseenter="handleConditionValueHover(condition, true)"
              @mouseleave="handleConditionValueHover(condition, false)"
            >
              <span>{{ condition.displayValue }}</span>
              <el-icon v-if="condition.source === 'tag'" class="condition-chip__edit-icon">
                <EditPen />
              </el-icon>
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
const SEARCH_INPUT_WIDTH = 280
const MIN_SEARCH_INPUT_WIDTH = 180
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
      searchInputWidth: SEARCH_INPUT_WIDTH,
      toolbarResizeObserver: null,
      toolbarResizeFrame: null,
      toolbarObservedElements: new Set(),
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
      searchHistoryVisible: false,
      editingTagConditionKey: '',
      conditionEditorConfig: {
        type: 'text',
        multiple: false,
        options: []
      },
      conditionEditorValue: '',
      hoveredTagValueId: '',
      initializationDone: false
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
  mounted() {
    this.updateSearchLayout()
    if (typeof ResizeObserver !== 'undefined') {
      this.toolbarResizeObserver = new ResizeObserver(this.scheduleSearchLayout)
      this.observeToolbarLayout()
    }
    if (!this.hasSearch) {
      this.completeInitialization()
    }
  },
  beforeUnmount() {
    this.toolbarResizeObserver?.disconnect()
    cancelAnimationFrame(this.toolbarResizeFrame)
  },
  updated() {
    this.observeToolbarLayout()
    this.scheduleSearchLayout()
  },
  methods: {
    observeToolbarLayout() {
      const toolbar = this.$refs.toolbar
      if (!toolbar || !this.toolbarResizeObserver) {
        return
      }
      // Action groups change size after permissions, selection and translations
      // resolve, without necessarily changing the toolbar's own dimensions.
      const elements = new Set([toolbar, ...toolbar.children])
      for (const element of this.toolbarObservedElements) {
        if (!elements.has(element)) {
          this.toolbarResizeObserver.unobserve(element)
        }
      }
      for (const element of elements) {
        if (!this.toolbarObservedElements.has(element)) {
          this.toolbarResizeObserver.observe(element)
        }
      }
      this.toolbarObservedElements = elements
    },
    scheduleSearchLayout() {
      if (this.toolbarResizeFrame !== null) {
        return
      }
      this.toolbarResizeFrame = requestAnimationFrame(() => {
        this.toolbarResizeFrame = null
        this.updateSearchLayout()
      })
    },
    updateSearchLayout() {
      const toolbar = this.$refs.toolbar
      const search = this.$refs.search
      const input = this.$refs.autoDataSearch?.$el
      if (!toolbar?.isConnected || !toolbar.clientWidth || !search || !input) {
        return
      }
      const visibleChildren = (element) =>
        Array.from(element.children).filter((child) => child.getClientRects().length > 0)
      const horizontalMargin = (element) => {
        const style = getComputedStyle(element)
        return (parseFloat(style.marginLeft) || 0) + (parseFloat(style.marginRight) || 0)
      }
      const outerWidth = (element) =>
        Math.max(element.getBoundingClientRect().width, element.scrollWidth) +
        horizontalMargin(element)
      const gapWidth = (element, children) =>
        (parseFloat(getComputedStyle(element).columnGap) || 0) * Math.max(0, children.length - 1)
      const toolbarChildren = visibleChildren(toolbar)
      const searchChildren = visibleChildren(search)
      const reservedWidth =
        toolbarChildren
          .filter((child) => child !== search)
          .reduce((sum, child) => sum + outerWidth(child), 0) +
        searchChildren
          .filter((child) => child !== input)
          .reduce((sum, child) => sum + outerWidth(child), 0) +
        gapWidth(toolbar, toolbarChildren) +
        gapWidth(search, searchChildren) +
        horizontalMargin(input)
      // Measure the space around the input, not its current (possibly folded)
      // width. This keeps the decision stable on either side of the threshold.
      const availableWidth = Math.floor(toolbar.clientWidth - reservedWidth)
      this.foldSearch = availableWidth < SEARCH_INPUT_WIDTH
      this.searchInputWidth = Math.max(
        MIN_SEARCH_INPUT_WIDTH,
        Math.min(SEARCH_INPUT_WIDTH, availableWidth)
      )
    },
    completeInitialization() {
      if (this.initializationDone) {
        return
      }
      this.initializationDone = true
      this.$emit('done')
    },
    handleSearchReady() {
      this.completeInitialization()
    },
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
      if (this.isEditingTagCondition(condition)) {
        this.cancelTagConditionEdit()
      }
      if (condition.source === 'tag') {
        this.$refs.autoDataSearch?.removeCondition(condition.conditionKey || condition.key)
      } else if (condition.source === 'label') {
        this.$refs.labelSearch?.removeLabel(condition.value)
      } else if (condition.source === 'node') {
        this.$refs.nodeSearch?.clearSelection()
      }
    },
    isEditingTagCondition(condition) {
      return (
        condition.source === 'tag' &&
        this.editingTagConditionKey === (condition.conditionKey || condition.key)
      )
    },
    startEditingTagCondition(condition) {
      if (condition.source !== 'tag' || this.isEditingTagCondition(condition)) {
        return
      }

      const conditionKey = condition.conditionKey || condition.key
      const config = this.$refs.autoDataSearch?.getConditionEditorConfig(conditionKey)
      if (!config) {
        return
      }

      this.hoveredTagValueId = ''
      this.editingTagConditionKey = conditionKey
      this.conditionEditorConfig = config
      this.conditionEditorValue = Array.isArray(config.value) ? [...config.value] : config.value
      this.$nextTick(() => {
        const editor = this.$el?.querySelector('.condition-chip.is-editing')
        const input = editor?.querySelector('input')
        if (config.type === 'select') {
          input?.focus()
          editor?.querySelector('.el-select__wrapper')?.click()
        } else {
          input?.focus()
          input?.select()
        }
      })
    },
    commitTagConditionEdit() {
      if (!this.editingTagConditionKey) {
        return
      }
      const updated = this.$refs.autoDataSearch?.updateConditionValue(
        this.editingTagConditionKey,
        this.conditionEditorValue
      )
      if (!updated) {
        this.cancelTagConditionEdit()
        return
      }
      this.cancelTagConditionEdit()
    },
    handleConditionEditorEnter(event) {
      if (event?.isComposing || event?.keyCode === 229) {
        return
      }
      event.preventDefault()
      this.commitTagConditionEdit()
    },
    cancelTagConditionEdit() {
      this.editingTagConditionKey = ''
      this.conditionEditorValue = ''
      this.conditionEditorConfig = {
        type: 'text',
        multiple: false,
        options: []
      }
    },
    handleConditionSelectChange() {
      if (!this.conditionEditorConfig.multiple) {
        this.commitTagConditionEdit()
      }
    },
    isConditionEditorOptionSelected(value) {
      const selectedValues = Array.isArray(this.conditionEditorValue)
        ? this.conditionEditorValue
        : [this.conditionEditorValue]
      return selectedValues.some((item) => String(item) === String(value))
    },
    isConditionValueHovered(condition) {
      return condition.source === 'tag' && this.hoveredTagValueId === condition.id
    },
    handleConditionValueHover(condition, hovered) {
      if (condition.source !== 'tag') {
        return
      }
      this.hoveredTagValueId = hovered ? condition.id : ''
    },
    handleConditionSelectVisibleChange(visible) {
      if (visible) {
        return
      }
      if (this.conditionEditorConfig.multiple) {
        this.commitTagConditionEdit()
      } else {
        this.cancelTagConditionEdit()
      }
    },
    clearAllSearchConditions() {
      this.cancelTagConditionEdit()
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
.table-action {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.table-header {
  .left-side {
    --data-actions-gap: 5px;

    display: inline-flex;

    :deep(.action-item.el-dropdown > .el-button),
    :deep(.action-item.el-button) {
      min-height: 30px;
    }
  }

  .right-side {
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

    .search-filter {
      flex: 0 0 auto;
    }

    .search-primary {
      margin-right: 6px;
    }

    &.has-label-filter .search-primary {
      margin-left: 6px;
    }

    // 搜索框与前后的图标按钮保持清晰间距。
    .right-side-item.action-search {
      flex: 0 1 var(--table-search-input-width, 280px);
      box-sizing: border-box;
      width: var(--table-search-input-width, 280px);
      min-height: 30px;
      min-width: 180px;
      max-width: 280px;
      font-size: 13px;
      border: 1px solid var(--color-border);
      border-radius: var(--list-corner-radius, 4px);
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
      flex: 0 0 30px;
      width: 30px;
      height: 30px;
      min-width: 30px;
      max-width: 30px;
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
      border-radius: var(--list-corner-radius, 4px);
      background-color: transparent;

      .svg-icon {
        width: 13px;
        height: 13px;
        margin: 0;
        color: inherit !important;
        fill: currentColor !important;
        opacity: 1;
      }

      &:hover,
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

  :deep(.el-button:not(.is-circle)) {
    border-radius: var(--list-corner-radius, 4px);
  }

  :deep(.el-button-group) {
    border-radius: var(--list-corner-radius, 4px);
  }

  :deep(.el-button-group .el-button) {
    border-radius: 0;
  }

  :deep(.el-button-group > .el-button:first-child) {
    border-radius: var(--list-corner-radius, 4px) 0 0 var(--list-corner-radius, 4px);
  }

  :deep(.el-button-group > .el-button:last-child) {
    border-radius: 0 var(--list-corner-radius, 4px) var(--list-corner-radius, 4px) 0;
  }

  :deep(.el-button-group > .el-button:only-child) {
    border-radius: var(--list-corner-radius, 4px);
  }
}

.left-side {
  flex: 0 0 auto;
  order: 1;
  align-self: flex-start;
}

.search {
  order: 2;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 100%;
  margin-left: auto;
}

.right-side {
  flex: 0 0 auto;
  order: 3;
}

.condition-bar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--panel-border-color, var(--el-border-color));
  border-radius: var(--list-corner-radius, 4px);
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
  cursor: default;

  &.is-editing {
    max-width: min(560px, 100%);
    background-color: var(--el-fill-color-light);
  }

  :deep(.el-tag__content) {
    display: inline-flex;
    align-items: center;
    height: 100%;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: inherit;
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

  &__text {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__editor {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    height: 100%;
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
    display: inline-flex;
    align-items: center;
    color: var(--el-text-color-primary);
    user-select: text;

    &.is-editable {
      cursor: pointer;
    }
  }

  &__edit-icon {
    display: none;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    margin-left: 6px;
    color: var(--el-text-color-primary);
    font-size: 10px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.08);
    flex: 0 0 auto;
  }

  &.is-value-hovered {
    :deep(.el-tag__close) {
      display: none;
    }

    .condition-chip__edit-icon {
      display: inline-flex;
    }
  }

  &__input,
  &__select {
    width: 180px;
    min-width: 90px;
    height: 24px;
  }

  :deep(.condition-chip__input .el-input__wrapper),
  :deep(.condition-chip__select .el-select__wrapper) {
    min-height: 24px;
    padding-top: 0;
    padding-bottom: 0;
    background-color: #fff;
    box-shadow: 0 0 0 1px var(--el-border-color) inset !important;
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

.condition-chip-value-popper {
  .el-select-dropdown {
    width: max-content;
    min-width: 180px;
  }

  .el-select-dropdown__wrap {
    max-height: min(300px, calc(100vh - 160px));
  }

  .el-select-dropdown__list {
    min-height: 0;
    padding: 0;
  }

  .el-select-dropdown__item {
    width: max-content;
    min-width: 100%;
    height: 36px;
    padding: 0;
    color: var(--el-text-color-regular);
    font-weight: 400;
    line-height: normal;
    overflow: visible;

    &.is-selected {
      color: var(--el-text-color-regular);
      font-weight: 400;
      background-color: transparent;
    }

    &.is-hovering,
    &:hover,
    &:focus-visible {
      color: var(--el-text-color-regular);
      background-color: var(--el-fill-color-light);
      outline: none;
    }
  }

  &.el-select__popper .el-select-dropdown.is-multiple .el-select-dropdown__item.is-selected::after {
    display: none;
  }
}
</style>
