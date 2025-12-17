<template>
  <div>
    <span>Hello World</span>
  </div>
</template>

<script lang="jsx">
import { createSourceIdCache } from '@/api/common'
import _ from 'lodash'

export default {
  name: 'Select2',
  directives: {
    'loadmore': {
      bind(el, binding) {
        // 获取element-ui定义好的scroll盒子
        const SELECTWRAP_DOM = el.querySelector('.el-select-dropdown .el-select-dropdown__wrap')
        SELECTWRAP_DOM.addEventListener('scroll', function() {
          /**
           * scrollHeight 获取元素内容高度(只读)
           * scrollTop 获取或者设置元素的偏移值,常用于, 计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
           * clientHeight 读取元素的可见高度(只读)
           * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
           * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
           */
          const condition = this.scrollHeight - this.scrollTop - 600 <= this.clientHeight
          if (condition) {
            binding.value()
          }
        })
      }
    }
  },
  props: {
    options: {
      type: Array,
      default: () => ([])
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
      default() {
        return this.multiple ? [] : ''
      }
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
      default: function() {
        try {
          const { default: i18n } = require('@/i18n/i18n')
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
      innerValue: _.cloneDeep(this.value)
    }
  },
  computed: {
    selectRef() {
      return this.$refs.select
    },
    collapseTags() {
      return this.multiple && this.collapseTagsCount > 0 && this.value.length > this.collapseTagsCount
    },
    optionsValues() {
      return this.iOptions.map((v) => v.value)
    },
    selectAllDisabled() {
      const validOptions = this.iOptions.filter(item => this.disabledValues.indexOf(item.value) === -1)
      return validOptions.length === 0
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
  },
  async mounted() {
    if (!this.initialized) {
      await this.initialSelect()
      setTimeout(() => {
        this.$log.debug('Value is : ', this.value)
        this.innerValue = _.cloneDeep(this.value)
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
      if (!_.isEqual(this.value, val)) {
        this.$emit('input', _.cloneDeep(val))
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
        if (this.value && this.value.length !== 0) {
          this.$log.debug('Start init select2 value, ', this.value)
          let value = this.value
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
      this.$emit('input', _.cloneDeep(this.innerValue))
    },
    checkDisabled(item) {
      return item.disabled === undefined ? this.disabledValues.indexOf(item.value) !== -1 : item.disabled
    },
    onChange(values) {
      const options = this.getSelectedOptions()
      this.$log.debug('Current select options: ', options, 'Val: ', this.value)
      this.$emit('changeOptions', options)
      // this.$emit('change', options) // 事件重复
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
      this.$emit('input', _.cloneDeep(this.innerValue))
    },
    handleSelectAllChange(checked) {
      if (checked) {
        this.selectAll()
      } else {
        this.innerValue = []
        this.$emit('input', [])
      }
    }
  }
}

</script>

<style lang='scss' scoped>
.select2 {
  width: 100%;

  &.hidden-tag {
    ::v-deep .el-select__tags {
      opacity: 0;
      cursor: not-allowed;
    }
  }

  &.show-tag {
    ::v-deep .el-select__tags {
      opacity: 1;
    }
  }

  ::v-deep .el-tag.el-tag--info {
    height: auto;
    white-space: normal;
  }

  ::v-deep input::placeholder {
    padding-left: 2px;
  }
}

.el-select-dropdown__header {
  padding: 10px 20px;
  border-bottom: solid 1px #ebeef5;
}
</style>
