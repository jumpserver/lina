<template>
  <el-select
    v-model="valueSafe"
    v-loadmore="loadMore"
    :options="totalOptions"
    :remote-method="filterOptions"
    :loading="loading"
    :multiple="multiple"
    filterable
    remote
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
    url: {
      type: String,
      required: true
    },
    makeParams: {
      type: Function,
      default: null
    },
    processResults: {
      type: Function,
      default: null
    },
    options: {
      type: Array,
      default: () => ([])
    },
    value: {
      type: [Array, String, Number, Boolean],
      default: () => ([])
    },
    multiple: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      params: {
        search: '',
        page: 1,
        hasMore: true
      },
      defaultMakeParams: params => {
        const page = params.page || 1
        return {
          search: params.search,
          offset: (page - 1) * 10,
          limit: 10
        }
      },
      defaultProcessResults: data => {
        let results = data.results
        results = results.map((item) => {
          return { label: item.name, value: item.id }
        })
        const more = !!data.next
        return { results: results, pagination: more }
      },
      valueSafe: [...this.value],
      totalOptions: this.options || []
    }
  },
  computed: {
    makeParamsOrDefault() {
      return this.makeParams || this.defaultMakeParams
    },
    processResultsOrDefault() {
      return this.processResults || this.defaultProcessResults
    },
    optionsValues() {
      return this.totalOptions.map((v) => v.value)
    }
  },
  mounted() {
    this.initialSelect()
  },
  methods: {
    loadMore(load) {
      if (!this.params.hasMore) {
        return
      }
      this.params.page = this.params.page ? this.params.page + 1 : 1
      const defaultLoad = this.getOptions
      if (!load) {
        load = defaultLoad
      }
      load()
    },
    resetParams() {
      this.params = {
        search: '',
        page: 1,
        hasMore: false
      }
    },
    filterOptions(query) {
      this.resetParams()
      this.totalOptions = []
      this.params.search = query
      this.getOptions()
    },
    async getInitialOptions() {
      let data = await createSourceIdCache(this.value)
      const params = this.makeParamsOrDefault(this.params)
      params.spm = data.spm
      data = await this.$axios.get(this.url, { params: params })
      data = this.processResultsOrDefault(data)
      data.results.forEach((v) => {
        if (this.optionsValues.indexOf(v.value) === -1) {
          this.totalOptions.push(v)
        }
      })
      if (!data.pagination) {
        this.params.hasMore = false
        this.resetParams()
      } else {
        this.loadMore(this.getInitialOptions)
      }
    },
    async getOptions() {
      const params = this.makeParamsOrDefault(this.params)
      const resp = await this.$axios.get(this.url, { params: params })
      const data = this.processResultsOrDefault(resp)
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
        if (this.value) {
          await this.getInitialOptions()
        }
        await this.getOptions()
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
