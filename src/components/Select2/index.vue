<template>
  <el-select
    v-model="iValue"
    v-loadmore="loadMore"
    :options="iOptions"
    :remote-method="filterOptions"
    :multiple="multiple"
    filterable
    remote
    :reserve-keyword="true"
    popper-append-to-body
    class="select2"
    v-bind="$attrs"
    @change="onChange"
    @visible-change="onVisibleChange"
    v-on="$listeners"
  >
    <el-option
      v-for="item in iOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      :disabled="item.disabled === undefined ? false : item.disabled"
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
    // 初始化值，也就是选中的值
    value: {
      type: [Array, String, Number, Boolean],
      default() {
        return this.multiple ? [] : ''
      }
    },
    disabledValues: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const defaultPageSize = 10
    const defaultParams = {
      search: '',
      page: 1,
      hasMore: true,
      pageSize: defaultPageSize
    }
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
    const defaultProcessResults = (data) => {
      let results = data.results
      results = results.map((item) => {
        return { label: item.name, value: item.id }
      })
      const more = !!data.next
      const total = data.count
      return { results: results, pagination: more, total: total }
    }
    const defaultAjax = {
      url: '',
      pageSize: defaultPageSize,
      makeParams: defaultMakeParams,
      processResults: defaultProcessResults
    }
    return {
      loading: false,
      initialized: false,
      iAjax: Object.assign(defaultAjax, this.ajax, this.url ? { url: this.url } : {}),
      iValue: this.multiple ? [] : '',
      defaultParams: _.cloneDeep(defaultParams),
      params: _.cloneDeep(defaultParams),
      iOptions: this.options || [],
      initialOptions: []
    }
  },
  computed: {
    optionsValues() {
      return this.iOptions.map((v) => v.value)
    }
  },
  mounted() {
    this.$log.debug('Select is: ', this.iAjax.url)
    this.$log.debug('Select url: ', this.url)
    if (!this.initialized) {
      this.initialSelect()
      this.initialized = true
    }
  },
  methods: {
    async loadMore(load) {
      if (this.loading) {
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
      try {
        await load()
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
    filterOptions(query) {
      this.resetParams()
      this.iOptions = []
      this.params.search = query
      this.getOptions()
    },
    reFresh() {
      this.resetParams()
      this.iOptions = []
      this.getOptions()
    },
    addOption(option) {
      if (this.disabledValues.indexOf(option.value) !== -1) {
        option.disabled = true
      }
      this.iOptions.push(option)
    },
    async getInitialOptions() {
      const params = this.safeMakeParams(this.params)
      this.$log.debug('Get initial options: ', params)
      let data = await this.$axios.get(this.iAjax.url, { params: params })
      data = this.iAjax.processResults.bind(this)(data)
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
      } else {
        await this.loadMore(this.getInitialOptions)
      }
    },
    async getOptions() {
      const params = this.safeMakeParams(this.params)
      const resp = await this.$axios.get(this.iAjax.url, { params: params })
      const data = this.iAjax.processResults.bind(this)(resp)
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
      this.$log.debug('Select ajax config', this.iAjax)
      if (this.iAjax.url) {
        if (this.value && this.value.length !== 0) {
          this.$log.debug('Start init select2 value')
          const data = await createSourceIdCache(this.value)
          this.params.spm = data.spm
          await this.getInitialOptions()
        }
        this.$log.debug('Start get select2 options')
        await this.getOptions()
      }
      this.iValue = this.value
    },
    getOptionsByValues(values) {
      return this.iOptions.filter((v) => {
        return values.indexOf(v.value) !== -1
      })
    },
    getSelectedOptions() {
      const values = this.iValue
      return this.iOptions.filter((v) => {
        return values.indexOf(v.value) !== -1
      })
    },
    onChange(values) {
      const options = this.getSelectedOptions()
      this.$log.debug('Current select options: ', options)
      this.$emit('changeOptions', options)
    },
    onVisibleChange(visible) {
      if (!visible && this.params.search) {
        this.reFresh()
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
</style>
