<template>
  <AutoDataForm
    v-if="!loading"
    ref="form"
    :method="method"
    :form="form"
    :fields="fields"
    :url="totalUrl"
    v-bind="$attrs"
    v-on="$listeners"
    @submit="handleSubmit"
  >
    <template #button-start>
      <slot name="button-start" />
    </template>
    <template #button-end>
      <slot name="button-end" />
    </template>
  </AutoDataForm>
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
        return this.$tc('Create success')
      }
    },
    updateSuccessMsg: {
      type: String,
      default: function() {
        return this.$tc('Update success')
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
    getUrl: {
      type: Function,
      default: function() {
        const params = this.$route.params
        let url = this.url
        if (params.id) {
          url = `${url}/${params.id}/`
        }
        return url
      }
    }
  },
  data() {
    return {
      form: {},
      loading: true
    }
  },
  computed: {
    method() {
      return this.getMethod(this)
    },
    totalUrl() {
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
      return this.$axios[this.method](this.totalUrl, validValues)
    },
    defaultOnSubmit(validValues) {
      const performSubmit = this.performSubmit || this.defaultPerformSubmit
      const msg = this.method === 'post' ? this.createSuccessMsg : this.updateSuccessMsg
      const route = this.method === 'post' ? this.createSuccessNextRoute : this.updateSuccessNextRoute
      performSubmit(validValues).then(() => {
        this.$message.success(msg)
        this.$router.push(route)
      }).catch(error => {
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
      return this.$axios.get(this.totalUrl)
    }
  }
}
</script>

<style scoped>
  .ibox >>> .el-card__body {
    padding-top: 30px;
  }

</style>
