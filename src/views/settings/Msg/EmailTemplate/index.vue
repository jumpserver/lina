<template>
  <div>
    <IBox>
      <GenericCreateUpdateForm
        :create-success-next-route="successUrl"
        :update-success-next-route="successUrl"
        v-bind="$data"
      />
    </IBox>
  </div>
</template>

<script>
import { IBox } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import MarkDownEditor from '@/views/settings/Msg/Email/markDownEditor.vue'
import { Select2 } from '@/components/Form/FormFields'

export default {
  name: 'EmailTemplate',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    const vm = this
    return {
      helpText: this.$t('EmailHelpText'),
      encryptedFields: ['EMAIL_HOST_PASSWORD'],
      fields: [
        [this.$t('Basic'), [
          'EMAIL_TEMPLATE_NAME',
          'EMAIL_TEMPLATE_CONTENT'
        ]]
      ],
      fieldsMeta: {
        EMAIL_TEMPLATE_NAME: {
          label: this.$t('Name'),
          component: Select2,
          el: {
            multiple: false,
            options: []
          },
          on: {
            change: ([event], updateForm) => {
              vm.templates.map(item => {
                if (item.template_name === event) {
                  updateForm({
                    EMAIL_TEMPLATE_CONTENT: item.content
                  })
                }
              })
            }
          }
        },
        EMAIL_TEMPLATE_CONTENT: {
          component: MarkDownEditor
        }
      },
      templates: [],
      successUrl: { name: 'Msg' }
    }
  },
  mounted() {
    // 初始加载模板列表
    this.$axios.get('/api/v1/notifications/templates/').then(data => {
      console.log(data)
      if (data.length > 0) {
        this.templates = data
        this.fieldsMeta.EMAIL_TEMPLATE_NAME.el.options = data.map(item => ({
          label: item.label,
          value: item.template_name
        }))
      }
    })
  },
  methods: {}
}
</script>

<style scoped>

</style>
