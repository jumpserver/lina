<template>
  <Page>
    <IBox>
      <AutoDataForm ref="form" :form="form" :fields="fields" :url="url" v-bind="$attrs" v-on="$listeners" @submit="handleSubmit" />
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
    method: {
      type: String,
      default: 'post'
    },
    fields: {
      type: Array,
      default: () => {
        return []
      }
    },
    form: {
      type: Object,
      default: () => { return {} }
    },
    onSubmit: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
    }
  },
  computed: {
  },
  methods: {
    getFormRef(comp) {
      if (comp.$refs.form) {
        return this.getFormRef(comp.$refs.form)
      }
      return comp
    },
    handleSubmit(values, form) {
      let handler = this.onSubmit || this.defaultOnSubmit
      handler = handler.bind(this)
      const fields = form.$refs.elForm.fields
      console.log('submit', values)
      console.log('form.fields', fields)
      const field = fields[0]
      field.error = '滴滴滴滴滴多滴滴滴'
      return handler(values, form)
    },
    defaultOnSubmit(validValues, form) {
      this.$axios.post(this.url, validValues).then(() => {
        const msg = this.$tc('Create success')
        this.$message.success(msg)
        setTimeout(() => {
          this.$router.push({ name: 'UserList' })
        }, 500)
      }).catch(error => {
        console.log(form)
        const response = error.response
        const data = response.data
        if (response.status === 400) {
          this.errors.name = '你报错了滴滴滴'
          console.log(data)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
