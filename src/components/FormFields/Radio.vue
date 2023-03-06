<template>
  <el-radio-group v-model="iValue" :disabled="selectDisabled">
    <el-radio
      v-for="o in iOptions"
      :key="o.value"
      :label="o.value"
      :disabled="o.disabled"
    >
      {{ o.label }}
    </el-radio>
  </el-radio-group>
</template>

<script>
export default {
  name: 'Radio', // Url请求不加分页了，数据多请用Select组件
  props: {
    options: {
      type: Array,
      default: () => []
    },
    ajax: {
      type: Object,
      default: () => ({})
    },
    // 初始化值，也就是选中的值
    value: {
      type: String,
      default: () => ''
    }
  },
  data() {
    const vm = this
    const validateStatus = (status) => {
      if (status === 403) {
        setTimeout(() => {
          vm.initialized = true
          vm.selectDisabled = true
        }, 200)
        return 200
      } else if (status === 404) {
        vm.$router.push({ path: '/404' })
      }
      return status
    }
    return {
      iOptions: [],
      selectDisabled: false,
      initialized: false,
      initialOptions: [],
      validateStatus: validateStatus
    }
  },
  computed: {
    iAjax() {
      const defaultTransformOption = (item) => {
        return { label: item.name, value: item.id }
      }
      const transformOption = this.ajax.transformOption || defaultTransformOption
      const defaultProcessResults = (data) => {
        let results = []
        if (Array.isArray(data)) {
          results = data
        } else if (typeof data === 'object') {
          results = data?.results || []
        }
        results = results.map(transformOption)
        return { results: results }
      }
      const defaultAjax = {
        url: '',
        transformOption: defaultTransformOption,
        processResults: defaultProcessResults,
        validateStatus: this.validateStatus
      }
      return Object.assign(defaultAjax, this.ajax, this.url ? { url: this.url } : {})
    },
    iValue: {
      set(val) {
        const noValue = !(this.value || this.iAjax.defaultValue)
        if (noValue && !this.initialized) {
          return
        }
        this.$emit('input', val)
        this.$emit('change', val)
      },
      get() {
        return this.value || this.iAjax.defaultValue
      }
    }
  },
  watch: {
  },
  async mounted() {
    if (!this.initialized) {
      await this.getInitialOptions()
      setTimeout(() => {
        this.iValue = this.value || this.iAjax.defaultValue
        this.initialized = true
      })
    }
  },
  methods: {
    addOption(option) {
      this.iOptions.push(option)
    },
    async getInitialOptions() {
      let data
      if (this.options.length !== 0) {
        data = this.options
      } else {
        const { url, processResults, validateStatus } = this.iAjax
        data = await this.$axios.get(url, {
          validateStatus
        })
        data = processResults.bind(this)(data).results
      }
      data.forEach((v) => {
        this.addOption(v)
      })
      this.iValue = this.value || this.iAjax.defaultValue
    }
  }
}
</script>

<style scoped>

</style>
