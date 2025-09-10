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
  name: 'MsgTemplate',
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
                  this.selectTemplateName = item.template_name
                  this.variables = item.contexts
                  this.source = item.source
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
      source: 'original',
      selectTemplateName: '',
      variablesHelpText: '您可以选择一个模板在模板内容中使用 {{ key }} 读取内置变量,注意：只支持 {{ }} 语法，其他语法不支持。例如  {% if title %}',
      hasSaveContinue: false,
      performSubmit(validValues) {
        return this.$axios['patch']('/api/v1/notifications/templates/edit/', validValues).then(res => {
          this.$router.push({ name: 'Msg', query: { t: new Date().getTime() } })
        })
      },
      moreButtons: [
        {
          title: this.$t('Reset'),
          type: 'default',
          hidden: () => this.source === 'original',
          callback: (value, form, btn) => {
            console.log(value, form, btn)
            return this.$axios['post']('/api/v1/notifications/templates/reset/', { template_name: this.selectTemplateName }).then(
              () => {
                this.$router.push({ name: 'Msg', query: { t: new Date().getTime() } })
                this.$message.success(this.$t('ResetSuccessfully'))
              }
            )
          }
        }
      ]
    }
  },
  computed: {
    variable() {
      return variable
    }
  },
  mounted() {
    this.fetchTemplates()
  },
  methods: {
    fetchTemplates() {
      this.$axios.get('/api/v1/notifications/templates/').then(data => {
        if (data.length > 0) {
          this.templates = data
          this.fieldsMeta.EMAIL_TEMPLATE_NAME.el.options = data.map(item => ({
            label: item.subject,
            value: item.template_name
          }))
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
