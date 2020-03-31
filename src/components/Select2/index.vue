<template>
  <el-select
    v-model="vaultOrDefault"
    v-loadmore="loadMore"
    :placeholder="placeholder"
    :options="options"
    :remote-method="filterOptions"
    :loading="loading"
    multiple
    filterable
    remote
    class="select2"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script>
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
          const condition = this.scrollHeight - this.scrollTop <= this.clientHeight
          if (condition) {
            binding.value()
          }
        })
      }
    }
  },
  props: {
    placeholder: {
      type: String,
      default: null
    },
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
      default: () => []
    },
    value: {
      type: [Array, String, Number, Boolean],
      default: () => []
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
      vaultOrDefault: this.value || []
    }
  },
  computed: {
    makeParamsOrDefault() {
      return this.makeParams || this.defaultMakeParams
    },
    processResultsOrDefault() {
      return this.processResults || this.defaultProcessResults
    },
    optionsOrDefault() {
      return this.options || []
    }
  },
  mounted() {
    if (this.url) {
      this.getOptions()
    }
  },
  methods: {
    loadMore() {
      console.log('Load more ...', this.params.hasMore)
      if (!this.params.hasMore) {
        return
      }
      this.params.page = this.params.page ? this.params.page + 1 : 1
      this.getOptions()
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
      this.options = []
      this.params.search = query
      this.getOptions()
    },
    getOptions() {
      this.loading = true
      const params = this.makeParamsOrDefault(this.params)
      console.log(params)
      this.$axios.get(this.url, { params: params }).then(resp => {
        this.loading = false
        const data = this.processResultsOrDefault(resp)
        if (!data.pagination) {
          this.params.hasMore = false
        }
        data.results.forEach((v) => {
          this.options.push(v)
          console.log(v)
        })
      }).catch(err => {
        console.log(err)
        this.options = []
      }).then(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
  .select2 {
    width: 100%;
  }
</style>
