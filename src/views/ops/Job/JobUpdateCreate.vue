<template>
  <div v-if="ready">
    <VariableHelpDialog :visible.sync="showHelpDialog" />
    <GenericCreateUpdatePage ref="form" v-bind="$data" />
  </div>
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import AssetSelect from '@/components/Apps/AssetSelect'
import CodeEditor from '@/components/Form/FormFields/CodeEditor'
import i18n from '@/i18n/i18n'
import VariableHelpDialog from '@/views/ops/Adhoc/VariableHelpDialog.vue'
import { Required } from '@/components/Form/DataForm/rules'
import { crontab, interval } from '@/views/accounts/const'
import LoadTemplateLink from '@/views/ops/Job/components/loadTemplateLink'
import Variable from '@/views/ops/Template/components/Variable'

export default {
  components: {
    GenericCreateUpdatePage,
    VariableHelpDialog
  },
  data() {
    return {
      ready: false,
      showHelpDialog: false,
      instantTask: false,
      url: '/api/v1/ops/jobs/',
      fields: [
        [this.$t('Basic'), ['name', 'type', 'instant']],
        [this.$t('Asset'), ['assets', 'nodes', 'runas', 'runas_policy']],
        [this.$t('Task'), ['module', 'argsLoadFromTemplate', 'args', 'playbook', 'variable', 'chdir', 'timeout', 'parameters']],
        [this.$t('Plan'), ['run_after_save', 'is_periodic', 'interval', 'crontab']],
        [this.$t('Other'), ['comment']]
      ],
      initial: {
        type: 'adhoc',
        module: 'shell',
        args: '',
        runas_policy: 'skip',
        runAfterSave: false,
        instant: false,
        parameters_define: '{}',
        is_periodic: false,
        crontab: '0 0 * * *'
      },
      fieldsMeta: {
        runas_policy: {
          helpText: this.$tc('RunasPolicyHelpText')
        },
        name: {
          rules: [Required],
          hidden: (formValue) => {
            return this.instantTask
          }
        },
        comment: {
          hidden: () => {
            return this.instantTask
          }
        },
        type: {
          hidden: () => {
            return true
          }
        },
        module: {
          label: this.$t('Module'),
          hidden: (formValue) => {
            return formValue.type !== 'adhoc'
          },
          on: {
            change: ([event], updateForm) => {
              this.fieldsMeta.args.el.options.mode = event
            }
          }
        },
        playbook: {
          rules: [Required],
          hidden: (formValue) => {
            return formValue.type !== 'playbook'
          },
          el: {
            multiple: false,
            value: [],
            ajax: {
              url: `/api/v1/ops/playbooks/?only_mine=true`,
              transformOption: (item) => {
                return { label: item.name, value: item.id }
              }
            }
          },
          on: {
            change: ([event], updateForm) => {
              this.queryParam = `playbook=${event.pk}`
              this.$axios.get(`/api/v1/ops/playbooks/${event.pk}/`,
              ).then(data => {
                data?.variable.map(item => {
                  delete item.job
                  delete item.playbook
                  delete item.id
                  return item
                })
                updateForm({ variable: data.variable })
              })
            }
          }
        },
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          label: this.$t('Asset'),
          el: {
            baseUrl: '/api/v1/perms/users/self/assets/',
            baseNodeUrl: '/api/v1/perms/users/self/nodes/',
            typeUrl: '/api/v1/perms/users/self/nodes/children-with-assets/category/tree',
            value: []
          }
        },
        nodes: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/perms/users/self/nodes/',
              filterOption: (item) => {
                if (item.value !== 'favorite') {
                  return item
                }
              },
              transformOption: (item) => {
                return { label: item.full_value || item.name, value: item.id }
              }
            }
          }
        },
        argsLoadFromTemplate: {
          label: this.$t('Templates'),
          hidden: (formValue) => {
            return formValue.type !== 'adhoc'
          },
          component: LoadTemplateLink,
          on: {
            change: ([event], updateForm) => {
              updateForm({
                args: event.args,
                module: event.module.value,
                variable: event.variable
              })
            }
          }
        },
        args: {
          rules: [Required],
          hidden: (formValue) => {
            return formValue.type !== 'adhoc'
          },
          component: CodeEditor,
          el: {
            options: {
              mode: 'shell'
            },
            toolbar: [
              {
                type: 'button',
                icon: 'fa-question-circle',
                tip: this.$t('SaveCommand'),
                align: 'right',
                callback: () => {
                  this.showHelpDialog = true
                }
              }
            ]
          }
        },
        variable: {
          component: Variable
        },
        timeout: {
          helpText: i18n.t('TimeoutHelpText')
        },
        instant: {
          hidden: () => {
            return true
          }
        },
        chdir: {
          helpText: i18n.t('ChdirHelpText'),
          hidden: (formValue) => {
            return formValue.type !== 'adhoc'
          }
        },
        run_after_save: {
          type: 'checkbox',
          hidden: (formValue) => {
            return true
          }
        },
        is_periodic: {
          type: 'switch',
          hidden: () => {
            return this.instantTask
          }
        },
        parameters: {
          hidden: () => {
            return true
          }
        },
        interval,
        crontab
      },
      createSuccessNextRoute: { name: 'JobManagement' },
      updateSuccessNextRoute: { name: 'JobManagement' },
      cleanFormValue: (data) => {
        Object.assign(data, { periodic_variable: this.periodicVariableValue })
        return data
      },
      moreButtons: [
        {
          title: this.$t('ExecuteAfterSaving'),
          callback: (value, form, btn) => {
            form.value.run_after_save = true
            const parameters = form.value.variable.reduce((acc, item) => {
              acc[item.var_name] = item.default_value
              return acc
            }, {})
            form.value['parameters'] = parameters
            this.submitForm(form, btn)
          }
        }
      ]
    }
  },
  mounted() {
    if (this.$route.query && this.$route.query.type) {
      this.initial.type = 'adhoc'
      switch (this.$route.query.type) {
        case 'adhoc':
          this.initial.type = 'adhoc'
          if (this.$route.query.id) {
            this.$axios.get(`/api/v1/ops/adhocs/${this.$route.query.id}`).then((data) => {
              this.initial.module = data.module
              this.initial.args = data.args
              this.initial.instant = true
              this.initial.runAfterSave = true
              this.instantTask = true
              this.createSuccessNextRoute = { name: 'Adhoc' }
              this.ready = true
            })
          } else {
            this.ready = true
          }
          break
        case 'playbook':
          this.initial.type = 'playbook'
          if (this.$route.query.id) {
            this.initial.playbook = this.$route.query.id
            this.ready = true
          } else {
            this.ready = true
          }
          break
      }
    } else {
      this.ready = true
    }
  },
  methods: {
    submitForm(form, btn) {
      form.validate((valid) => {
        if (valid) {
          btn.loading = true
        }
      })
      this.$refs.form.$refs.createUpdateForm.$refs.form.$refs.dataForm.submitForm('form', false)
    }
  }
}

</script>

<style scoped>

</style>
