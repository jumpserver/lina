<template>
  <div v-if="ready">
    <GenericCreateUpdatePage ref="form" v-bind="$data" />
  </div>
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import AssetSelect from '@/components/AssetSelect'
import { JsonEditor } from '@/components/FormFields'
import JobCodeEditor from '@/views/ops/Job/JobCodeEditor'
import { CronTab } from '@/components'
import i18n from '@/i18n/i18n'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      ready: false,
      showOpenAdhocDialog: false,
      instantTask: false,
      jobType: '',
      url: '/api/v1/ops/jobs/',
      fields: [
        [this.$t('common.Basic'), ['name', 'type', 'instant', 'comment']],
        [this.$t('common.Task'), ['module', 'args', 'playbook', 'chdir', 'timeout']],
        [this.$t('ops.Asset'), ['assets', 'runas', 'runas_policy']],
        [this.$t('ops.Parameter'), ['use_parameter_define', 'parameters_define']],
        [this.$t('ops.Plan'), ['runAfterSave', 'is_periodic', 'crontab']]
      ],
      initial: {
        type: 'adhoc',
        module: 'shell',
        args: '',
        runas_policy: 'skip',
        runAfterSave: false,
        instant: false,
        parameters_define: '{}',
        timeout: 60,
        is_periodic: false,
        crontab: '0 0 * * *'
      },
      fieldsMeta: {
        name: {
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
            return this.instantTask
          }
        },
        module: {
          label: this.$t('ops.Module'),
          hidden: (formValue) => {
            return formValue.type !== 'adhoc'
          }
        },
        playbook: {
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
          rules: [{
            required: false
          }],
          el: {
            value: []
          }
        },
        args: {
          hidden: (formValue) => {
            return formValue.type !== 'adhoc'
          },
          component: JobCodeEditor
        },
        instant: {
          hidden: () => {
            return true
          }
        },
        parameters_define: {
          label: this.$t('ops.Variable'),
          component: JsonEditor,
          hidden: (formValue) => {
            return !formValue.use_parameter_define
          }
        },
        chdir: {
          hidden: (formValue) => {
            return formValue.type !== 'adhoc'
          }
        },
        runAfterSave: {
          label: '保存后立即执行',
          type: 'checkbox',
          hidden: (formValue) => {
            return this.instantTask
          }
        },
        use_parameter_define: {
          type: 'switch',
          hidden: () => {
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
    if (this.$route.query && this.$route.query.type && this.$route.query.id) {
      this.initial.type = 'adhoc'
      switch (this.$route.query.type) {
        case 'adhoc':
          this.initial.type = 'adhoc'
          this.$axios.get(`/api/v1/ops/adhocs/${this.$route.query.id}`).then((data) => {
            this.initial.module = data.module
            this.initial.args = data.args
            this.initial.instant = true
            this.initial.runAfterSave = true
            this.instantTask = true
            this.createSuccessNextRoute = { name: 'Adhoc' }
            this.ready = true
          })
          break
        case 'playbook':
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
