<template>
  <BaseSMS ref="baseSms" :config="$data" :title="$tc('TencentCloud')" />
</template>

<script>
import BaseSMS from './Base.vue'
import { PhoneInput, UpdateToken } from '@/components/Form/FormFields'
import { Required } from '@/components/Form/DataForm/rules'

export default {
  name: 'SMSTencent',
  components: {
    BaseSMS
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=tencent`,
      hasDetailInMsg: false,
      visible: false,
      moreButtons: [
        {
          title: this.$t('Test'),
          loading: false,
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              `/api/v1/settings/sms/tencent/testing/`,
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
          this.$t('Basic'),
          [
            'TENCENT_SECRET_ID', 'TENCENT_SECRET_KEY', 'TENCENT_SDKAPPID'
          ]
        ],
        [
          this.$t('Template'),
          [
            'TENCENT_VERIFY_SIGN_NAME', 'TENCENT_VERIFY_TEMPLATE_CODE'
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
        TENCENT_VERIFY_SIGN_TMPL: {
          fields: ['SIGN_NAME', 'TEMPLATE_CODE'],
          fieldsMeta: {}
        },
        TENCENT_SECRET_KEY: {
          component: UpdateToken
        },
        SMS_TEST_PHONE: {
          rules: [Required],
          component: PhoneInput
        }
      },
      submitMethod() {
        return 'put'
      }
    }
  }
}
</script>
