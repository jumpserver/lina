<template>
  <Page v-loading="loading">
    <IBox v-if="!loading">
      <AutoDataForm
        ref="form"
        :method="method"
        :form="form"
        :fields="fields"
        :url="totalUrl"
        v-bind="$attrs"
        v-on="$listeners"
        @submit="handleSubmit"
      />
    </IBox>
  </Page>
</template>
<script>
import { Page, IBox } from '@/layout/components'
import AutoDataForm from '@/components/AutoDataForm'
export default {
  name: 'GenericCreateUpdatePage',
  components: {
    Page, IBox, AutoDataForm
  },
  props: {
    url: {
      type: String,
      required: true
    },
    fields: {
      type: Array,
      default: () => {
        return []
      }
    },
    object: {
      type: Object,
      default: () => ({})
    },
    initial: {
      type: Object,
      default: () => ({})
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
  mounted() {
    if (this.method === 'put') {
      this.getObjectDetail()
    } else {
      this.form = Object.assign(this.form, this.initial)
      this.loading = false
    }
  },
  methods: {
    handleSubmit(values) {
      let handler = this.onSubmit || this.defaultOnSubmit
      handler = handler.bind(this)
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
        console.log(route)
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
    getObjectDetail() {
      this.$axios.get(this.totalUrl).then(data => {
        this.form = data
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
  .ibox >>> .el-card__body {
    padding-top: 30px;
  }

</style>
