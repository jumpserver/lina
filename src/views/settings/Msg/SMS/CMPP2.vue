<template>
  <BaseSMS ref="baseSms" :config="$data" :title="$tc('CMPP2')" />
</template>

<script>
import BaseSMS from './Base.vue'
import { PhoneInput, UpdateToken } from '@/components/Form/FormFields'
import { Required } from '@/components/Form/DataForm/rules'

export default {
  name: 'CMPP2',
  components: {
    BaseSMS
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=cmpp2`,
      hasDetailInMsg: false,
      visible: false,
      moreButtons: [
        {
          title: this.$t('Test'),
          loading: false,
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              `/api/v1/settings/sms/cmpp2/testing/`,
              value
            ).then(res => {
              vm.$message.success(res['msg'])
            }).catch((error) => {
              vm.$log.error('err occur')
              vm.$refs.baseSms.testPerformError(error)
            }).finally(() => {
              btn.loading = false
            })
          }
        }
      ],
      fields: [
        [
          this.$t('Basic'),
          [
            'CMPP2_HOST', 'CMPP2_PORT', 'CMPP2_SP_ID', 'CMPP2_SP_SECRET', 'CMPP2_SRC_ID', 'CMPP2_SERVICE_ID',
            'CMPP2_VERIFY_SIGN_NAME', 'CMPP2_VERIFY_TEMPLATE_CODE'
          ]
        ],
        [
          this.$t('Test'),
          [
            'SMS_TEST_PHONE'
          ]
        ]
      ],
      fieldsMeta: {
        CMPP2_SP_SECRET: {
          component: UpdateToken
        },
        SMS_TEST_PHONE: {
          rules: [Required],
          component: PhoneInput
        }
      },
      submitMethod() {
        return 'patch'
      }
    }
  }
}
</script>
