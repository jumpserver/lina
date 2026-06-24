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
    :loading="!initialized"
    :multiple="multiple"
    :options="iOptions"
    :placeholder="placeholder"
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
      initialized: false,
      defaultParams: _.cloneDeep(defaultParams),
      params: _.cloneDeep(defaultParams),
      iOptions: this.options || [],
      initialOptions: [],
      remote: true,
      allSelected: false,
      transformed: false, // 这里改回来是因为，acl 中资产选择，category 选择后，再编辑，就看不到了
      innerValue:
        this.modelValue !== undefined
          ? _.cloneDeep(this.modelValue)
          : this.value !== undefined
            ? _.cloneDeep(this.value)
            : this.multiple
              ? []
              : ''
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
      handler(newValue) {
        if (!_.isEqual(this.innerValue, newValue)) {
          this.innerValue = _.cloneDeep(newValue)
        }
      },
      deep: true
    },
    modelValue: {
      handler(newValue) {
        if (!_.isEqual(this.innerValue, newValue)) {
          this.innerValue = _.cloneDeep(newValue)
        }
      },
      deep: true
    }
  },
  async mounted() {
    if (!this.initialized) {
      await this.initialSelect()
      setTimeout(() => {
        this.$log.debug('Value is : ', this.externalValue)
        this.innerValue = _.cloneDeep(this.externalValue)
        this.initialized = true
        this.$emit('initialized', true)
      }, 100)
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
    async loadMore(load) {
      if (!this.iAjax.url) {
        return
      }
      if (!this.params.hasMore) {
        return
      }
      this.loading = true
      this.params.page = this.params.page ? this.params.page + 1 : 1
      const defaultLoad = this.getOptions
      if (!load) {
        load = defaultLoad
      }
      await load()
      this.loading = false
    },
    resetParams() {
      this.params = _.cloneDeep(this.defaultParams)
    },
    safeMakeParams(params) {
      params = _.cloneDeep(params)
      delete params['hasMore']
      return this.iAjax.makeParams(params)
    },
    filterOptions(query) {
      this.resetParams()
      this.iOptions = []
      this.params.search = query
      this.getOptions()
      // 同步输入时避免 value 仍指向旧引用造成递归
      if (!this.multiple && Array.isArray(this.innerValue)) {
        this.innerValue = ''
      }
    },
    handleModelUpdate(val) {
      // avoid loops
      if (!_.isEqual(this.innerValue, val)) {
        this.innerValue = _.cloneDeep(val)
      }
      if (!_.isEqual(this.externalValue, val)) {
        const payload = _.cloneDeep(val)
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
        if (this.externalValue && this.externalValue.length !== 0) {
          this.$log.debug('Start init select2 value, ', this.externalValue)
          let value = this.externalValue
          if (!Array.isArray(value)) {
            value = [value]
          }
          const data = await createSourceIdCache(value)
          this.params.spm = data['spm']
          await this.getInitialOptions()
        }
        await this.getOptions()
        if (this.iOptions.length === 0) {
          this.remote = false
        }
      } else {
        this.remote = false
      }
    },
    refresh() {
      this.resetParams()
      this.iOptions = []
      this.getOptions()
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
    :deep(.el-select__tags) {
      opacity: 0;
      cursor: not-allowed;
    }
  }

  &.show-tag {
    :deep(.el-select__tags) {
      opacity: 1;
    }
  }

  :deep(.el-tag.el-tag--info) {
    min-height: 24px;
    height: 24px;
    line-height: 22px;
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 5px;
    padding: 0 8px;
    font-family: sans-serif !important;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
  }

  :deep(.el-tag__content) {
    display: inline-flex;
    align-items: center;
  }

  :deep(.el-select__wrapper) {
    min-height: 30px;
    height: 30px;
    box-sizing: border-box;
    padding: 0 8px;
    padding-top: 0;
    padding-bottom: 0;
    border-radius: 0;
    box-shadow: none !important;
    border: 1px solid var(--el-border-color) !important;
  }

  :deep(.el-select__wrapper:hover) {
    border-color: var(--el-border-color-hover) !important;
  }

  :deep(.el-select__wrapper.is-focused) {
    box-shadow: none !important;
    border-color: var(--el-color-primary) !important;
  }

  :deep(.el-select__selection) {
    min-height: 28px;
    align-items: center;
  }

  :deep(.el-select__tags) {
    height: 28px;
    min-height: 28px;
    align-items: center;
  }

  :deep(.el-select__selected-item),
  :deep(.el-select__placeholder),
  :deep(.el-select__input) {
    min-height: 28px;
    height: 28px;
    line-height: 28px;
  }

  :deep(.el-select__caret),
  :deep(.el-select__suffix),
  :deep(.el-select__prefix) {
    min-height: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
  }
}

.select2.is-multiple {
  :deep(.el-select__wrapper) {
    height: auto;
    min-height: 30px;
    align-items: center;
  }

  :deep(.el-select__selection) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    align-content: center;
    gap: 4px;
    width: 100%;
    min-height: 28px;
  }

  :deep(.el-select__tags) {
    display: contents;
    min-height: 0;
    height: auto;
  }

  :deep(.el-select__selected-item) {
    flex: 0 0 auto;
    max-width: 100%;
    display: inline-flex;
    align-items: center;
  }

  :deep(.el-select__input-wrapper) {
    flex: 1 1 120px;
    min-width: 120px;
    margin-left: 0;
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
