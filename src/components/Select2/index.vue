<template>
  <el-select
    v-model="valueSafe"
    v-loadmore="loadMore"
    :options="optionsSafe"
    :remote-method="filterOptions"
    :loading="loading"
    :multiple="multiple"
    filterable
    remote
    v-bind="$attrs"
    class="select2"
    v-on="$listeners"
  >
    <el-option
      v-for="item in optionsSafe"
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
    processSelected: {
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
    initial: {
      type: Array,
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
      defaultProcessSelected: data => {
        return data.map(item => {
          if (item.label && item.value) {
            return item
          }
          return { label: item.name, value: item.id }
        })
      },
      valueSafe: [...this.value],
      optionsSafe: this.options || []
    }
  },
  computed: {
    makeParamsOrDefault() {
      return this.makeParams || this.defaultMakeParams
    },
    processResultsOrDefault() {
      return this.processResults || this.defaultProcessResults
    },
    processSelectedOrDefault() {
      return this.processSelected || this.defaultProcessSelected
    },
    initialOptions() {
      const options = this.processSelectedOrDefault(this.initial)
      return options
    },
    optionsValues() {
      return this.optionsSafe.map((v) => v.value)
    },
    initialValues() {
      return this.initialOptions.map(v => v.value)
    }
  },
  watch: {
    initialOptions: function(newValue) {
      const notInclude = newValue.filter(v => {
        return this.optionsValues.indexOf(v.value) === -1
      })
      this.optionsSafe = [...notInclude, ...this.optionsSafe]
      const notIncludeValues = notInclude.map(v => v.value)
      this.valueSafe = [...notIncludeValues, ...this.valueSafe]
    }
  },
  mounted() {
    if (this.initialOptions) {
      this.valueSafe = [...this.initialValues, ...this.valueSafe]
      this.optionsSafe = [...this.initialOptions, ...this.optionsSafe]
    }
    if (this.url) {
      this.getOptions()
    }
  },
  methods: {
    loadMore() {
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
      this.optionsSafe = []
      this.params.search = query
      this.getOptions()
    },
    getOptions() {
      this.loading = true
      const params = this.makeParamsOrDefault(this.params)
      this.$axios.get(this.url, { params: params }).then(resp => {
        this.loading = false
        const data = this.processResultsOrDefault(resp)
        if (!data.pagination) {
          this.params.hasMore = false
        }
        data.results.forEach((v) => {
          if (this.optionsValues.indexOf(v.value) === -1) {
            this.optionsSafe.push(v)
          }
        })
      }).catch(err => {
        this.$message.error(err)
        console.log(err)
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
