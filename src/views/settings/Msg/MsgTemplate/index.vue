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
      initial: {
        template_name: localStorage.getItem('selectTemplateName') || 'terminal/_msg_session_sharing.html'
      },
      fields: [
        [this.$t('Basic'), [
          'template_name',
          'template_content'
        ]]
      ],
      fieldsMeta: {
        template_name: {
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
            input: ([event], updateForm) => {
              setTimeout(() => {
                vm.templates.map(item => {
                  if (item.template_name === event) {
                    this.selectTemplateName = item.template_name
                    localStorage.setItem('selectTemplateName', item.template_name)
                    this.variables = item.contexts
                    this.source = item.source
                    updateForm({
                      template_content: item.content.trimStart()
                    })
                  }
                })
              },
              500
              )
            }
          }
        },
        template_content: {
          component: MarkDownEditor,
          on: {
            htmlChange: ([html]) => {
              vm.html = html
            }
          }
        }
      },
      templates: [],
      successUrl: { name: 'Msg' },
      showHelpDialog: false,
      variables: [],
      html: '',
      source: 'original',
      selectTemplateName: '',
      variablesHelpText: this.$t('TemplateVariablesHelpText'),
      hasSaveContinue: false,
      onPerformError() {
      },
      performSubmit(validValues) {
        validValues['render_html'] = vm.html
        return this.$axios['patch']('/api/v1/notifications/templates/edit/', validValues).then(res => {
          this.$router.push({ name: 'Msg', query: { t: new Date().getTime() } })
        })
      },
      moreButtons: [
        {
          title: this.$t('Reset'),
          type: 'default',
          // hidden: () => this.source === 'original',
          callback: (value, form, btn) => {
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
          this.fieldsMeta.template_name.el.options = data.map(item => ({
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
