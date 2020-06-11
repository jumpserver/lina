<template>
  <AutoDataForm
    v-if="!loading"
    ref="form"
    :method="method"
    :form="form"
    :fields="fields"
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
    fields: {
      type: Array,
      default: () => {
        return []
      }
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
      default: null
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
    getNextRoute: {
      type: Function,
      default(res, method) {
        return method === 'post' ? this.createSuccessNextRoute : this.updateSuccessNextRoute
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
  async mounted() {
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
    defaultPerformSubmit(validValues) {
      return this.$axios[this.method](this.iUrl, validValues)
    },
    defaultOnSubmit(validValues) {
      const performSubmit = this.performSubmit || this.defaultPerformSubmit
      const msg = this.method === 'post' ? this.createSuccessMsg : this.updateSuccessMsg
      const event = this.method === 'post' ? 'createSuccess' : 'updateSuccess'
      this.isSubmitting = true
      performSubmit(validValues).then((res) => {
        const route = this.getNextRoute(res, this.method)
        this.$emit(event, res)
        this.$emit('submitSuccess', res)
        this.$message.success(msg)
        setTimeout(() => this.$router.push(route), 100)
      }).catch(error => {
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
      }).finally(() => {
        this.isSubmitting = false
      })
    },
    async getFormValue() {
      if (this.method !== 'put') {
        return Object.assign(this.form, this.initial)
      }
      let object = this.object
      if (object === null) {
        object = await this.getObjectDetail()
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
