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

export default {
  name: 'Syslog',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    return {
      helpText: this.$t('SyslogHelpText'),
      fields: [
        [this.$t('Basic'), ['SYSLOG_ENABLED']],
        [this.$t('Server'), ['SYSLOG_ADDR', 'SYSLOG_FACILITY', 'SYSLOG_SOCKTYPE']]
      ],
      fieldsMeta: {
        SYSLOG_ENABLED: {
          type: 'checkbox',
          label: this.$t('SyslogEnable')
        },
        SYSLOG_ADDR: {
          label: this.$t('SyslogAddr'),
          hidden: (formValue) => !formValue.SYSLOG_ENABLED
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
        }
      },
      afterGetFormValue(obj) {
        obj.SYSLOG_ENABLED = !!obj.SYSLOG_ADDR
        return obj
      },
      cleanFormValue(data) {
        if (!data.SYSLOG_ENABLED) {
          data.SYSLOG_ADDR = ''
          data.SYSLOG_FACILITY = ''
        }
        delete data.SYSLOG_ENABLED
        return data
      },
      hasDetailInMsg: false,
      successUrl: { name: 'Msg' },
      url: '/api/v1/settings/setting/?category=syslog',
      submitMethod() {
        return 'put'
      }
    }
  },
  methods: {}
}
</script>

<style scoped></style>
