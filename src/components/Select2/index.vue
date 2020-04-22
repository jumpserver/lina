<template>
  <el-select
    v-model="validValue"
    v-loadmore="loadMore"
    :options="totalOptions"
    :remote-method="filterOptions"
    :loading="loading"
    :multiple="multiple"
    filterable
    remote
    popper-append-to-body
    class="select2"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <el-option
      v-for="item in totalOptions"
      :key="item.value"
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
          const condition = this.scrollHeight - this.scrollTop - 30 <= this.clientHeight
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
    // 去这个地址获取options
    url: {
      type: String,
      default: null
    },
    // 可以将请求的参数进行转换，同jquery select2 makeParams
    makeParams: {
      type: Function,
      default: (params) => {
        const page = params.page || 1
        const p = {
          offset: (page - 1) * params.pageSize,
          limit: params.pageSize
        }
        params = Object.assign(params, p)
        delete params['page']
        delete params['pageSize']
        return params
      }
    },
    // 对返回的数据进行处理, 同jquery select2 processResults
    processResults: {
      type: Function,
      default(data) {
        let results = data.results
        results = results.map((item) => {
          return { label: item.name, value: item.id }
        })
        const more = !!data.next
        return { results: results, pagination: more }
      }
    },
    // 初始化值，也就是选中的值
    value: {
      type: [Array, String, Number, Boolean],
      default: () => ([])
    },
    // 是否是多选
    multiple: {
      type: Boolean,
      default: true
    },
    pageSize: {
      type: Number,
      default: 20
    }
  },
  data() {
    const defaultParams = {
      search: '',
      page: 1,
      hasMore: true,
      pageSize: this.pageSize
    }
    return {
      loading: false,
      validValue: this.multiple ? [] : '',
      defaultParams: defaultParams,
      params: Object.assign({}, defaultParams),
      totalOptions: this.options || [],
      initialOptions: []
    }
  },
  computed: {
    optionsValues() {
      return this.totalOptions.map((v) => v.value)
    }
  },
  mounted() {
    this.initialSelect()
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
      return this.makeParams(params)
    },
    filterOptions(query) {
      this.resetParams()
      this.totalOptions = []
      this.params.search = query
      this.getOptions()
    },
    async getInitialOptions() {
      const params = this.safeMakeParams(this.params)
      this.$log.debug('Get initial options: ', params)
      let data = await this.$axios.get(this.url, { params: params })
      data = this.processResults.bind(this)(data)
      data.results.forEach((v) => {
        this.initialOptions.push(v)
        if (this.optionsValues.indexOf(v.value) === -1) {
          this.totalOptions.push(v)
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
      const resp = await this.$axios.get(this.url, { params: params })
      const data = this.processResults.bind(this)(resp)
      if (!data.pagination) {
        this.params.hasMore = false
      }
      data.results.forEach((v) => {
        if (this.optionsValues.indexOf(v.value) === -1) {
          this.totalOptions.push(v)
        }
      })
    },
    async initialSelect() {
      if (this.url) {
        if (this.value && this.value.length !== 0) {
          this.$log.debug('Start init select2 value')
          const data = await createSourceIdCache(this.value)
          this.params.spm = data.spm
          await this.getInitialOptions()
        }
        this.$log.debug('Start get select2 options')
        await this.getOptions()
      }
      this.validValue = this.value
    }
  }
}
</script>

<style scoped>
  .select2 {
    width: 100%;
  }
</style>
