<template>
  <div
    :class="{
      'has-options': options.length > 0,
      'has-selected-field': hasSelectedField,
      'has-search-action': showSearchAction,
      'is-input-focus': isFocus
    }"
    class="filter-field"
  >
    <div
      v-show="options.length > 0"
      :class="{ 'is-open': cascaderVisible }"
      class="filter-selector"
      @click.capture.stop.prevent="keepFilterMenuOpen"
      @mouseenter="openFilterMenu"
      @mouseleave="scheduleFilterMenuClose"
    >
      <span v-if="hasSelectedField" :title="filterSelectorLabel" class="filter-selector__label">
        {{ filterSelectorLabel }}
      </span>
      <el-icon aria-hidden="true" class="filter-selector__leading"><ArrowDown /></el-icon>

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
            :class="{ 'is-current-field': isCurrentFieldOption(node, data) }"
            class="field-menu-option"
            @click="handleFieldOptionClick($event, node, data)"
          >
            {{ data.label }}
          </span>
        </template>
      </el-cascader>
    </div>

    <el-input
      ref="SearchInput"
      v-model="filterValue"
      class="search-input jms-input-spacing"
      :class="options.length > 0 ? '' : 'no-options'"
      :placeholder="placeholder"
      :validate-event="false"
      @blur="handleBlur"
      @compositionend="handleCompositionEnd"
      @compositionstart="handleCompositionStart"
      @focus="handleFocus"
      @keydown.backspace="handleFieldBackspace"
      @keydown.down="handleFieldMenuKeydown"
      @keydown.esc.stop.prevent="handleSearchEscape"
      @keyup.enter="handleEnter"
    >
      <template #suffix>
        <button
          v-if="showSearchAction"
          :aria-label="$t('Search')"
          class="search-submit-button"
          type="button"
          @click.stop="handleConfirm"
          @mousedown.prevent
        >
          <el-icon><Search /></el-icon>
        </button>
      </template>
    </el-input>
    <span v-if="!showSearchAction" class="keydown-focus">/</span>
  </div>
</template>

<script>
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
    }
  },
  data() {
    return {
      filterKey: 'search',
      filterValue: '',
      valueLabel: '',
      fieldMenuValue: null,
      filterTags: this.default || {},
      focus: false,
      showCascade: true,
      isFocus: false,
      pendingFocusSearchInput: false,
      cascaderVisible: false,
      fieldMenuCloseTimer: null,
      fieldMenuPopperElement: null,
      isComposing: false,
      skipNextEnter: false
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
        expandTrigger: 'hover'
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
      return this.focus || this.hasSearchValue
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
    conditionItems() {
      return Object.entries(this.filterTags).map(([key, condition]) => ({
        ...condition,
        key,
        title: this.getTagTitle(condition)
      }))
    },
    filterMaps() {
      const data = {}
      const keyword = 'search'
      for (let key in this.filterTags) {
        const value = this.filterTags[key]['value']
        if (key === '') {
          key = keyword
        }
        if (key.startsWith(keyword)) {
          data[keyword] = (data[keyword] ? data[keyword] + ',' : '') + value
        } else {
          const queryKey = this.hasMultipleConditionValues(value) ? key : this.getQueryKey(key)
          data[queryKey] = value
        }
      }
      return data
    },
    placeholder() {
      if (this.focus) {
        return this.$t('SearchMultipleValuesPlaceholder')
      }
      return this.$t('SearchShortcutPlaceholder')
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
  },
  beforeUnmount() {
    document.removeEventListener('keyup', this.handleKeyUp)
    document.removeEventListener('keydown', this.handleDocumentKeyDown, true)
    this.removeFieldMenuHoverListeners()
    clearTimeout(this.fieldMenuCloseTimer)
  },
  methods: {
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

      for (const [key, value] of Object.entries(routeQuery)) {
        const valueDecode = decodeURI(value)
        const isSearch = key === 'search'

        if (isSearch) {
          searchFieldOptions[key] = {
            key,
            label: '',
            value: valueDecode
          }
          continue
        }

        const normalizedKey = this.getTagKeyFromQueryKey(key)
        if (queryInfoValues.includes(normalizedKey)) {
          searchFieldOptions[normalizedKey] = this.getInQueryInfoFields(normalizedKey, value)
        }
      }
      return searchFieldOptions
    },
    getInQueryInfoFields(key, value) {
      let searchFieldOption = {}
      let valueDecode = decodeURI(value)
      const currentOptions = this.options || []

      for (let k = 0, len = currentOptions.length; k < len; k++) {
        const current = currentOptions[k]
        if (key === current.value) {
          const curChildren = current.children || []
          if (current?.type === 'boolean') {
            valueDecode = !!valueDecode
          }
          searchFieldOption = {
            ...current,
            key,
            label: current.label,
            value: valueDecode
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
      const routerSearch = routeFilter.search || {}
      let routerSearchAttrs = []
      if (typeof routerSearch?.value === 'string') {
        routerSearchAttrs = routerSearch?.value?.split(',') || []
      }

      for (const attr of routerSearchAttrs) {
        routeFilter[`search_${attr}`] = {
          ...routerSearch,
          value: attr
        }
      }

      if (routerSearchAttrs.length !== 0) {
        delete routeFilter.search
      }
      const asFilterTags = _.cloneDeep(this.filterTags)
      this.filterTags = {
        ...asFilterTags,
        ...routeFilter
      }
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
          if (child.value === value) {
            return child.label
          }
        }
      }
      return ''
    },
    getTagTitle(tag) {
      const label = tag?.label ? `${tag.label}: ` : ''
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
    shouldUseExactQuery(key) {
      const option = this.getOptionByKey(key)
      return (
        key.includes('__') ||
        option?.type === 'boolean' ||
        option?.type === 'choice' ||
        option?.type === 'labeled_choice' ||
        (option?.children && option.children.length > 0)
      )
    },
    getQueryKey(key) {
      if (this.shouldUseExactQuery(key)) {
        return key
      }
      return `${key}__icontains`
    },
    getTagKeyFromQueryKey(key) {
      return key.endsWith('__icontains') ? key.slice(0, -'__icontains'.length) : key
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
    handleFieldOptionClick(event, node, option) {
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
      if (selectedPath.length === 1) {
        this.filterKey = selectedPath[0]
        this.pendingFocusSearchInput = true
      } else if (selectedPath.length >= 2) {
        this.filterKey = selectedPath[0]
        this.filterValue = selectedPath[selectedPath.length - 1]
        this.valueLabel = this.getValueLabel(this.filterKey, this.filterValue)
        this.handleConfirm()
        this.filterKey = this.defaultFilterKey
      }
      this.$nextTick(() => {
        this.fieldMenuValue = null
        this.$refs.Cascade.handleClear()
      })
    },
    handleCascaderVisibleChange(visible) {
      this.cascaderVisible = visible
      if (visible) {
        this.$nextTick(() => this.addFieldMenuHoverListeners())
      } else {
        this.removeFieldMenuHoverListeners()
      }
      if (visible || !this.pendingFocusSearchInput) {
        return
      }
      this.pendingFocusSearchInput = false
      this.$nextTick(() => this.focusSearchInput())
    },
    openFilterMenu() {
      clearTimeout(this.fieldMenuCloseTimer)
      this.$refs.Cascade?.togglePopperVisible?.(true)
    },
    keepFilterMenuOpen() {
      clearTimeout(this.fieldMenuCloseTimer)
      this.$refs.Cascade?.togglePopperVisible?.(true)
    },
    scheduleFilterMenuClose() {
      clearTimeout(this.fieldMenuCloseTimer)
      this.fieldMenuCloseTimer = setTimeout(() => {
        const selector = this.$el?.querySelector?.('.filter-selector')
        if (selector?.matches(':hover') || this.fieldMenuPopperElement?.matches(':hover')) {
          return
        }
        this.$refs.Cascade?.togglePopperVisible?.(false)
      }, 100)
    },
    addFieldMenuHoverListeners() {
      this.removeFieldMenuHoverListeners()
      const content = this.$refs.Cascade?.contentRef
      const popper = content?.closest?.('.tag-search-field-popper') || content
      if (!popper) {
        return
      }
      this.fieldMenuPopperElement = popper
      popper.addEventListener('mouseenter', this.openFilterMenu)
      popper.addEventListener('mouseleave', this.scheduleFilterMenuClose)
    },
    removeFieldMenuHoverListeners() {
      if (!this.fieldMenuPopperElement) {
        return
      }
      this.fieldMenuPopperElement.removeEventListener('mouseenter', this.openFilterMenu)
      this.fieldMenuPopperElement.removeEventListener('mouseleave', this.scheduleFilterMenuClose)
      this.fieldMenuPopperElement = null
    },
    handleFieldMenuKeydown(event) {
      if (this.filterValue !== '' || this.options.length === 0) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
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
      this.valueLabel = ''
      this.fieldMenuValue = null
      this.$refs.Cascade?.handleClear?.()
      this.$refs.Cascade?.togglePopperVisible?.(false)
      this.$nextTick(() => this.focusSearchInput())
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
    handleTagClose(evt) {
      delete this.filterTags[evt]
      if (this.getUrlQuery) {
        this.checkUrlFields(evt)
      }
      // this.$emit('tagSearch', this.filterMaps)
      return true
    },
    clearConditions() {
      const conditionKeys = Object.keys(this.filterTags)
      this.filterTags = {}
      if (this.getUrlQuery && conditionKeys.length > 0) {
        const queryKeys = conditionKeys.flatMap((key) => [key, this.getQueryKey(key)])
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
        result[tag.key] = tag
        return result
      }, {})
    },
    handleConfirm() {
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
      const existingTag = this.filterTags[this.filterKey]
      const shouldMerge = !!existingTag
      const value = shouldMerge
        ? this.mergeConditionValues(existingTag.value, this.filterValue)
        : this.mergeConditionValues(this.filterValue)
      const valueLabel = shouldMerge
        ? this.mergeConditionValues(existingTag.valueLabel, this.valueLabel)
        : this.mergeConditionValues(this.valueLabel)
      const tag = {
        key: this.filterKey,
        label: this.keyLabel,
        value,
        valueLabel
      }
      this.filterTags[this.filterKey] = tag
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

      this.filterValue = ''
      this.valueLabel = ''

      this.$nextTick(() => this.focusSearchInput())
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
    // 删除查询条件时改变url
    checkUrlFields(evt) {
      let newQuery = _.omit(this.$route.query, [evt, this.getQueryKey(evt)])
      if (this.getUrlQuery && evt.startsWith('search')) {
        if (newQuery.search) delete newQuery.search
        const filterMapsSearch = this.filterMaps.search || ''
        newQuery = {
          ...newQuery,
          ...(filterMapsSearch && { search: encodeURI(filterMapsSearch) })
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
  align-content: flex-start;
  flex-wrap: wrap;
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
    flex: 0 1 auto;

    &.is-open .filter-selector__leading {
      transform: rotate(180deg);
    }

    &__leading {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      width: 28px;
      height: 28px;
      color: var(--el-text-color-placeholder);
      font-size: 12px;
      flex: 0 0 28px;
      transition: transform 0.2s;
    }

    &__label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &.has-selected-field .filter-selector {
    justify-content: flex-start;
    width: auto;
    min-width: 0;
    padding-left: 10px;
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

  .search-input {
    --jms-input-padding-inline: 11px;
    --jms-input-padding-inline-start: 0;

    flex: 1 1 120px;
    width: auto;
    margin-left: 0;
    min-width: 80px;
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
    height: 36px;
    padding: 0 14px;
    font-size: 13px;
  }

  // 字段选择只负责切换搜索维度，一级、二级菜单均隐藏对勾和选中背景。
  .el-cascader-node__prefix {
    display: none;
  }

  .field-menu-option {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 30px 0 22px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
</style>
