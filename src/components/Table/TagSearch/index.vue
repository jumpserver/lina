<template>
  <div
    :class="{
      'has-options': selectorOptions.length > 0,
      'has-selected-field': hasSelectedField,
      'has-search-action': showSearchAction,
      'is-input-focus': isFocus
    }"
    class="filter-field"
  >
    <div
      v-show="selectorOptions.length > 0"
      :class="{
        'is-empty': !hasSelectedField,
        'is-open': cascaderVisible
      }"
      class="filter-selector"
      @click.capture.stop.prevent="keepFilterMenuOpen"
    >
      <span v-if="hasSelectedField" :title="filterSelectorLabel" class="filter-selector__label">
        {{ filterSelectorLabel }}
      </span>

      <el-cascader
        ref="Cascade"
        v-model="fieldMenuValue"
        :aria-label="$t('Filter')"
        class="filter-cascader"
        :fallback-placements="['bottom-start']"
        :options="selectorOptions"
        placement="bottom-start"
        :popper-options="fieldMenuPopperOptions"
        :props="cascaderConfig"
        popper-class="tag-search-field-popper"
        @change="handleMenuItemChange"
        @visible-change="handleCascaderVisibleChange"
      >
        <template #default="{ node, data }">
          <span
            :class="{
              'has-checkbox': isMultiChoiceNode(node),
              'has-radio': isSingleChoiceNode(node),
              'is-current-field': isCurrentFieldOption(node, data)
            }"
            class="field-menu-option"
            @click="handleFieldOptionClick($event, node, data)"
          >
            <span
              v-if="isMultiChoiceNode(node)"
              :class="{ 'is-checked': isChoiceValueSelected(node, data) }"
              aria-hidden="true"
              class="choice-value-checkbox"
            />
            <span
              v-if="isSingleChoiceNode(node)"
              :class="{ 'is-checked': isSingleChoiceValueSelected(node, data) }"
              aria-hidden="true"
              class="choice-value-radio"
            />
            <span class="field-menu-option__label">{{ data.label }}</span>
          </span>
        </template>
      </el-cascader>
    </div>

    <el-dropdown
      v-if="supportsOperatorSelection"
      ref="OperatorDropdown"
      :class="{ 'is-open': operatorMenuVisible }"
      :hide-timeout="100"
      :show-timeout="0"
      class="filter-selector operator-selector"
      placement="bottom-start"
      popper-class="tag-search-operator-popper"
      trigger="click"
      @command="handleOperatorChange"
      @visible-change="handleOperatorVisibleChange"
    >
      <span :aria-label="operatorLabel" :title="operatorLabel" class="operator-selector__trigger">
        <span class="operator-selector__symbol">{{ operatorSymbol }}</span>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <li class="operator-menu__title" role="presentation">
            {{ $t('SearchOperatorTitle') }}
          </li>
          <template v-for="(group, groupIndex) in operatorGroups" :key="group.label">
            <li
              :class="{ 'is-divided': groupIndex > 0 }"
              class="operator-menu__group-title"
              role="presentation"
            >
              {{ group.label }}
            </li>
            <el-dropdown-item
              v-for="option in group.options"
              :key="option.value"
              :class="{ 'is-active': option.value === filterOperator }"
              :command="option.value"
            >
              <el-tooltip
                :content="getOperatorDescription(option.value)"
                :show-after="300"
                placement="right"
              >
                <span class="operator-option__content">
                  <span class="operator-option__label">{{ option.label }}</span>
                  <span class="operator-option__symbol">{{ option.symbol }}</span>
                </span>
              </el-tooltip>
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <span
      v-else-if="hasOperatorDisplay"
      :aria-label="operatorLabel"
      :title="operatorLabel"
      class="filter-selector operator-selector operator-selector--static"
    >
      <span class="operator-selector__symbol">{{ operatorSymbol }}</span>
    </span>

    <el-input
      ref="SearchInput"
      v-model="filterValue"
      class="search-input jms-input-spacing"
      :class="selectorOptions.length > 0 ? '' : 'no-options'"
      :placeholder="placeholder"
      :validate-event="false"
      @blur="handleBlur"
      @click.stop
      @compositionend="handleCompositionEnd"
      @compositionstart="handleCompositionStart"
      @focus="handleFocus"
      @keydown.backspace="handleFieldBackspace"
      @keydown.down="handleFieldMenuKeydown"
      @keydown.esc.stop.prevent="handleSearchEscape"
      @keyup.enter="handleEnter"
      @mousedown.stop="handleInputMouseDown"
      @mouseup.stop
    >
      <template #suffix>
        <button
          v-if="showClearDraftAction"
          :aria-label="$t('Clear')"
          class="search-submit-button clear-draft-button"
          type="button"
          @click.stop="handleClearSearchDraft"
          @mousedown.stop.prevent
        >
          <el-icon><Close /></el-icon>
        </button>
        <button
          v-else-if="showSearchAction"
          :aria-label="$t('Search')"
          class="search-submit-button"
          type="button"
          @click.stop="handleConfirm"
          @mousedown.stop.prevent
        >
          <el-icon><Search /></el-icon>
        </button>
      </template>
    </el-input>
    <el-tooltip
      :content="placeholder"
      :disabled="!showPlaceholderTooltip"
      :show-after="400"
      :virtual-ref="searchInputElement"
      placement="top"
      popper-class="tag-search-placeholder-tooltip"
      virtual-triggering
    />
    <span v-if="!showSearchAction" class="keydown-focus">/</span>
  </div>
</template>

<script>
const OPERATOR_MENU_FOCUS_DELAY = 320

export default {
  name: 'TagSearch',
  emits: ['blur', 'conditions-change', 'tag-search'],
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    options: {
      type: Array,
      default: () => []
    },
    getUrlQuery: {
      type: Boolean,
      default: () => false
    },
    default: {
      type: Object,
      default: null
    },
    searchConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      filterKey: 'search',
      filterValue: '',
      filterOperator: 'icontains_any',
      searchInputElement: null,
      valueLabel: '',
      fieldMenuValue: null,
      filterTags: this.default || {},
      focus: false,
      showCascade: true,
      isFocus: false,
      cascaderVisible: false,
      fieldMenuOpenTimer: null,
      waitForInputClickToOpenFieldMenu: false,
      pendingFieldFocusSearchInput: false,
      operatorMenuVisible: false,
      pendingOperatorFocusSearchInput: false,
      operatorFocusTimer: null,
      isComposing: false,
      skipNextEnter: false,
      visibilityObserver: null,
      searchInViewport: true,
      restoreFieldMenuOnVisible: false,
      restoreOperatorMenuOnVisible: false
    }
  },
  computed: {
    fieldMenuPopperOptions() {
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
    },
    cascaderConfig() {
      return {
        ...this.config,
        expandTrigger: 'click'
      }
    },
    selectorOptions() {
      return this.options.filter((field) => field.value !== 'search')
    },
    defaultFilterKey() {
      return 'search'
    },
    hasSelectedField() {
      return this.filterKey !== 'search' && !!this.keyLabel
    },
    hasSearchValue() {
      if (typeof this.filterValue === 'string') {
        return this.filterValue.trim() !== ''
      }
      return this.filterValue != null
    },
    showSearchAction() {
      return this.showClearDraftAction || this.focus || this.hasSearchValue
    },
    showClearDraftAction() {
      return this.hasSelectedField && !this.hasSearchValue
    },
    keyLabel() {
      if (!this.filterKey) return ''
      for (const field of this.options) {
        if (field.value === this.filterKey) {
          return field?.label
        }
      }
      return ''
    },
    filterSelectorLabel() {
      return this.keyLabel
    },
    supportsOperatorSelection() {
      return this.hasOperatorDisplay && this.supportedOperators.length > 0
    },
    hasOperatorDisplay() {
      if (!this.hasSelectedField) {
        return false
      }
      return !this.isFixedChoiceOption(this.getOptionByKey(this.filterKey))
    },
    supportedOperators() {
      return this.getSupportedOperators(this.filterKey)
    },
    operatorGroups() {
      const groups = [
        {
          label: this.$t('SearchOperatorSingleValueGroup'),
          options: [
            {
              value: 'icontains',
              symbol: ':',
              label: this.$t('SearchOperatorContains')
            },
            {
              value: 'exact',
              symbol: '=',
              label: this.$t('SearchOperatorEquals')
            },
            {
              value: 'startswith',
              symbol: '^',
              label: this.$t('SearchOperatorStartsWith')
            }
          ]
        },
        {
          label: this.$t('SearchOperatorMultipleValueGroup'),
          options: [
            {
              value: 'icontains_any',
              symbol: 'any',
              label: this.$t('SearchOperatorContainsAny')
            },
            {
              value: 'icontains_all',
              symbol: 'all',
              label: this.$t('SearchOperatorContainsAll')
            },
            {
              value: 'in',
              symbol: 'in',
              label: this.$t('SearchOperatorEqualsAny')
            }
          ]
        }
      ]
      return groups
        .map((group) => ({
          ...group,
          options: group.options.filter((option) => this.supportedOperators.includes(option.value))
        }))
        .filter((group) => group.options.length > 0)
    },
    operatorLabel() {
      return this.getOperatorLabel(this.filterOperator)
    },
    operatorSymbol() {
      return this.getOperatorSymbol(this.filterOperator)
    },
    conditionItems() {
      return Object.entries(this.filterTags).map(([conditionKey, condition]) => ({
        ...condition,
        key: condition.key || conditionKey,
        conditionKey,
        title: this.getTagTitle(condition)
      }))
    },
    filterMaps() {
      const data = {}
      const keyword = 'search'
      const appendValue = (queryKey, value) => {
        const currentValue = data[queryKey]
        if (currentValue === undefined) {
          data[queryKey] = value
        } else {
          data[queryKey] = Array.isArray(currentValue)
            ? [...currentValue, value]
            : [currentValue, value]
        }
      }
      const appendMergedValues = (queryKey, value) => {
        data[queryKey] =
          data[queryKey] === undefined
            ? this.mergeConditionValues(value)
            : this.mergeConditionValues(data[queryKey], value)
      }
      const appendContainsValue = (queryKey, value, forceAll = false) => {
        const baseKey = queryKey.replace(/__(?:icontains|icontains_all)$/, '')
        const containsKey = `${baseKey}__icontains`
        const containsAllKey = `${baseKey}__icontains_all`
        const hasPreviousValue =
          data[containsKey] !== undefined || data[containsAllKey] !== undefined

        if (!forceAll && !hasPreviousValue) {
          data[containsKey] = value
          return
        }
        if (data[containsKey] !== undefined) {
          appendMergedValues(containsAllKey, data[containsKey])
          delete data[containsKey]
        }
        appendMergedValues(containsAllKey, value)
      }
      const appendDefaultSearchBatch = (value) => {
        const batch = this.normalizeConditionValues(value).join('|')
        if (!batch) {
          return
        }
        data[keyword] = data[keyword] ? `${data[keyword]},${batch}` : batch
      }
      for (const conditionKey in this.filterTags) {
        const condition = this.filterTags[conditionKey]
        let key = condition.key || conditionKey
        const value = this.isBooleanOption(this.getOptionByKey(key))
          ? String(condition.value).toLowerCase()
          : condition.value
        if (key === '') {
          key = keyword
        }
        if (key.startsWith(keyword)) {
          const operator = condition.operator || this.getDefaultOperator(key, value)
          if (operator === 'icontains_all') {
            appendValue('search__icontains_all', value)
          } else {
            appendDefaultSearchBatch(value)
          }
        } else {
          const operator = condition.operator || this.getDefaultOperator(key, value)
          const queryKey = this.getQueryKeyForOperator(key, operator)
          if (this.isMethodOption(key)) {
            data[queryKey] = value
          } else if (this.isOverwriteOperator(operator)) {
            data[queryKey] = value
          } else if (operator === 'icontains_all') {
            appendContainsValue(queryKey, value, true)
          } else if (operator === 'icontains') {
            appendContainsValue(queryKey, value)
          } else {
            appendValue(queryKey, value)
          }
        }
      }
      return data
    },
    placeholder() {
      if (!this.focus) {
        return this.$t('SearchShortcutPlaceholder')
      }
      const operator = this.hasSelectedField ? this.filterOperator : 'icontains_any'
      return this.getOperatorDescription(operator)
    },
    showPlaceholderTooltip() {
      const hasInputContent = String(this.filterValue ?? '').length > 0
      return Boolean(
        this.searchInputElement &&
        this.placeholder &&
        !hasInputContent &&
        (!this.cascaderVisible || !this.hasSelectedField) &&
        !this.operatorMenuVisible
      )
    }
  },
  watch: {
    options: {
      handler(newVal, oldVal) {
        if (newVal && newVal.length > 0) {
          if (
            this.filterKey !== this.defaultFilterKey &&
            !newVal.some((field) => field.value === this.filterKey)
          ) {
            this.filterKey = this.defaultFilterKey
          }
          const routeFilter = this.checkInTableColumns(newVal)
          if (oldVal.length > 0 && newVal.length !== oldVal.length) {
            const beforeRouteFilter = this.checkInTableColumns(oldVal)
            // 如果2次过滤的参数相同就不在重复请求
            if (_.isEqual(routeFilter, beforeRouteFilter)) {
              return
            }
          }
          this.filterTagSearch(routeFilter)
        }
      },
      deep: true
    },
    filterTags: {
      handler(newValue) {
        this.$emit('tag-search', this.filterMaps)
        this.$emit('conditions-change', this.conditionItems)
      },
      deep: true,
      immediate: true
    },
    $route(to, from) {
      if (from.query !== to.query) {
        this.filterTags = {}
        if (to.query && Object.keys(to.query).length) {
          const routeFilter = this.checkInTableColumns(this.options)
          this.filterTagSearch(routeFilter)
        }
      }
    }
  },
  mounted() {
    document.addEventListener('keyup', this.handleKeyUp)
    document.addEventListener('keydown', this.handleDocumentKeyDown, true)
    document.addEventListener('pointerdown', this.handleDocumentPointerDown, true)
    this.searchInputElement =
      this.$refs.SearchInput?.input || this.$refs.SearchInput?.$el?.querySelector?.('input') || null
    this.initVisibilityObserver()
  },
  beforeUnmount() {
    document.removeEventListener('keyup', this.handleKeyUp)
    document.removeEventListener('keydown', this.handleDocumentKeyDown, true)
    document.removeEventListener('pointerdown', this.handleDocumentPointerDown, true)
    this.visibilityObserver?.disconnect()
    clearTimeout(this.operatorFocusTimer)
    clearTimeout(this.fieldMenuOpenTimer)
  },
  methods: {
    initVisibilityObserver() {
      if (typeof IntersectionObserver === 'undefined' || !this.$el) {
        return
      }
      this.visibilityObserver = new IntersectionObserver(
        ([entry]) => this.handleSearchVisibilityChange(entry?.isIntersecting === true),
        { threshold: 0 }
      )
      this.visibilityObserver.observe(this.$el)
    },
    handleSearchVisibilityChange(visible) {
      if (visible === this.searchInViewport) {
        return
      }
      this.searchInViewport = visible
      if (!visible) {
        this.restoreFieldMenuOnVisible = this.cascaderVisible
        this.restoreOperatorMenuOnVisible = this.operatorMenuVisible
        if (this.cascaderVisible) {
          this.$refs.Cascade?.togglePopperVisible?.(false)
        }
        if (this.operatorMenuVisible) {
          this.$refs.OperatorDropdown?.handleClose?.()
        }
        return
      }

      const restoreFieldMenu = this.restoreFieldMenuOnVisible
      const restoreOperatorMenu = this.restoreOperatorMenuOnVisible
      this.restoreFieldMenuOnVisible = false
      this.restoreOperatorMenuOnVisible = false
      this.$nextTick(() => {
        if (restoreFieldMenu) {
          this.$refs.Cascade?.togglePopperVisible?.(true)
        } else if (restoreOperatorMenu) {
          this.$refs.OperatorDropdown?.handleOpen?.()
        }
      })
    },
    focusSearch() {
      if (!this.$refs.SearchInput) {
        return false
      }
      this.$refs.SearchInput.focus()
      return true
    },
    handleFocus() {
      this.focus = true
      this.isFocus = true
      if (this.waitForInputClickToOpenFieldMenu) {
        return
      }
      if (!this.hasSelectedField && this.selectorOptions.length > 0) {
        this.scheduleFilterMenuOpen()
      }
    },
    handleInputMouseDown() {
      this.waitForInputClickToOpenFieldMenu = false
      if (!this.cascaderVisible && !this.hasSelectedField && this.selectorOptions.length > 0) {
        this.scheduleFilterMenuOpen()
      }
    },
    handleCompositionStart() {
      this.isComposing = true
    },
    handleCompositionEnd() {
      this.isComposing = false
      // 第一次 Enter 只确认输入法候选词。compositionend 会先于 keyup 触发，
      // 因此跳过紧随其后的 keyup，让第二次 Enter 再执行搜索。
      this.skipNextEnter = true
      setTimeout(() => {
        this.skipNextEnter = false
      }, 300)
    },
    handleEnter(event) {
      if (this.skipNextEnter) {
        this.skipNextEnter = false
        return
      }
      if (this.isComposing || event?.isComposing || event?.keyCode === 229) {
        return
      }
      this.$nextTick(() => this.handleConfirm())
    },
    handleBlur() {
      this.focus = false
      this.isFocus = false
      this.$emit('blur')
    },
    // 获取url中的查询条件，判断是不是包含在当前查询条件里
    checkInTableColumns(options) {
      const searchFieldOptions = {}
      const queryInfoValues = options.map((i) => i.value)
      const routeQuery = this.getUrlQuery ? this.$route?.query : {}
      const routeQueryKeysLength = Object.keys(routeQuery).length
      if (routeQueryKeysLength < 1) return searchFieldOptions

      for (const [key, rawValue] of Object.entries(routeQuery)) {
        const values = Array.isArray(rawValue) ? rawValue : [rawValue]
        for (const value of values) {
          const valueDecode = decodeURI(value)
          const isSearch = ['search', 'search__icontains_any', 'search__icontains_all'].includes(
            key
          )

          if (isSearch) {
            const operator = key === 'search__icontains_all' ? 'icontains_all' : 'icontains_any'
            const batches =
              key === 'search' ? valueDecode.split(',').filter(Boolean) : [valueDecode]
            for (const batch of batches) {
              const conditionKey = this.getUniqueConditionStorageKey(
                'search',
                operator,
                searchFieldOptions
              )
              searchFieldOptions[conditionKey] = {
                key: 'search',
                label: '',
                value: key === 'search' ? batch.replace(/\|/g, ',') : batch,
                operator
              }
            }
            continue
          }

          const normalizedKey = this.getTagKeyFromQueryKey(key)
          if (queryInfoValues.includes(normalizedKey)) {
            const operator = this.getCompatibleOperator(
              this.getOperatorFromQueryKey(key),
              valueDecode,
              normalizedKey
            )
            const conditionKey = this.getUniqueConditionStorageKey(
              normalizedKey,
              operator,
              searchFieldOptions
            )
            searchFieldOptions[conditionKey] = this.getInQueryInfoFields(
              normalizedKey,
              value,
              operator
            )
          }
        }
      }
      return searchFieldOptions
    },
    getInQueryInfoFields(key, value, operator = 'exact') {
      let searchFieldOption = {}
      let valueDecode = decodeURI(value)
      const currentOptions = this.options || []

      for (let k = 0, len = currentOptions.length; k < len; k++) {
        const current = currentOptions[k]
        if (key === current.value) {
          const curChildren = current.children || []
          if (this.isBooleanOption(current)) {
            const normalizedValue = String(valueDecode).toLowerCase()
            if (normalizedValue === 'true' || normalizedValue === 'false') {
              valueDecode = normalizedValue
            }
          }
          searchFieldOption = {
            ...current,
            key,
            label: current.label,
            value: valueDecode,
            operator
          }

          if (curChildren.length > 0) {
            for (const item of curChildren) {
              if (valueDecode === String(item.value)) {
                searchFieldOption.valueLabel = item.label
                break
              }
            }
          }
          break
        }
      }

      return searchFieldOption
    },
    filterTagSearch(routeFilter) {
      const asFilterTags = _.cloneDeep(this.filterTags)
      setTimeout(() => {
        this.filterTags = {
          ...asFilterTags,
          ...routeFilter
        }
      }, 100)
    },
    getValueLabel(key, value) {
      for (const field of this.options) {
        if (field.value !== key) {
          continue
        }
        if (!field.children) {
          continue
        }
        for (const child of field.children) {
          if (String(child.value) === String(value)) {
            return child.label
          }
        }
      }
      return ''
    },
    getTagTitle(tag) {
      let operator = tag?.operator || this.getDefaultOperator(tag?.key, tag?.value)
      if (this.isSearchKey(tag?.key) && !this.hasMultipleConditionValues(tag?.value)) {
        operator = 'icontains'
      }
      const operatorLabel = this.getOperatorLabel(operator)
      const label = tag?.label ? `${tag.label} ${operatorLabel}: ` : `${operatorLabel}: `
      const value =
        tag?.valueLabel !== '' && tag?.valueLabel != null ? tag.valueLabel : (tag?.value ?? '')
      return `${label}${value}`
    },
    normalizeConditionValues(value) {
      const values = Array.isArray(value) ? value : [value]
      return values
        .flatMap((item) => {
          if (typeof item !== 'string') {
            return item == null ? [] : [String(item)]
          }
          return item.split(/[,，\r\n]+/)
        })
        .map((item) => item.trim())
        .filter(Boolean)
    },
    mergeConditionValues(...values) {
      const seen = new Set()
      return values
        .flatMap((value) => this.normalizeConditionValues(value))
        .filter((value) => {
          if (seen.has(value)) {
            return false
          }
          seen.add(value)
          return true
        })
        .join(',')
    },
    hasMultipleConditionValues(value) {
      return this.normalizeConditionValues(value).length > 1
    },
    getOptionByKey(key) {
      return this.options.find((field) => field.value === key)
    },
    getConditionStorageKey(key, operator) {
      return `${key}::${operator}`
    },
    getUniqueConditionStorageKey(key, operator, conditions = this.filterTags) {
      const baseKey = this.getConditionStorageKey(key, operator)
      if (!conditions[baseKey]) {
        return baseKey
      }
      let index = 2
      while (conditions[`${baseKey}::${index}`]) {
        index += 1
      }
      return `${baseKey}::${index}`
    },
    isSearchKey(key = this.filterKey) {
      return !key || key === this.defaultFilterKey || key.startsWith('search_')
    },
    isFixedChoiceOption(option) {
      return (
        option?.type === 'boolean' ||
        option?.type === 'choice' ||
        option?.type === 'labeled_choice' ||
        (option?.children && option.children.length > 0)
      )
    },
    isBooleanOption(option) {
      return option?.type === 'boolean' || option?.isBooleanChoice === true
    },
    isMethodOption(key) {
      return this.getOptionByKey(key)?.custom === true
    },
    isOverwriteOperator(operator) {
      return operator === 'exact' || operator === 'in'
    },
    shouldOverwriteCondition(key, operator) {
      return this.isMethodOption(key) || this.isOverwriteOperator(operator)
    },
    hasExplicitLookup(key) {
      return /__(?:exact|icontains|startswith|in|icontains_any|icontains_all)$/.test(key)
    },
    shouldUseExactQuery(key) {
      const option = this.getOptionByKey(key)
      return this.hasExplicitLookup(key) || this.isFixedChoiceOption(option)
    },
    getQueryKey(key) {
      return this.getQueryKeyForOperator(key, this.shouldUseExactQuery(key) ? 'exact' : 'icontains')
    },
    getMultipleQueryKey(key) {
      return this.getQueryKeyForOperator(key, 'in')
    },
    getQueryKeyForOperator(key, operator) {
      if (this.isMethodOption(key)) {
        return key
      }
      const baseKey = key.replace(
        /__(?:exact|icontains|startswith|in|icontains_any|icontains_all)$/,
        ''
      )
      if (this.options.some((field) => field.value === key) && this.hasExplicitLookup(key)) {
        return key
      }
      if (operator === 'exact') {
        return baseKey
      }
      return `${baseKey}__${operator}`
    },
    getTagKeyFromQueryKey(key) {
      if (this.options.some((field) => field.value === key)) {
        return key
      }
      return key.replace(/__(?:exact|icontains|startswith|in|icontains_any|icontains_all)$/, '')
    },
    getOperatorFromQueryKey(key) {
      const match = key.match(/__(exact|icontains|startswith|in|icontains_any|icontains_all)$/)
      return match?.[1] || 'exact'
    },
    getDefaultOperator(key, value) {
      if (this.isSearchKey(key)) {
        return 'icontains_any'
      }
      if (this.hasExplicitLookup(key)) {
        return this.getOperatorFromQueryKey(key)
      }
      if (this.isFixedChoiceOption(this.getOptionByKey(key))) {
        return this.hasMultipleConditionValues(value) ? 'in' : 'exact'
      }
      const preferredOperator = this.hasMultipleConditionValues(value)
        ? 'icontains_any'
        : 'icontains'
      const supportedOperators = this.getSupportedOperators(key)
      return supportedOperators.includes(preferredOperator)
        ? preferredOperator
        : supportedOperators[0] || preferredOperator
    },
    getCompatibleOperator(operator, value, key = this.filterKey) {
      if (this.isSearchKey(key)) {
        return operator === 'icontains_all' ? 'icontains_all' : 'icontains_any'
      }
      if (this.hasExplicitLookup(key)) {
        return this.getOperatorFromQueryKey(key)
      }
      if (this.isFixedChoiceOption(this.getOptionByKey(key))) {
        return this.hasMultipleConditionValues(value) ? 'in' : 'exact'
      }
      const supportedOperators = this.getSupportedOperators(key)
      return supportedOperators.includes(operator) ? operator : supportedOperators[0] || 'icontains'
    },
    getSupportedOperators(key) {
      if (this.isSearchKey(key)) {
        return Array.isArray(this.searchConfig.operators)
          ? this.searchConfig.operators
          : ['icontains_any']
      }
      if (this.hasExplicitLookup(key)) {
        return [this.getOperatorFromQueryKey(key)]
      }
      const option = this.getOptionByKey(key)
      const operators = Array.isArray(option?.operators)
        ? option.operators
        : ['icontains', 'exact', 'startswith', 'icontains_any', 'icontains_all', 'in']
      return operators.filter((operator) =>
        ['icontains', 'exact', 'startswith', 'icontains_any', 'icontains_all', 'in'].includes(
          operator
        )
      )
    },
    getOperatorLabel(operator) {
      const labels = {
        exact: this.$t('SearchOperatorEquals'),
        icontains: this.$t('SearchOperatorContains'),
        startswith: this.$t('SearchOperatorStartsWith'),
        icontains_any: this.$t('SearchOperatorContainsAny'),
        icontains_all: this.$t('SearchOperatorContainsAll'),
        in: this.$t('SearchOperatorEqualsAny')
      }
      return labels[operator] || labels.icontains
    },
    getOperatorDescription(operator) {
      const descriptions = {
        icontains: this.$t('SearchContainsPlaceholder'),
        exact: this.$t('SearchExactPlaceholder'),
        startswith: this.$t('SearchStartsWithPlaceholder'),
        icontains_any: this.$t('SearchContainsAnyPlaceholder'),
        icontains_all: this.$t('SearchContainsAllPlaceholder'),
        in: this.$t('SearchEqualsAnyPlaceholder')
      }
      return descriptions[operator] || descriptions.icontains
    },
    getOperatorSymbol(operator) {
      const symbols = {
        icontains: ':',
        exact: '=',
        startswith: '^',
        icontains_any: 'any',
        icontains_all: 'all',
        in: 'in'
      }
      return symbols[operator] || symbols.icontains
    },
    handleOperatorChange(operator) {
      this.filterOperator = operator
      this.pendingOperatorFocusSearchInput = true
      this.$nextTick(() => {
        if (!this.operatorMenuVisible) {
          this.focusPendingOperatorSearchInput()
        }
      })
    },
    handleOperatorVisibleChange(visible) {
      this.operatorMenuVisible = visible
      if (!visible) {
        this.focusPendingOperatorSearchInput()
      }
    },
    focusPendingOperatorSearchInput() {
      if (!this.pendingOperatorFocusSearchInput) {
        return
      }
      clearTimeout(this.operatorFocusTimer)
      this.operatorFocusTimer = setTimeout(() => {
        if (!this.pendingOperatorFocusSearchInput) {
          return
        }
        this.pendingOperatorFocusSearchInput = false
        const activeElement = document.activeElement
        const operatorSelector = this.$el?.querySelector?.('.operator-selector')
        const operatorPopper = document.querySelector('.tag-search-operator-popper')
        const canRestoreFocus =
          activeElement === document.body ||
          operatorSelector?.contains(activeElement) ||
          operatorPopper?.contains(activeElement)
        if (canRestoreFocus) {
          this.focusSearchInput()
        }
      }, OPERATOR_MENU_FOCUS_DELAY)
    },
    getConditionQueryKeys(key) {
      if (this.isSearchKey(key)) {
        return ['search', 'search__icontains_any', 'search__icontains_all']
      }
      const baseKey = this.getTagKeyFromQueryKey(key)
      const operators = ['icontains', 'icontains_any', 'icontains_all', 'in']
      return [
        ...new Set([
          key,
          baseKey,
          `${baseKey}__exact`,
          ...operators.map((operator) => this.getQueryKeyForOperator(baseKey, operator))
        ])
      ]
    },
    findOptionPath(value, options = this.options, parentPath = []) {
      for (const option of options) {
        const currentPath = [...parentPath, option.value]
        if (option.value === value) {
          return currentPath
        }
        if (option.children?.length) {
          const childPath = this.findOptionPath(value, option.children, currentPath)
          if (childPath) {
            return childPath
          }
        }
      }
      return null
    },
    normalizeSelectedPath(value) {
      if (Array.isArray(value)) {
        return value
      }
      return this.findOptionPath(value) || [value]
    },
    isCurrentFieldOption(node, option) {
      return this.hasSelectedField && node?.level === 1 && option?.value === this.filterKey
    },
    getCascaderRootValue(node) {
      return (
        node?.pathValues?.[0] ||
        node?.pathNodes?.[0]?.value ||
        node?.parent?.value ||
        node?.parent?.data?.value
      )
    },
    isMultiChoiceNode(node) {
      if (!node || node.level < 2) {
        return false
      }
      const field = this.getOptionByKey(this.getCascaderRootValue(node))
      return (
        !this.isBooleanOption(field) &&
        field?.multiple !== false &&
        ['choice', 'labeled_choice'].includes(field?.type)
      )
    },
    isSingleChoiceNode(node) {
      if (!node || node.level < 2) {
        return false
      }
      const field = this.getOptionByKey(this.getCascaderRootValue(node))
      return (
        this.isBooleanOption(field) ||
        (field?.multiple === false && ['choice', 'labeled_choice'].includes(field?.type))
      )
    },
    getChoiceConditionValues(fieldKey) {
      const values = []
      for (const condition of Object.values(this.filterTags)) {
        if (condition?.key === fieldKey) {
          values.push(...this.normalizeConditionValues(condition.value))
        }
      }
      return [...new Set(values)]
    },
    isChoiceValueSelected(node, option) {
      const fieldKey = this.getCascaderRootValue(node)
      return this.getChoiceConditionValues(fieldKey).includes(String(option.value))
    },
    isSingleChoiceValueSelected(node, option) {
      const fieldKey = this.getCascaderRootValue(node)
      const selectedValues = this.getChoiceConditionValues(fieldKey).map((value) =>
        value.toLowerCase()
      )
      return selectedValues.includes(String(option.value).toLowerCase())
    },
    toggleChoiceValue(node, option) {
      const fieldKey = this.getCascaderRootValue(node)
      const field = this.getOptionByKey(fieldKey)
      if (!field) {
        return
      }
      const selectedValues = this.getChoiceConditionValues(fieldKey)
      const value = String(option.value)
      const nextValues = selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value]

      for (const conditionKey of Object.keys(this.filterTags)) {
        if (this.filterTags[conditionKey]?.key === fieldKey) {
          delete this.filterTags[conditionKey]
        }
      }
      if (nextValues.length === 0) {
        return
      }

      const operator = nextValues.length === 1 ? 'exact' : 'in'
      const valueLabels = nextValues.map((item) => this.getValueLabel(fieldKey, item) || item)
      this.filterTags[this.getConditionStorageKey(fieldKey, operator)] = {
        key: fieldKey,
        label: field.label,
        value: nextValues.join(','),
        valueLabel: valueLabels.join(','),
        operator
      }
    },
    selectSingleChoiceValue(node, option) {
      const fieldKey = this.getCascaderRootValue(node)
      const field = this.getOptionByKey(fieldKey)
      if (!field) {
        return
      }
      for (const conditionKey of Object.keys(this.filterTags)) {
        if (this.filterTags[conditionKey]?.key === fieldKey) {
          delete this.filterTags[conditionKey]
        }
      }
      this.filterTags[this.getConditionStorageKey(fieldKey, 'exact')] = {
        key: fieldKey,
        label: field.label,
        value: String(option.value),
        valueLabel: option.label,
        operator: 'exact'
      }
    },
    handleFieldOptionClick(event, node, option) {
      if (this.isSingleChoiceNode(node)) {
        event.preventDefault()
        event.stopPropagation()
        this.selectSingleChoiceValue(node, option)
        return
      }
      if (this.isMultiChoiceNode(node)) {
        event.preventDefault()
        event.stopPropagation()
        this.toggleChoiceValue(node, option)
        return
      }
      if (!this.isCurrentFieldOption(node, option)) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      this.clearSelectedField()
    },
    handleMenuItemChange(value) {
      if (value == null || (Array.isArray(value) && value.length === 0)) {
        return
      }
      const selectedPath = this.normalizeSelectedPath(value)
      let keepMenuOpen = false
      if (selectedPath.length === 1) {
        this.filterKey = selectedPath[0]
        this.filterOperator =
          this.getSupportedOperators(this.filterKey)[0] ||
          this.getDefaultOperator(this.filterKey, '')
      } else if (selectedPath.length >= 2) {
        this.filterKey = selectedPath[0]
        this.filterValue = selectedPath[selectedPath.length - 1]
        this.filterOperator = this.getDefaultOperator(this.filterKey, this.filterValue)
        this.valueLabel = this.getValueLabel(this.filterKey, this.filterValue)
        this.handleConfirm({ keepFieldMenuOpen: true })
        this.filterKey = this.defaultFilterKey
        keepMenuOpen = true
      }
      this.$nextTick(() => {
        if (keepMenuOpen) {
          setTimeout(() => {
            this.$refs.Cascade?.togglePopperVisible?.(true)
          }, 0)
        } else if (selectedPath.length >= 2) {
          this.clearFieldMenuSelection()
          this.$refs.Cascade?.togglePopperVisible?.(false)
        } else if (selectedPath.length === 1) {
          this.clearFieldMenuSelection()
          this.pendingFieldFocusSearchInput = true
          this.$refs.Cascade?.togglePopperVisible?.(false)
        }
      })
    },
    handleCascaderVisibleChange(visible) {
      this.cascaderVisible = visible
      if (visible || !this.pendingFieldFocusSearchInput) {
        return
      }
      this.pendingFieldFocusSearchInput = false
      this.$nextTick(() => this.focusSearchInput())
    },
    openFilterMenu() {
      this.$refs.Cascade?.togglePopperVisible?.(true)
    },
    scheduleFilterMenuOpen() {
      if (this.cascaderVisible) {
        return
      }
      clearTimeout(this.fieldMenuOpenTimer)
      this.fieldMenuOpenTimer = setTimeout(() => {
        if (!this.cascaderVisible) {
          this.openFilterMenu()
        }
      }, 0)
    },
    keepFilterMenuOpen() {
      this.$refs.Cascade?.togglePopperVisible?.(true)
    },
    handleFieldMenuKeydown(event) {
      if (this.filterValue !== '') {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      this.waitForInputClickToOpenFieldMenu = false

      if (this.hasSelectedField && this.supportsOperatorSelection) {
        this.$refs.Cascade?.togglePopperVisible?.(false)
        this.$refs.OperatorDropdown?.handleOpen?.()
        this.$nextTick(() => {
          setTimeout(() => {
            const firstOperator = document.querySelector(
              '.tag-search-operator-popper .el-dropdown-menu__item:not(.is-disabled)'
            )
            firstOperator?.focus()
          }, 0)
        })
        return
      }

      if (this.selectorOptions.length === 0) {
        return
      }
      const cascader = this.$refs.Cascade
      cascader?.togglePopperVisible?.(true)
      this.$nextTick(() => {
        const firstNode = cascader?.contentRef?.querySelector?.('.el-cascader-node[tabindex="-1"]')
        firstNode?.focus()
        if (firstNode?.getAttribute('aria-haspopup') === 'true') {
          firstNode.click()
        }
      })
    },
    handleFieldBackspace(event) {
      if (this.filterValue !== '' || this.filterKey === this.defaultFilterKey) {
        return
      }
      event.preventDefault()
      this.clearSelectedField()
    },
    clearSelectedField() {
      this.filterKey = this.defaultFilterKey
      this.filterOperator = 'icontains_any'
      this.valueLabel = ''
      this.clearFieldMenuSelection()
      this.$refs.Cascade?.togglePopperVisible?.(false)
      this.$nextTick(() => this.focusSearchInput())
    },
    handleClearSearchDraft() {
      this.filterValue = ''
      this.clearSelectedField()
    },
    clearFieldMenuSelection() {
      this.fieldMenuValue = null
      this.$refs.Cascade?.cascaderPanelRef?.clearCheckedNodes?.()
    },
    handleSearchEscape() {
      this.$refs.Cascade?.togglePopperVisible?.(false)
      this.$nextTick(() => this.$refs.SearchInput?.blur?.())
    },
    focusSearchInput() {
      setTimeout(() => {
        const searchInput = this.$refs.SearchInput
        const nativeInput = searchInput?.input || searchInput?.$el?.querySelector?.('input')
        if (nativeInput) {
          nativeInput.focus()
        } else {
          searchInput?.focus?.()
        }
        this.handleFocus()
      }, 0)
    },
    focusSearchInputAfterSubmit() {
      clearTimeout(this.fieldMenuOpenTimer)
      this.waitForInputClickToOpenFieldMenu = true
      this.pendingFieldFocusSearchInput = false
      this.restoreFieldMenuOnVisible = false
      this.$refs.Cascade?.togglePopperVisible?.(false)
      this.$nextTick(() => this.focusSearchInput())
    },
    handleTagClose(evt) {
      const fieldKey = this.filterTags[evt]?.key || evt
      delete this.filterTags[evt]
      if (this.getUrlQuery) {
        this.checkUrlFields(fieldKey)
      }
      // this.$emit('tagSearch', this.filterMaps)
      return true
    },
    clearConditions() {
      const conditions = this.filterTags
      const conditionKeys = Object.keys(this.filterTags)
      this.filterTags = {}
      if (this.getUrlQuery && conditionKeys.length > 0) {
        const queryKeys = conditionKeys.flatMap((conditionKey) =>
          this.getConditionQueryKeys(conditions[conditionKey]?.key || conditionKey)
        )
        const query = _.omit(this.$route.query, [...queryKeys, 'search'])
        this.$router.replace({ query })
      }
    },
    applyConditions(conditions) {
      this.filterValue = ''
      this.valueLabel = ''
      this.filterTags = (conditions || []).reduce((result, condition) => {
        if (!condition?.key) {
          return result
        }
        const { title, ...tag } = condition
        const operator = this.getCompatibleOperator(
          tag.operator || this.getDefaultOperator(tag.key, tag.value),
          tag.value,
          tag.key
        )
        if (this.shouldOverwriteCondition(tag.key, operator)) {
          for (const conditionKey of Object.keys(result)) {
            const current = result[conditionKey]
            if (
              current?.key === tag.key &&
              this.shouldOverwriteCondition(tag.key, current.operator)
            ) {
              delete result[conditionKey]
            }
          }
        }
        const conditionKey = this.shouldOverwriteCondition(tag.key, operator)
          ? this.getConditionStorageKey(tag.key, operator)
          : this.getUniqueConditionStorageKey(tag.key, operator, result)
        result[conditionKey] = {
          ...tag,
          operator
        }
        return result
      }, {})
    },
    handleConfirm({ keepFieldMenuOpen = false } = {}) {
      const isBlankValue =
        typeof this.filterValue === 'string'
          ? this.filterValue.trim() === ''
          : this.filterValue == null
      if (isBlankValue) {
        this.filterValue = ''
        this.valueLabel = ''
        this.$nextTick(() => this.focusSearchInput())
        return
      }
      if (this.filterValue && !this.filterKey) {
        this.filterKey = 'search' + '_' + this.filterValue
      }
      const selectedOption = this.getOptionByKey(this.filterKey)
      const shouldMergeCondition = this.isFixedChoiceOption(selectedOption)
      if (this.isBooleanOption(selectedOption)) {
        for (const conditionKey of Object.keys(this.filterTags)) {
          if (this.filterTags[conditionKey]?.key === this.filterKey) {
            delete this.filterTags[conditionKey]
          }
        }
      }
      const incomingValue = this.mergeConditionValues(this.filterValue)
      const requestedOperator = this.getCompatibleOperator(this.filterOperator, incomingValue)
      if (this.shouldOverwriteCondition(this.filterKey, requestedOperator)) {
        for (const conditionKey of Object.keys(this.filterTags)) {
          const condition = this.filterTags[conditionKey]
          if (
            condition?.key === this.filterKey &&
            this.shouldOverwriteCondition(this.filterKey, condition.operator)
          ) {
            delete this.filterTags[conditionKey]
          }
        }
        this.filterTags[this.getConditionStorageKey(this.filterKey, requestedOperator)] = {
          key: this.filterKey,
          label: this.keyLabel,
          value: incomingValue,
          valueLabel: this.mergeConditionValues(this.valueLabel),
          operator: requestedOperator
        }
        this.resetFilterInputState()
        if (!keepFieldMenuOpen) {
          this.focusSearchInputAfterSubmit()
        }
        return
      }
      if (!shouldMergeCondition) {
        const conditionKey = this.getUniqueConditionStorageKey(this.filterKey, requestedOperator)
        this.filterTags[conditionKey] = {
          key: this.filterKey,
          label: this.keyLabel,
          value: incomingValue,
          valueLabel: this.mergeConditionValues(this.valueLabel),
          operator: requestedOperator
        }
        this.resetFilterInputState()
        if (!keepFieldMenuOpen) {
          this.focusSearchInputAfterSubmit()
        }
        return
      }
      const requestedConditionKey = shouldMergeCondition
        ? this.getConditionStorageKey(this.filterKey, requestedOperator)
        : this.getUniqueConditionStorageKey(this.filterKey, requestedOperator)
      let existingConditionKey = requestedConditionKey
      let existingTag = this.filterTags[existingConditionKey]
      if (
        !existingTag &&
        shouldMergeCondition &&
        this.isFixedChoiceOption(selectedOption) &&
        requestedOperator === 'exact'
      ) {
        const multipleConditionKey = this.getConditionStorageKey(this.filterKey, 'in')
        if (this.filterTags[multipleConditionKey]) {
          existingConditionKey = multipleConditionKey
          existingTag = this.filterTags[multipleConditionKey]
        }
      }
      const shouldMerge = !!existingTag
      const value = shouldMerge
        ? this.mergeConditionValues(existingTag.value, this.filterValue)
        : incomingValue
      const valueLabel = shouldMerge
        ? this.mergeConditionValues(existingTag.valueLabel, this.valueLabel)
        : this.mergeConditionValues(this.valueLabel)
      const operator = this.getCompatibleOperator(requestedOperator, value)
      const conditionKey = this.getConditionStorageKey(this.filterKey, operator)
      const compatibleTag =
        conditionKey === existingConditionKey ? null : this.filterTags[conditionKey]
      const finalValue = compatibleTag
        ? this.mergeConditionValues(compatibleTag.value, value)
        : value
      const finalValueLabel = compatibleTag
        ? this.mergeConditionValues(compatibleTag.valueLabel, valueLabel)
        : valueLabel
      const tag = {
        key: this.filterKey,
        label: this.keyLabel,
        value: finalValue,
        valueLabel: finalValueLabel,
        operator
      }
      if (conditionKey !== existingConditionKey) {
        delete this.filterTags[existingConditionKey]
      }
      if (
        requestedConditionKey !== existingConditionKey &&
        requestedConditionKey !== conditionKey
      ) {
        delete this.filterTags[requestedConditionKey]
      }
      this.filterTags[conditionKey] = tag
      // this.$emit('tagSearch', this.filterMaps)

      // 修改查询参数时改变url中保存的参数
      // if (this.getUrlQuery) {
      // let newQuery = _.cloneDeep(this.$route.query)
      // if (this.filterKey.startsWith('search')) {
      // newQuery = { ...newQuery, search: encodeURI(this.filterMaps.search) }
      // } else {
      // newQuery = { ...newQuery, [this.filterKey]: encodeURI(this.filterValue) }
      // }
      // this.$router.replace({ query: newQuery })
      // }

      if (keepFieldMenuOpen) {
        this.filterValue = ''
        this.valueLabel = ''
      } else {
        this.resetFilterInputState()
        this.focusSearchInputAfterSubmit()
      }
    },
    resetFilterInputState() {
      this.filterKey = this.defaultFilterKey
      this.filterOperator = 'icontains_any'
      this.filterValue = ''
      this.valueLabel = ''
      this.fieldMenuValue = null
    },
    handleTagClick(v, k) {
      let unableChange = false

      for (const field of this.options) {
        if (field.value === v.key) {
          if (field.type === 'choice') {
            unableChange = true
          }
          if (field.type === 'boolean') {
            unableChange = true
          }
          if (field.type === 'labeled_choice') {
            unableChange = true
          }
        }
      }

      if (unableChange) return

      if (this.filterValue.length !== 0) {
        this.handleConfirm()
      }

      delete this.filterTags[k]

      this.filterKey = v.key
      this.filterValue = v.value
      this.filterOperator = v.operator || this.getDefaultOperator(v.key, v.value)
      this.focusSearchInput()
    },
    handleKeyUp(event) {
      // 如果当前有输入框聚焦，不触发搜索
      const activeElement = event.target
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.contentEditable === 'true')
      if (isInputFocused) return

      // 当目标对象为一个 length 为 0 的伪数组时表明此时是在全局情况下调用
      // 若存在遮罩层等组件在调用时，其 length 将会为 1
      if (event.target.classList.length === 0 && event.key === '/') {
        this.$refs.SearchInput.focus()
        this.isFocus = true
      }
    },
    handleDocumentKeyDown(event) {
      if (!this.cascaderVisible || event.key !== 'Escape') {
        return
      }
      event.preventDefault()
      event.stopPropagation()
      this.$refs.Cascade?.togglePopperVisible?.(false)
      this.$nextTick(() => this.$refs.SearchInput?.blur?.())
    },
    handleDocumentPointerDown(event) {
      if (!this.cascaderVisible) {
        return
      }
      const target = event.target
      const cascaderContent = this.$refs.Cascade?.contentRef
      const fieldMenuPopper =
        cascaderContent?.closest?.('.tag-search-field-popper') || cascaderContent
      if (this.$el?.contains(target) || fieldMenuPopper?.contains?.(target)) {
        return
      }

      clearTimeout(this.fieldMenuOpenTimer)
      this.pendingFieldFocusSearchInput = false
      this.restoreFieldMenuOnVisible = false
      this.$refs.Cascade?.togglePopperVisible?.(false)
      this.$refs.SearchInput?.blur?.()
    },
    // 删除查询条件时改变url
    checkUrlFields(evt) {
      let newQuery = _.omit(this.$route.query, this.getConditionQueryKeys(evt))
      if (this.getUrlQuery && evt.startsWith('search')) {
        if (newQuery.search) delete newQuery.search
        const filterMapsSearch = this.filterMaps.search || ''
        const encodedSearch = Array.isArray(filterMapsSearch)
          ? filterMapsSearch.map((value) => encodeURI(value))
          : encodeURI(filterMapsSearch)
        newQuery = {
          ...newQuery,
          ...(filterMapsSearch && { search: encodedSearch })
        }
      }
      this.$router.replace({ query: newQuery })
    }
  }
}
</script>

<style lang="scss" scoped>
$borderColor-neutral-muted: #afb8c133;
$bgColor-muted: #f6f8fa;
$origin-white-color: #ffffff;

.filter-field {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 28px;
  overflow: hidden;
  background-color: $origin-white-color;

  .filter-selector {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    min-width: 28px;
    height: 28px;
    max-width: 180px;
    padding: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    flex: 0 0 auto;

    &.is-empty {
      width: 0;
      min-width: 0;
      max-width: 0;
      padding: 0;
    }

    &__label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &.has-selected-field > .filter-selector:not(.operator-selector) {
    justify-content: flex-start;
    width: auto;
    min-width: 0;
    max-width: none;
    padding-left: 10px;
    flex: 0 0 auto;

    .filter-selector__label {
      overflow: visible;
      text-overflow: clip;
    }
  }

  .operator-selector {
    width: auto;
    min-width: max-content;
    max-width: 150px;
    padding-left: 10px;
    white-space: nowrap;
    border: 0;
    outline: none;
    box-shadow: none;

    &:hover,
    &:focus,
    &:focus-visible,
    &.is-open {
      border: 0;
      outline: none;
      box-shadow: none;
    }

    &__trigger {
      display: inline-flex;
      align-items: center;
      min-width: 0;
      height: 28px;
      border: 0;
      outline: none;
      box-shadow: none;

      &:hover,
      &:focus,
      &:focus-visible {
        border: 0;
        outline: none;
        box-shadow: none;
      }
    }

    &__symbol {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: max-content;
      min-width: 22px;
      padding: 3px 6px;
      color: var(--el-text-color-primary);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      font-weight: 600;
      line-height: 10px;
      border: solid 1px $borderColor-neutral-muted;
      border-radius: 6px;
      background-color: $bgColor-muted;
      box-shadow: inset 0 -1px 0 $borderColor-neutral-muted;
    }

    &--static {
      cursor: default;
    }
  }

  :deep(.filter-cascader) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 28px;
    opacity: 0;
    cursor: pointer;
  }

  :deep(.filter-cascader > .el-input),
  :deep(.filter-cascader > .el-input > .el-input__wrapper) {
    width: 100%;
    height: 28px;
    cursor: pointer;
  }

  :deep(.filter-cascader .el-input__wrapper),
  :deep(.filter-cascader:not(.is-disabled):hover .el-input__wrapper),
  :deep(.filter-cascader .el-input.is-focus .el-input__wrapper),
  :deep(.search-input .el-input__wrapper),
  :deep(.search-input .el-input__wrapper:hover),
  :deep(.search-input .el-input__wrapper.is-focus) {
    border: 0 !important;
    outline: none !important;
    box-shadow: none !important;
  }

  .search-input {
    --jms-input-padding-inline: 11px;
    --jms-input-padding-inline-start: 12px;

    flex: 1 1 auto;
    width: auto;
    margin-left: 0;
    min-width: 140px;
    max-width: 100%;
    height: 28px;

    :deep(.el-input__wrapper) {
      width: 100%;
      max-width: none;
      box-shadow: unset;

      .el-input__inner {
        height: 28px;
        font-size: 13px;
        box-shadow: unset;
        border: none;
      }

      .el-input__suffix {
        margin-left: 4px;
      }
    }

    &.no-options {
      --jms-input-padding-inline-start: 11px;
    }
  }

  &.has-selected-field .search-input {
    min-width: 48px;
  }

  &:not(.is-input-focus):not(.has-search-action) .search-input {
    :deep(.el-input__wrapper) {
      padding-right: 32px;
    }
  }

  .keydown-focus {
    position: absolute;
    right: 0;
    bottom: 5px;
    display: inline-block;
    margin-right: 10px;
    padding: 3px 5px;
    color: var(--color-text-primary);
    font-size: 11px;
    line-height: 10px;
    border: solid 1px $borderColor-neutral-muted;
    border-radius: 6px;
    background-color: $bgColor-muted;
    box-shadow: inset 0 -1px 0 $borderColor-neutral-muted;
  }

  .search-submit-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 24px;
    margin: 0;
    padding: 0;
    color: var(--el-text-color-regular);
    border: 0;
    border-radius: 3px;
    background-color: transparent;
    cursor: pointer;

    .el-icon {
      font-size: 12px;
    }

    &:hover {
      color: var(--el-text-color-primary);
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
}

.el-icon--right {
  margin-left: 5px;
  margin-right: 5px;
}

a {
  color: #000;
}
</style>

<style lang="scss">
.tag-search-field-popper {
  // 字段菜单直接与整个搜索框左边缘对齐，不显示浮层指向箭头。
  &.el-popper[data-popper-placement^='bottom'] {
    margin-top: -6px;
    margin-left: 0;
  }

  .el-popper__arrow {
    display: none;
  }

  // Element Plus 使用透明 SVG 三角区保持鼠标从一级菜单平滑移动到二级菜单。
  // 全局 `path { fill: inherit !important; }` 会把透明区域染黑，因此在此恢复透明。
  .el-cascader-menu__hover-zone path {
    fill: transparent !important;
    stroke: transparent !important;
    filter: none;
  }

  .el-cascader-menu {
    width: max-content;
    min-width: 180px;
    height: auto;
    max-height: min(300px, calc(100vh - 160px));
  }

  .el-cascader-menu__wrap.el-scrollbar__wrap {
    height: auto;
    max-height: min(300px, calc(100vh - 160px));
    overflow-y: auto;
  }

  .el-cascader-menu__list {
    min-height: 0;
  }

  .el-cascader-node {
    width: max-content;
    min-width: 100%;
    height: 36px;
    padding: 0;
    font-size: 13px;
  }

  .el-cascader-node__label {
    width: max-content;
    padding: 0;
    overflow: visible;
    text-overflow: clip;
    flex: 0 0 auto;
  }

  // 字段选择只负责切换搜索维度，一级、二级菜单均隐藏对勾和选中背景。
  .el-cascader-node__prefix {
    display: none;
  }

  .field-menu-option {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: max-content;
    min-width: 100%;
    height: 36px;
    padding: 0 30px 0 22px;
    overflow: visible;
    text-overflow: clip;
    white-space: nowrap;

    &.has-checkbox,
    &.has-radio {
      gap: 8px;
      padding-left: 14px;
    }

    &__label {
      min-width: max-content;
      overflow: visible;
      text-overflow: clip;
      white-space: nowrap;
    }

    &__help {
      margin-left: 6px;
      color: var(--el-text-color-placeholder);
      cursor: help;
    }
  }

  .choice-value-checkbox {
    position: relative;
    display: inline-flex;
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    border: 1px solid var(--el-border-color);
    border-radius: 3px;
    background-color: var(--el-bg-color);
    flex: 0 0 14px;

    &.is-checked {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary);

      &::after {
        position: absolute;
        top: 1px;
        left: 4px;
        width: 3px;
        height: 7px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        content: '';
        transform: rotate(45deg);
      }
    }
  }

  .choice-value-radio {
    position: relative;
    display: inline-flex;
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    border: 1px solid var(--el-border-color);
    border-radius: 50%;
    background-color: var(--el-bg-color);
    flex: 0 0 14px;

    &.is-checked {
      border-color: var(--el-color-primary);

      &::after {
        position: absolute;
        inset: 3px;
        border-radius: 50%;
        background-color: var(--el-color-primary);
        content: '';
      }
    }
  }

  .el-cascader-node.is-active,
  .el-cascader-node.in-active-path,
  .el-cascader-node.in-checked-path,
  .el-cascader-node[aria-checked='true'] {
    color: var(--el-text-color-regular) !important;
    font-weight: 400 !important;
    background-color: transparent !important;
  }

  .field-menu-option.is-current-field {
    color: var(--el-color-primary) !important;
  }

  .el-cascader-node:not(.is-disabled):hover {
    color: var(--el-text-color-regular) !important;
    background-color: var(--el-fill-color-light) !important;
  }

  .el-cascader-node:not(.is-disabled):focus,
  .el-cascader-node:not(.is-disabled):focus-visible {
    color: var(--el-text-color-primary) !important;
    background-color: var(--el-color-primary-light-9) !important;
    outline: none;
  }
}

.tag-search-operator-popper {
  &.el-popper[data-popper-placement^='bottom'] {
    margin-top: -6px;
    margin-left: 0;
  }

  .el-popper__arrow {
    display: none;
  }

  .el-dropdown-menu {
    min-width: 200px;
    padding: 0;
  }

  .operator-menu__title {
    box-sizing: border-box;
    height: 36px;
    padding: 0 22px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 500;
    line-height: 36px;
    list-style: none;
  }

  .operator-menu__group-title {
    box-sizing: border-box;
    padding: 10px 22px 4px;
    color: var(--el-text-color-placeholder);
    font-size: 11px;
    font-weight: 500;
    line-height: 18px;
    list-style: none;

    &.is-divided {
      margin-top: 4px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }

  .el-dropdown-menu__item {
    display: flex;
    height: 36px;
    padding: 0 22px;
    border-radius: 0;
    color: var(--el-text-color-regular);
    font-size: 13px;

    &.is-active {
      color: var(--el-color-primary);
      background: transparent;
    }

    &:not(.is-disabled):hover,
    &:not(.is-disabled):focus {
      color: var(--el-text-color-regular);
      background: var(--el-fill-color-light);
    }

    &.is-active:hover,
    &.is-active:focus {
      color: var(--el-color-primary);
    }
  }

  .operator-option__label {
    flex: 1 1 auto;
    color: inherit;
  }

  .operator-option__content {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .operator-option__symbol {
    display: inline-flex;
    justify-content: flex-end;
    width: 32px;
    margin-left: 16px;
    color: var(--el-text-color-placeholder);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    font-weight: 500;
    flex: 0 0 32px;
  }
}

.tag-search-placeholder-tooltip.el-popper {
  max-width: min(360px, calc(100vw - 24px));
  line-height: 18px;
  overflow-wrap: anywhere;
  text-align: left;
  white-space: normal;
}
</style>
