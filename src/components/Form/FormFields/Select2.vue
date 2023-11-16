<template>
  <el-select
    ref="select"
    v-model="iValue"
    v-loadmore="loadMore"
    :clearable="clearable"
    :collapse-tags="collapseTags"
    :disabled="!!selectDisabled"
    :loading="!initialized"
    :multiple="multiple"
    :options="iOptions"
    :remote="remote"
    :remote-method="filterOptions"
    class="select2"
    filterable
    popper-append-to-body
    v-bind="$attrs"
    @change="onChange"
    v-on="$listeners"
    @visible-change="onVisibleChange"
  >
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
    }
  },
  data() {
    const vm = this
    const defaultPageSize = 10
    const defaultParams = {
      search: '',
      page: 1,
      hasMore: true,
      pageSize: defaultPageSize
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
      remote: true
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
    iValue: {
      set(val) {
        const noValue = !this.value || this.value.length === 0
        if (noValue && !this.initialized) {
          return
        }
        if (val && val.constructor === Object && val.value) {
          this.$emit('input', val.value)
        } else if (val && val.constructor === Object && val.id) {
          this.$emit('input', val.id)
        } else {
          this.$emit('input', val)
        }
      },
      get() {
        return this.value
      }
    },
    iAjax() {
      const defaultPageSize = 10
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
        return { label: item.name, value: item.id }
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
        pageSize: defaultPageSize,
        makeParams: defaultMakeParams,
        transformOption: defaultTransformOption,
        processResults: defaultProcessResults,
        validateStatus: this.validateStatus
      }
      return Object.assign(defaultAjax, this.ajax, this.url ? { url: this.url } : {})
    }
  },
  watch: {
    iAjax(newValue, oldValue) {
      this.$log.debug('Select url changed: ', oldValue, ' => ', newValue)
      this.refresh()
    },
    value: {
      handler(newValue, oldValue) {
      },
      deep: true
    },
    iOptions(val) {
      if (val.length === 0) {
        this.remote = false
      } else {
        this.remote = true
      }
    }
  },
  async mounted() {
    if (!this.initialized) {
      await this.initialSelect()
      setTimeout(() => {
        this.$log.debug('Value is : ', this.value)
        this.iValue = this.value
        this.initialized = true
      }, 100)
    }
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
    },
    async getInitialOptions() {
      const { url, processResults, validateStatus } = this.iAjax
      const params = this.safeMakeParams(this.params)
      let data = await this.$axios.get(url, {
        params,
        validateStatus
      })
      data = processResults.bind(this)(data)
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
      let values = this.iValue
      if (!Array.isArray(values)) {
        values = [values]
      }
      return this.iOptions.filter((v) => {
        return values.indexOf(v.value) !== -1
      })
    },
    clearSelected() {
      this.iValue = []
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
    }
  }
}

</script>

<style scoped>
.select2 {
  width: 100%;
}

.select2 >>> .el-tag.el-tag--info {
  height: auto;
  white-space: normal;
}
</style>
