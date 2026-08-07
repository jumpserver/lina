<template>
  <el-select
    ref="select"
    v-bind="forwardedAttrs"
    v-model="iValue"
    :allow-create="allowCreate"
    :class="[transformed ? 'hidden-tag' : 'show-tag', { 'is-multiple': multiple }]"
    :clearable="clearable"
    :collapse-tags="collapseTags"
    :disabled="!!selectDisabled"
    :filterable="true"
    :fallback-placements="fallbackPlacements"
    :fit-input-width="fitInputWidth"
    :loading="!initialized"
    :multiple="multiple"
    :no-data-text="requestError ? $t('SelectLoadFailed') : undefined"
    :no-match-text="requestError ? $t('SelectLoadFailed') : undefined"
    :options="iOptions"
    :placeholder="placeholder"
    :placement="placement"
    :popper-class="selectPopperClass"
    :remote="remote"
    :remote-method="filterOptions"
    class="select2"
    popper-append-to-body
    @change="onChange"
    @popup-scroll="onPopupScroll"
    @visible-change="onVisibleChange"
  >
    <div v-if="showSelectAll" class="el-select-dropdown__header">
      <el-checkbox
        v-model="allSelected"
        :disabled="selectAllDisabled"
        @change="handleSelectAllChange"
      >
        {{ $t('SelectAll') }}
      </el-checkbox>
      <div v-if="quickAddCallback" style="float: right">
        <el-link underline="never" @click="quickAddCallback">{{ $t('QuickAdd') }}</el-link>
        <el-link
          underline="never"
          icon="el-icon-refresh"
          style="margin-left: 5px"
          @click="refresh"
        />
      </div>
    </div>
    <el-option
      v-for="item in iOptions"
      :key="item.value"
      :disabled="checkDisabled(item)"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script>
import { createSourceIdCache } from '@/api/common'
import i18n from '@/i18n/i18n'
import _ from 'lodash'

export default {
  name: 'Select2',
  inheritAttrs: false,
  props: {
    options: {
      type: Array,
      default: () => []
    },
    url: {
      type: String,
      default: ''
    },
    ajax: {
      type: Object,
      default: () => ({})
    },
    // 是否是多选
    multiple: {
      type: Boolean,
      default: true
    },
    clearable: {
      type: Boolean,
      default: true
    },
    // 初始化值，也就是选中的值
    value: {
      type: [Array, String, Number, Boolean, Object],
      default: undefined
    },
    modelValue: {
      type: [Array, String, Number, Boolean, Object],
      default: undefined
    },
    disabledValues: {
      type: Array,
      default: () => []
    },
    valueKey: {
      type: String,
      default: 'id'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    collapseTagsCount: {
      type: Number,
      default: 10
    },
    showSelectAll: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: function () {
        try {
          return i18n?.global?.t?.('Select') || 'Select'
        } catch (e) {
          return 'Select'
        }
      }
    },
    quickAddCallback: {
      type: Function,
      default: null
    },
    allowCreate: {
      type: Boolean,
      default: false
    },
    defaultPageSize: {
      type: Number,
      default: 10
    },
    placement: {
      type: String,
      default: 'bottom-start'
    },
    fallbackPlacements: {
      type: Array,
      default: () => ['bottom-start']
    },
    fitInputWidth: {
      type: Boolean,
      default: true
    },
    popperClass: {
      type: String,
      default: ''
    }
  },
  emits: [
    'input',
    'change',
    'changeOptions',
    'visible-change',
    'initialized',
    'loadInitialOptionsDone',
    'update:modelValue',
    'update:model-value'
  ],
  data() {
    const vm = this
    const defaultParams = {
      search: '',
      page: 1,
      hasMore: true,
      pageSize: vm.defaultPageSize
    }
    // 设置axios全局报错提示不显示
    const validateStatus = (status) => {
      if (status === 403) {
        setTimeout(() => {
          vm.initialized = true
          vm.selectDisabled = true
        }, 200)
        return 200
      }
      return status
    }
    return {
      validateStatus,
      selectDisabled: this.disabled,
      loading: false,
      requestError: false,
      initialized: false,
      defaultParams: _.cloneDeep(defaultParams),
      params: _.cloneDeep(defaultParams),
      iOptions: this.options || [],
      initialOptions: [],
      remote: true,
      allSelected: false,
      transformed: this.shouldHidePendingLabel(
        this.modelValue !== undefined ? this.modelValue : this.value
      ),
      innerValue: this.normalizeValue(this.modelValue !== undefined ? this.modelValue : this.value)
    }
  },
  computed: {
    forwardedAttrs() {
      const attrs = { ...this.$attrs }
      delete attrs.value
      delete attrs.modelValue
      delete attrs['model-value']
      return attrs
    },
    externalValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    selectRef() {
      return this.$refs.select
    },
    selectPopperClass() {
      return ['select2-popper', this.popperClass].filter(Boolean).join(' ')
    },
    collapseTags() {
      return (
        this.multiple &&
        this.collapseTagsCount > 0 &&
        (this.externalValue?.length || 0) > this.collapseTagsCount
      )
    },
    optionsValues() {
      return this.iOptions.map((v) => v.value)
    },
    selectAllDisabled() {
      const validOptions = this.iOptions.filter(
        (item) => this.disabledValues.indexOf(item.value) === -1
      )
      return validOptions.length === 0
    },
    iValue: {
      set(val) {
        this.handleModelUpdate(val)
      },
      get() {
        return this.innerValue
      }
    },
    iAjax() {
      const defaultMakeParams = (params) => {
        const page = params.page || 1
        const offset = (page - 1) * params.pageSize
        const p = {
          offset: offset,
          limit: params.pageSize
        }
        params = Object.assign(params, p)
        delete params['page']
        delete params['pageSize']
        return params
      }
      const defaultTransformOption = (item) => {
        if (typeof item === 'object') {
          return { label: item.name, value: item.id }
        } else {
          return { label: item, value: item }
        }
      }
      const transformOption = this.ajax.transformOption || defaultTransformOption
      const defaultFilterOption = (item) => {
        return item
      }
      const filterOption = this.ajax.filterOption || defaultFilterOption
      const defaultProcessResults = (data) => {
        let results = []
        let more = false
        let total = 0
        if (Array.isArray(data)) {
          results = data
          total = data.length
        } else if (typeof data === 'object') {
          results = data?.results || []
          more = !!data.next
          total = data.count
        }
        results = results.map(transformOption)
        results = results.filter(filterOption)
        return { results: results, pagination: more, total: total }
      }
      const defaultAjax = {
        url: '',
        pageSize: this.defaultPageSize,
        makeParams: defaultMakeParams,
        transformOption: defaultTransformOption,
        processResults: defaultProcessResults,
        validateStatus: this.validateStatus
      }
      return Object.assign(defaultAjax, this.ajax, this.url ? { url: this.url } : {})
    }
  },
  watch: {
    // Keep inner state in sync with prop without causing loops
    disabled(newValue, oldValue) {
      this.selectDisabled = newValue
    },
    options(newValue, oldValue) {
      this.iOptions = newValue
    },
    iAjax(newValue, oldValue) {
      this.$log.debug('Select url changed: ', oldValue, ' => ', newValue)
      this.refresh()
    },
    value: {
      async handler(newValue) {
        if (this.modelValue === undefined) {
          await this.syncExternalValue(newValue)
        }
      },
      deep: true
    },
    modelValue: {
      async handler(newValue) {
        await this.syncExternalValue(newValue)
      },
      deep: true
    }
  },
  async mounted() {
    if (!this.initialized) {
      try {
        await this.initialSelect()
      } catch {
        // 请求错误已由 axios 拦截器提示，选择器仍需结束初始化才能继续搜索
        this.requestError = true
      } finally {
        setTimeout(() => {
          this.$log.debug('Value is : ', this.externalValue)
          this.innerValue = this.normalizeValue(this.externalValue)
          this.initialized = true
          this.$emit('initialized', true)
        }, 100)
      }
    }
    // 由于在新增时有些 Select 会存在初始值，而有些没有，就会导致动态类名判断出现相反的情况
    // 此处强制设置没有初始值的动态类名
    if (Array.isArray(this.iValue) && this.iValue.length === 0) this.transformed = false

    this.$nextTick(() => {
      // 因为elform存在问题，这个来清楚验证
      const elFormItem = this.$refs.select?.elFormItem
      if (elFormItem && elFormItem.clearValidate) {
        elFormItem.clearValidate()
      }
    })
  },
  methods: {
    hasValue(value) {
      return Array.isArray(value)
        ? value.length > 0
        : value !== '' && value !== null && value !== undefined
    },
    getOptionValue(value) {
      if (value === null || value === undefined) {
        return undefined
      }
      if (typeof value !== 'object') {
        return value
      }
      if (this.valueKey && Object.hasOwn(value, this.valueKey)) {
        return value[this.valueKey]
      }
      if (Object.hasOwn(value, 'value')) {
        return value.value
      }
      if (Object.hasOwn(value, 'id')) {
        return value.id
      }
      if (Object.hasOwn(value, 'pk')) {
        return value.pk
      }
      return undefined
    },
    normalizeValue(value) {
      if (this.multiple) {
        if (value === null || value === undefined || value === '') {
          return []
        }
        const list = Array.isArray(value) ? value : [value]
        return list
          .map((item) => this.getOptionValue(item))
          .filter((item) => item !== undefined && item !== null && item !== '')
      }
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return ''
      }
      const normalized = Array.isArray(value) ? value[0] : value
      return this.getOptionValue(normalized) ?? ''
    },
    shouldHidePendingLabel(value) {
      const ajaxUrl = this.url || this.ajax?.url
      if (!ajaxUrl) {
        return false
      }
      const normalizedValue = this.normalizeValue(value)
      return this.hasValue(normalizedValue) && this.hasMissingOptions(normalizedValue)
    },
    hasMissingOptions(value) {
      const optionValues = (this.iOptions || this.options || []).map((item) => item.value)
      const values = Array.isArray(value) ? value : [value]
      return values.some((item) => optionValues.indexOf(item) === -1)
    },
    async syncExternalValue(value) {
      const normalizedValue = this.normalizeValue(value)
      this.transformed = this.shouldHidePendingLabel(value)
      if (this.transformed) {
        await this.hydrateSelectedOptions(normalizedValue)
      }
      if (!_.isEqual(this.innerValue, normalizedValue)) {
        this.innerValue = _.cloneDeep(normalizedValue)
      }
    },
    async hydrateSelectedOptions(value) {
      if (!this.hasValue(value) || !this.iAjax.url) {
        return
      }
      const values = Array.isArray(value) ? value : [value]
      this.initialOptions = []
      this.resetParams()
      const data = await createSourceIdCache(values)
      this.params.spm = data['spm']
      await this.getInitialOptions()
      this.transformed = false
    },
    async loadMore(load) {
      if (!this.iAjax.url) {
        return
      }
      if (!this.params.hasMore) {
        return
      }
      if (this.loading && !load) {
        return
      }
      this.loading = true
      const previousPage = this.params.page
      this.params.page = previousPage ? previousPage + 1 : 1
      const defaultLoad = this.getOptions
      if (!load) {
        load = defaultLoad
      }
      try {
        await load()
      } catch {
        // 失败后保留当前页，允许下次滚动重试同一页
        this.params.page = previousPage
        this.requestError = true
      } finally {
        this.loading = false
      }
    },
    resetParams() {
      this.params = _.cloneDeep(this.defaultParams)
    },
    safeMakeParams(params) {
      params = _.cloneDeep(params)
      delete params['hasMore']
      return this.iAjax.makeParams(params)
    },
    async filterOptions(query) {
      this.resetParams()
      this.iOptions = []
      this.params.search = query
      this.requestError = false
      try {
        await this.getOptions()
      } catch {
        // 请求错误后保持可搜索状态，下一次输入可正常重试
        this.requestError = true
      }
    },
    handleModelUpdate(val) {
      const normalizedValue = this.normalizeValue(val)
      if (!_.isEqual(this.innerValue, normalizedValue)) {
        this.innerValue = _.cloneDeep(normalizedValue)
      }
      if (!_.isEqual(this.normalizeValue(this.externalValue), normalizedValue)) {
        const payload = _.cloneDeep(normalizedValue)
        this.$emit('input', payload)
        this.$emit('update:modelValue', payload)
        this.$emit('update:model-value', payload)
      }
    },
    async getInitialOptions() {
      const { url, processResults, validateStatus } = this.iAjax
      const params = this.safeMakeParams(this.params)
      let data = await this.$axios.get(url, {
        params,
        validateStatus
      })
      data = processResults.bind(this)(data)
      setTimeout(() => {
        this.transformed = false
      }, 100)

      data.results.forEach((v) => {
        this.initialOptions.push(v)
        if (this.optionsValues.indexOf(v.value) === -1) {
          this.addOption(v)
        }
      })
      // 如果还有其它页，继续获取, 如果没有就停止
      if (!data.pagination) {
        this.$emit('loadInitialOptionsDone', this.initialOptions)
        this.params.hasMore = false
        this.resetParams()
        return true
      } else {
        await this.loadMore(this.getInitialOptions)
      }
    },
    async getOptions() {
      const { url, processResults, validateStatus } = this.iAjax
      const params = this.safeMakeParams(this.params)
      const resp = await this.$axios.get(url, {
        params,
        validateStatus
      })
      const data = processResults.bind(this)(resp)
      if (!data.pagination) {
        this.params.hasMore = false
      }
      data.results.forEach((v) => {
        if (this.optionsValues.indexOf(v.value) === -1) {
          this.addOption(v)
        }
      })
    },
    async initialSelect() {
      // this.$log.debug('Select ajax config', this.iAjax)
      if (this.iAjax.url) {
        const normalizedValue = this.normalizeValue(this.externalValue)
        if (this.hasValue(normalizedValue)) {
          this.$log.debug('Start init select2 value, ', normalizedValue)
          await this.hydrateSelectedOptions(normalizedValue)
        }
        await this.getOptions()
        if (this.iOptions.length === 0) {
          this.remote = false
        }
      } else {
        this.remote = false
      }
    },
    async refresh() {
      this.resetParams()
      this.iOptions = []
      this.requestError = false
      try {
        await this.getOptions()
      } catch {
        // 请求错误已统一提示，保留组件交互能力
        this.requestError = true
      }
    },
    addOption(option) {
      this.iOptions.push(option)
    },
    getSelectedOptions() {
      let values = this.innerValue
      if (!Array.isArray(values)) {
        values = [values]
      }
      return this.iOptions.filter((v) => {
        return values.indexOf(v.value) !== -1
      })
    },
    clearSelected() {
      this.allSelected = false
      this.innerValue = this.multiple ? [] : ''
      const payload = _.cloneDeep(this.innerValue)
      this.$emit('input', payload)
      this.$emit('update:modelValue', payload)
      this.$emit('update:model-value', payload)
    },
    checkDisabled(item) {
      return item.disabled === undefined
        ? this.disabledValues.indexOf(item.value) !== -1
        : item.disabled
    },
    onChange(values) {
      const options = this.getSelectedOptions()
      this.$log.debug('Current select options: ', options, 'Val: ', this.value)
      this.$emit('changeOptions', options)
      this.$emit('change', _.cloneDeep(values))
    },
    onPopupScroll({ scrollTop }) {
      const wrapRef = this.selectRef?.scrollbarRef?.wrapRef
      if (!wrapRef) {
        return
      }
      const condition = wrapRef.scrollHeight - scrollTop - 600 <= wrapRef.clientHeight
      if (condition) {
        this.loadMore()
      }
    },
    onVisibleChange(visible) {
      if (!visible && this.params.search) {
        this.refresh()
        this.$log.debug('Visible change, refresh select2')
      }
      this.$emit('visible-change', visible)
    },
    async loadAll() {
      if (!this.iAjax.url) {
        return
      }
      while (this.params.hasMore) {
        await this.loadMore()
      }
    },
    async selectAll() {
      await this.loadAll()
      this.innerValue = this.iOptions.map((v) => v.value)
      const payload = _.cloneDeep(this.innerValue)
      this.$emit('input', payload)
      this.$emit('update:modelValue', payload)
      this.$emit('update:model-value', payload)
    },
    handleSelectAllChange(checked) {
      if (checked) {
        this.selectAll()
      } else {
        this.innerValue = []
        this.$emit('input', [])
        this.$emit('update:modelValue', [])
        this.$emit('update:model-value', [])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.select2 {
  width: 100%;

  &.hidden-tag {
    :deep(.el-select__selected-item:has(> .el-tag)) {
      opacity: 0;
      pointer-events: none;
    }
  }

  &.show-tag {
    :deep(.el-select__selected-item:has(> .el-tag)) {
      opacity: 1;
    }
  }
}

.select2.is-multiple {
  :deep(.el-select__wrapper) {
    height: auto !important;
    min-height: 30px;
    align-items: center;
  }

  :deep(.el-select__selection) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    align-content: center;
    width: 100%;
    min-height: 28px;
  }

  :deep(.el-select__selected-item) {
    flex: 0 0 auto;
    max-width: 100%;
    display: inline-flex;
    align-items: center;
  }

  :deep(.el-select__input-wrapper) {
    // 只需容纳光标即可，避免因 120px 硬门槛在标签后剩余宽度不足时把光标挤到下一行、
    // 撑高整个控件;flex-grow 让它在同一行内自动填满剩余空间。
    flex: 1 1 30px;
    min-width: 30px;
  }

  :deep(.el-select__input) {
    width: 100% !important;
    min-height: 28px;
  }

  :deep(.el-select__placeholder) {
    margin-left: 0;
  }
}

.el-select-dropdown__header {
  padding: 10px 20px;
  border-bottom: solid 1px #ebeef5;
}
</style>

<style lang="scss">
.select2-popper {
  .el-select-dropdown__wrap {
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }

  .el-select-dropdown__list {
    width: max-content;
    min-width: 100%;
  }

  .el-select-dropdown__item {
    max-width: none;
    overflow: visible;
    text-overflow: clip;
    white-space: nowrap;
  }

  .el-scrollbar__bar.is-horizontal {
    display: none;
  }
}
</style>
