<template>
  <BaseSMS ref="baseSms" :config="$data" :title="$tc('AlibabaCloud')" />
</template>

<script>
import BaseSMS from './Base.vue'
import { PhoneInput, UpdateToken } from '@/components/Form/FormFields'
import { Required } from '@/components/Form/DataForm/rules'

export default {
  name: 'SMSAlibaba',
  components: {
    BaseSMS
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=alibaba`,
      hasDetailInMsg: false,
      visible: false,
      moreButtons: [
        {
          title: this.$t('Test'),
          loading: false,
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              `/api/v1/settings/sms/alibaba/testing/`,
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
            'ALIBABA_ACCESS_KEY_ID', 'ALIBABA_ACCESS_KEY_SECRET'
          ]
        ],
        [
          this.$t('Template'),
          [
            'ALIBABA_VERIFY_SIGN_NAME', 'ALIBABA_VERIFY_TEMPLATE_CODE'
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
        ALIBABA_VERIFY_SIGN_TMPL: {
          fields: ['SIGN_NAME', 'TEMPLATE_CODE'],
          fieldsMeta: {}
        },
        ALIBABA_ACCESS_KEY_SECRET: {
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
