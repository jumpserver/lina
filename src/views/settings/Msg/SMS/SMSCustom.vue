<template>
  <BaseSMS ref="baseSms" :config="$data" :title="$tc('setting.Custom')" />
</template>

<script>
import BaseSMS from './Base.vue'
import { JsonEditor, PhoneInput } from '@/components/Form/FormFields'

export default {
  name: 'SMSCustom',
  components: {
    BaseSMS
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=custom`,
      hasDetailInMsg: false,
      visible: false,
      moreButtons: [
        {
          title: this.$t('common.Test'),
          loading: false,
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              `/api/v1/settings/sms/custom/testing/`,
              value
            ).then(res => {
              vm.$message.success(res['msg'])
            }).catch((error) => {
              vm.$log.error('err occur')
              vm.$refs.baseSms.testPerformError(error)
            }).finally(() => { btn.loading = false })
          }
        }
      ],
      fields: [
        [
          this.$t('common.BasicInfo'),
          [
            'CUSTOM_SMS_URL', 'CUSTOM_SMS_REQUEST_METHOD', 'CUSTOM_SMS_API_PARAMS'
          ]
        ],
        [
          this.$t('common.Other'),
          [
            'SMS_TEST_PHONE'
          ]
        ]
      ],
      fieldsMeta: {
        'CUSTOM_SMS_API_PARAMS': {
          label: this.$t('common.Params'),
          component: JsonEditor
        },
        SMS_TEST_PHONE: {
          component: PhoneInput
        }
      },
      submitMethod() {
        return 'patch'
      }
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
