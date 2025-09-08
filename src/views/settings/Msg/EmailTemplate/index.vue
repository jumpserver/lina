<template>
  <div>
    <IBox>
      <GenericCreateUpdateForm
        :create-success-next-route="successUrl"
        :update-success-next-route="successUrl"
        v-bind="$data"
      />
    </IBox>
    <VariablesHelpTextDialog
      :variables-help-text="variablesHelpText"
      :variables="variables"
      :visible.sync="showHelpDialog"
    />
  </div>
</template>

<script>
import { IBox } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import MarkDownEditor from '@/views/settings/Msg/Email/markDownEditor.vue'
import { Select2 } from '@/components/Form/FormFields'
import VariablesHelpTextDialog from '@/components/Apps/VariablesHelpTextDialog'
import variable from '@/views/ops/Template/components/Variable.vue'

export default {
  name: 'EmailTemplate',
  components: {
    GenericCreateUpdateForm,
    IBox,
    VariablesHelpTextDialog
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
          helpTextFormatter: () => {
            const handleClick = () => {
              this.showHelpDialog = true
            }
            return (
              <i onClick={handleClick} class='fa fa-question-circle' style='cursor: pointer'>{this.$t('Help')}</i>
            )
          },
          component: Select2,
          el: {
            multiple: false,
            options: []
          },
          on: {
            change: ([event], updateForm) => {
              vm.templates.map(item => {
                if (item.template_name === event) {
                  this.variables = item.context_example
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
      successUrl: { name: 'Msg' },
      showHelpDialog: false,
      variables: [],
      variablesHelpText: '您可以选择一个模板在模板内容中使用 {{ key }} 读取内置变量',
      hasSaveContinue: false,
      performSubmit(validValues) {
        console.log(validValues)
        return this.$axios['patch']('/api/v1/notifications/templates/edit/', validValues)
      }
    }
  },
  computed: {
    variable() {
      return variable
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
