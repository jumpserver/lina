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
import { CronTab } from '@/components'
import i18n from '@/i18n/i18n'
import VariableHelpDialog from '@/views/ops/Job/VariableHelpDialog'
import { Required } from '@/components/Form/DataForm/rules'

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
        [this.$t('common.Basic'), ['name', 'type', 'instant']],
        [this.$t('common.Task'), ['module', 'args', 'playbook', 'chdir', 'timeout']],
        [this.$t('ops.Asset'), ['assets', 'runas', 'runas_policy']],
        [this.$t('ops.Plan'), ['run_after_save', 'is_periodic', 'crontab']],
        [this.$t('common.Other'), ['comment']]
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
          helpText: this.$tc('ops.RunasPolicyHelpText')
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
          label: this.$t('ops.Module'),
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
              url: '/api/v1/ops/playbooks/',
              transformOption: (item) => {
                return { label: item.name, value: item.id }
              }
            }
          }
        },
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          label: this.$t('perms.Asset'),
          rules: [Required],
          el: {
            baseUrl: '/api/v1/perms/users/self/assets/',
            baseNodeUrl: '/api/v1/perms/users/self/nodes/',
            value: []
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
                tip: this.$t('ops.SaveCommand'),
                align: 'right',
                callback: () => {
                  this.showHelpDialog = true
                }
              }
            ]
          }
        },
        timeout: {
          helpText: i18n.t('ops.TimeoutHelpText')
        },
        instant: {
          hidden: () => {
            return true
          }
        },
        chdir: {
          helpText: i18n.t('ops.ChdirHelpText'),
          hidden: (formValue) => {
            return formValue.type !== 'adhoc'
          }
        },
        run_after_save: {
          type: 'checkbox',
          hidden: (formValue) => {
            return this.instantTask
          }
        },
        is_periodic: {
          type: 'switch',
          hidden: () => {
            return this.instantTask
          }
        },
        crontab: {
          type: 'cronTab',
          component: CronTab,
          label: i18n.t('xpack.RegularlyPerform'),
          hidden: (formValue) => {
            return formValue.is_periodic === false
          },
          helpText: i18n.t('xpack.HelpText.CrontabOfCreateUpdatePage')
        }
      }
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
  methods: {}
}

</script>

<style scoped>

</style>
