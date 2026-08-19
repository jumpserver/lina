<template>
  <div>
    <el-alert v-sanitize="helpText" type="info" />
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
import AddressInput from '@/components/Form/FormFields/AddressInput'
import { testSyslogSetting } from '@/api/settings'
import SyslogDocDownloadButton from './components/SyslogDocDownloadButton.vue'

export default {
  name: 'Syslog',
  components: {
    GenericCreateUpdateForm,
    IBox,
    SyslogDocDownloadButton
  },
  data() {
    const vm = this
    return {
      helpText: this.$t('SyslogHelpText'),
      fields: [
        [this.$t('Server'), ['SYSLOG_ENABLED', 'SYSLOG_HOST', 'SYSLOG_PORT', 'SYSLOG_FACILITY', 'SYSLOG_SOCKTYPE', 'SYSLOG_DOC']]
      ],
      fieldsMeta: {
        SYSLOG_ENABLED: {
          type: 'checkbox',
          label: this.$t('SyslogEnable')
        },
        SYSLOG_HOST: {
          label: this.$t('SyslogHost'),
          component: AddressInput,
          hidden: (formValue) => !formValue.SYSLOG_ENABLED
        },
        SYSLOG_PORT: {
          label: this.$t('SyslogPort'),
          hidden: (formValue) => !formValue.SYSLOG_ENABLED,
          type: 'input-number',
          el: {
            min: 1,
            max: 65535,
            step: 1
          }
        },
        SYSLOG_FACILITY: {
          label: this.$t('SyslogFacility'),
          hidden: (formValue) => !formValue.SYSLOG_ENABLED
        },
        SYSLOG_SOCKTYPE: {
          hidden: (formValue) => !formValue.SYSLOG_ENABLED,
          label: this.$t('SyslogSockType'),
          type: 'radio-group',
          options: [
            { label: 'UDP', value: 2 },
            { label: 'TCP', value: 1 }
          ]
        },
        SYSLOG_DOC: {
          hidden: (formValue) => !formValue.SYSLOG_ENABLED,
          label: this.$t('SyslogDoc'),
          component: SyslogDocDownloadButton
        }
      },
      afterGetFormValue(obj) {
        obj.SYSLOG_ENABLED = !!obj.SYSLOG_HOST
        return obj
      },
      cleanFormValue(data) {
        if (!data.SYSLOG_ENABLED) {
          data.SYSLOG_HOST = ''
          data.SYSLOG_PORT = 514
          data.SYSLOG_FACILITY = ''
        }
        delete data.SYSLOG_ENABLED
        delete data.SYSLOG_DOC
        return data
      },
      hasDetailInMsg: false,
      successUrl: { name: 'Msg' },
      url: '/api/v1/settings/setting/?category=syslog',
      submitMethod() {
        return 'put'
      },
      moreButtons: [
        {
          title: this.$t('SyslogTest'),
          loading: false,
          callback: function(value, form, btn) {
            const testValue = {}
            testValue['SYSLOG_HOST'] = value['SYSLOG_HOST']
            testValue['SYSLOG_PORT'] = value['SYSLOG_PORT']
            testValue['SYSLOG_FACILITY'] = value['SYSLOG_FACILITY']
            testValue['SYSLOG_SOCKTYPE'] = value['SYSLOG_SOCKTYPE']
            btn.loading = true
            testSyslogSetting(value)
              .then(res => {
                vm.$message.success(res['msg'])
              })
              .catch(res => {
                vm.$message.error(res['response']['data']['error'])
              })
              .finally(() => {
                btn.loading = false
              })
          }
        }
      ]
    }
  },
  methods: {}
}
</script>

<style scoped></style>
