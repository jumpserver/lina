<template>
  <div>
    <IBox>
      <GenericCreateUpdateForm
        :key="templateFormKey"
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
import { scopedLocalStorage as localStorage } from '@/utils/storage'

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
        EMAIL_SUBJECT_PREFIX: '',
        template_name: localStorage.getItem('selectTemplateName') || 'users/_msg_user_created.html',
        template_content: ''
      },
      fields: [
        [this.$t('Basic'), [
          'EMAIL_SUBJECT_PREFIX',
          'template_name',
          'template_content'
        ]]
      ],
      fieldsMeta: {
        EMAIL_SUBJECT_PREFIX: {
          rules: [
            {
              required: true,
              message: this.$t('FieldRequiredError'),
              trigger: 'blur'
            }
          ]
        },
        template_name: {
          label: this.$t('Name'),
          helpTextFormatter: () => {
            const handleClick = () => {
              this.showHelpDialog = true
            }
            return (
              <i onClick={handleClick} class='fa fa-question-circle' style='cursor: pointer'>
                {this.$t('Help')}
              </i>
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
                const selectedTemplate = vm.templates.find(item => item.template_name === event)
                vm.applySelectedTemplate(selectedTemplate, updateForm)
              }, 500)
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
      templateFormKey: 0,
      successUrl: { name: 'Msg' },
      showHelpDialog: false,
      variables: [],
      html: '',
      source: 'original',
      selectTemplateName: '',
      variablesHelpText: this.$t('TemplateVariablesHelpText'),
      hasButtons: true,
      hasSaveContinue: false,
      onPerformError() {
      },
      moreButtons: [
        {
          title: this.$t('Reset'),
          loading: false,
          callback: async function(value, form, btn) {
            btn.loading = true
            try {
              const templateName = value.template_name || vm.selectTemplateName || vm.initial.template_name
              await vm.$axios.post('/api/v1/notifications/templates/reset/', {
                template_name: templateName
              })
              await vm.fetchTemplates()
              vm.$message.success(vm.$t('ResetSuccessfully'))
            } finally {
              btn.loading = false
            }
          }
        }
      ],
      performSubmit(validValues) {
        const payload = { ...validValues }
        payload.render_html = vm.html

        return vm.$axios.patch('/api/v1/settings/setting/?category=email_content', {
          EMAIL_SUBJECT_PREFIX: payload.EMAIL_SUBJECT_PREFIX
        }).then(() => {
          return vm.$axios.patch('/api/v1/notifications/templates/edit/', {
            template_name: payload.template_name,
            template_content: payload.template_content,
            render_html: payload.render_html
          })
        }).then(() => {
          vm.$router.push({ name: 'Msg', query: { t: new Date().getTime() } })
        })
      }
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
    applyEmailContentFieldMeta(remoteMeta = {}) {
      const emailSubjectPrefixMeta = remoteMeta.EMAIL_SUBJECT_PREFIX || {}
      this.fieldsMeta.EMAIL_SUBJECT_PREFIX = {
        label: emailSubjectPrefixMeta.label,
        helpText: emailSubjectPrefixMeta.help_text,
        rules: this.fieldsMeta.EMAIL_SUBJECT_PREFIX.rules
      }
    },
    applySelectedTemplate(template, updateForm) {
      if (!template) {
        return
      }
      this.selectTemplateName = template.template_name
      localStorage.setItem('selectTemplateName', template.template_name)
      this.variables = template.contexts
      this.source = template.source
      this.html = template.content || ''
      if (typeof updateForm === 'function') {
        updateForm({
          template_name: template.template_name,
          template_content: (template.content || '').trimStart()
        })
      }
    },
    async fetchTemplates() {
      try {
        const [templates, emailSettings, emailContentMeta] = await Promise.all([
          this.$axios.get('/api/v1/notifications/templates/'),
          this.$axios.get('/api/v1/settings/setting/?category=email_content'),
          this.$store.dispatch('common/getUrlMeta', {
            url: '/api/v1/settings/setting/?category=email_content'
          })
        ])
        this.applyEmailContentFieldMeta(emailContentMeta.actions.PATCH || {})

        if (!templates.length) {
          this.$message.warning(this.$t('NoData'))
          return
        }

        this.templates = templates
        this.fieldsMeta.template_name.el.options = templates.map(item => ({
          label: item.subject,
          value: item.template_name
        }))

        const initialTemplateName = this.initial.template_name
        const selectedTemplate = templates.find(item => item.template_name === initialTemplateName) || templates[0]

        this.initial = {
          ...this.initial,
          EMAIL_SUBJECT_PREFIX: emailSettings.EMAIL_SUBJECT_PREFIX || '',
          template_name: selectedTemplate.template_name,
          template_content: (selectedTemplate.content || '').trimStart()
        }

        this.variables = selectedTemplate.contexts
        this.source = selectedTemplate.source
        this.html = selectedTemplate.content || ''
        this.selectTemplateName = selectedTemplate.template_name
        localStorage.setItem('selectTemplateName', selectedTemplate.template_name)

        this.templateFormKey += 1
      } catch (error) {
        const message = error?.response?.data?.error || error?.message || this.$t('UnknownError')
        this.$message.error(message)
      }
    }
  }
}
</script>

<style scoped></style>
