<template>
  <AutoDataForm
    v-if="!loading"
    ref="form"
    :method="method"
    :form="form"
    :url="iUrl"
    :is-submitting="isSubmitting"
    v-bind="$attrs"
    v-on="$listeners"
    @submit="handleSubmit"
  />
</template>
<script>
import AutoDataForm from '@/components/AutoDataForm'
export default {
  name: 'GenericCreateUpdateForm',
  components: {
    AutoDataForm
  },
  props: {
    url: {
      type: String,
      default: ''
    },
    object: {
      type: Object,
      default: null
    },
    initial: {
      type: Object,
      default: () => ({})
    },
    cleanFormValue: {
      type: Function,
      default: (value) => value
    },
    onSubmit: {
      type: Function,
      default: null
    },
    performSubmit: {
      type: Function,
      default(validValues) {
        return this.$axios[this.method](this.iUrl, validValues)
      }
    },
    createSuccessMsg: {
      type: String,
      default: function() {
        return this.$t('common.createSuccessMsg')
      }
    },
    updateSuccessMsg: {
      type: String,
      default: function() {
        return this.$t('common.updateSuccessMsg')
      }
    },
    createSuccessNextRoute: {
      type: Object,
      default: function() {
        const routeName = this.$route.name.replace('Create', 'List')
        return { name: routeName }
      }
    },
    updateSuccessNextRoute: {
      type: Object,
      default: function() {
        const routeName = this.$route.name.replace('Update', 'List')
        return { name: routeName }
      }
    },
    getNextRoute: {
      type: Function,
      default(res, method) {
        return method === 'post' ? this.createSuccessNextRoute : this.updateSuccessNextRoute
      }
    },
    getMethod: {
      type: Function,
      default: function() {
        const params = this.$route.params
        if (params.id) {
          return 'put'
        } else {
          return 'post'
        }
      }
    },
    getUrl: {
      type: Function,
      default: function() {
        const params = this.$route.params
        let url = this.url
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return url
      }
    },
    onPerformSuccess: {
      type: Function,
      default(res, method, vm) {
        const msg = method === 'post' ? this.createSuccessMsg : this.updateSuccessMsg
        const route = this.getNextRoute(res, method)
        this.$emit('submitSuccess', res)
        this.$message.success(msg)
        setTimeout(() => this.$router.push(route), 100)
      }
    },
    onPerformError: {
      type: Function,
      default(error, method, vm) {
        this.$emit('submitError', error)
        const response = error.response
        const data = response.data
        if (response.status === 400) {
          for (const key of Object.keys(data)) {
            let value = data[key]
            if (value instanceof Array) {
              value = value.join(';')
            }
            this.$refs.form.setFieldError(key, value)
          }
        }
      }
    }
  },
  data() {
    return {
      form: {},
      loading: true,
      isSubmitting: false
    }
  },
  computed: {
    method() {
      return this.getMethod(this)
    },
    iUrl() {
      return this.getUrl()
    }
  },
  async created() {
    this.loading = true
    try {
      const values = await this.getFormValue()
      this.form = Object.assign(this.form, values)
    } finally {
      this.loading = false
    }
  },
  methods: {
    handleSubmit(values) {
      let handler = this.onSubmit || this.defaultOnSubmit
      handler = handler.bind(this)
      values = this.cleanFormValue(values)
      return handler(values)
    },
    defaultOnSubmit(validValues) {
      this.isSubmitting = true
      this.performSubmit(validValues)
        .then((res) => this.onPerformSuccess.bind(this)(res, this.method, this))
        .catch((error) => this.onPerformError(error, this.method, this))
        .finally(() => { this.isSubmitting = false })
    },
    async getFormValue() {
      if (this.method !== 'put') {
        return Object.assign(this.form, this.initial)
      }
      let object = this.object
      if (object === null) {
        object = await this.getObjectDetail()
        this.$emit('update:object', object)
      }
      return object
    },
    async getObjectDetail() {
      return this.$axios.get(this.iUrl)
    }
  }
}
</script>

<style scoped>
  .ibox >>> .el-card__body {
    padding-top: 30px;
  }

</style>
