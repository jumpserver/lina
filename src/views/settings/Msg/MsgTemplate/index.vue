<template>
  <div>
    <IBox v-loading="loading">
      <GenericCreateUpdateForm v-if="!loading" v-bind="$data" />
    </IBox>
    <VariablesHelpTextDialog
      v-model:visible="showHelpDialog"
      :variables-help-text="variablesHelpText"
      :variables="variables"
    />
  </div>
</template>

<script lang="jsx">
import { IBox } from '@/components'
import VariablesHelpTextDialog from '@/components/Apps/VariablesHelpTextDialog'
import { Select2 } from '@/components/Form/FormFields'
import { GenericCreateUpdateForm } from '@/layout/components'
import variable from '@/views/ops/Template/components/Variable.vue'
import MarkDownEditor from '@/views/settings/Msg/Email/markDownEditor.vue'
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
        template_name:
          localStorage.getItem('selectTemplateName') || 'terminal/_msg_session_sharing.html'
      },
      fields: [[this.$t('Basic'), ['template_name', 'template_content']]],
      fieldsMeta: {
        template_name: {
          label: this.$t('Name'),
          helpTextFormatter: () => {
            const handleClick = () => {
              this.showHelpDialog = true
            }
            return (
              <i onClick={handleClick} class="fa fa-question-circle" style="cursor: pointer">
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
              const template = vm.templates.find((item) => item.template_name === event)
              vm.selectTemplate(template, updateForm)
            }
          }
        },
        template_content: {
          // 保留表单 label 列的占位，使编辑器左边界与上方名称控件对齐。
          // 不能用空格：字段生成器会 trim；零宽空格不会显示，也不会被 trim。
          label: '\u200B',
          component: MarkDownEditor,
          on: {
            htmlChange: ([html]) => {
              vm.html = html
            }
          }
        }
      },
      templates: [],
      loading: true,
      showHelpDialog: false,
      variables: [],
      html: '',
      source: 'original',
      selectTemplateName: '',
      variablesHelpText: 'TemplateVariablesHelpText',
      hasSaveContinue: false,
      hasReset: false,
      hasDetailInMsg: false,
      needGetObjectDetail: false,
      submitMethod: () => 'patch',
      cleanFormValue(validValues) {
        return {
          template_name: validValues.template_name,
          template_content: validValues.template_content,
          render_html: vm.html
        }
      },
      performSubmit(validValues) {
        return this.$axios.patch('/api/v1/notifications/templates/edit/', validValues)
      },
      onPerformSuccess(res, method) {
        vm.source = 'custom'
        this.emitPerformSuccessMsg(method, res)
      },
      moreButtons: [
        {
          title: this.$t('Reset'),
          type: 'default',
          // hidden: () => this.source === 'original',
          callback: (value, form, btn) => {
            const templateName = value.template_name || this.selectTemplateName
            return this.$axios['post']('/api/v1/notifications/templates/reset/', {
              template_name: templateName
            }).then(() => {
              return this.fetchTemplates(templateName).then(() => {
                this.$message.success(this.$t('ResetSuccessfully'))
              })
            })
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
    async fetchTemplates(preferredTemplateName) {
      this.loading = true
      try {
        const data = await this.$axios.get('/api/v1/notifications/templates/')
        this.templates = data
        this.fieldsMeta.template_name.el.options = data.map((item) => ({
          label: item.subject,
          value: item.template_name
        }))

        const selectedName =
          preferredTemplateName ||
          localStorage.getItem('selectTemplateName') ||
          this.initial.template_name
        const selectedTemplate = data.find((item) => item.template_name === selectedName) || data[0]
        this.selectTemplate(selectedTemplate)
      } finally {
        this.loading = false
      }
    },
    selectTemplate(template, updateForm) {
      if (!template) {
        return
      }

      const formValue = {
        template_name: template.template_name,
        template_content: (template.content || '').trimStart()
      }
      this.selectTemplateName = template.template_name
      this.variables = template.contexts || []
      this.source = template.source
      localStorage.setItem('selectTemplateName', template.template_name)

      if (updateForm) {
        updateForm(formValue)
      } else {
        this.initial = formValue
      }
    }
  }
}
</script>

<style scoped></style>
