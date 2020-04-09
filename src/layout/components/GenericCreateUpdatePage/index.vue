<template>
  <Page v-loading="loadding">
    <IBox>
      <AutoDataForm
        v-if="!loadding"
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
      loadding: true
    }
  },
  computed: {
    method() {
      const method = this.getMethod(this)
      return method
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
      this.loadding = false
    }
  },
  methods: {
    handleSubmit(values, form) {
      const f = this.$refs.form
      f.setFieldError('name', '怎么了')
      console.log(f.setFieldError)
      let handler = this.onSubmit || this.defaultOnSubmit
      handler = handler.bind(this)
      console.log('submit', values)
      return handler(values, form)
    },
    defaultPerformSubmit(validValues) {
      return this.$axios[this.method](this.totalUrl, validValues)
    },
    defaultOnSubmit(validValues, form) {
      this.defaultPerformSubmit(validValues).then(() => {
        const msg = this.$tc('Create success')
        this.$message.success(msg)
        this.$router.push({ name: 'UserList' })
      }).catch(error => {
        console.log(form)
        const response = error.response
        const data = response.data
        if (response.status === 400) {
          this.errors.name = '你报错了滴滴滴'
          console.log(data)
        }
      })
    },
    getObjectDetail() {
      this.$axios.get(this.totalUrl).then(data => {
        this.form = data
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.loadding = false
      })
    }
  }
}
</script>

<style scoped>

</style>
