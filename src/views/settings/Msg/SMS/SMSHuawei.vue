<template>
  <BaseSMS ref="baseSms" :config="$data" :title="$tc('HuaweiCloud')" />
</template>

<script>
import BaseSMS from './Base.vue'
import { PhoneInput, UpdateToken } from '@/components/Form/FormFields'
import { Required } from '@/components/Form/DataForm/rules'

export default {
  name: 'SMSHuawei',
  components: {
    BaseSMS
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=huawei`,
      hasDetailInMsg: false,
      visible: false,
      moreButtons: [
        {
          title: this.$t('Test'),
          loading: false,
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              `/api/v1/settings/sms/huawei/testing/`,
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
            'HUAWEI_APP_KEY', 'HUAWEI_APP_SECRET', 'HUAWEI_SMS_ENDPOINT'
          ]
        ],
        [
          this.$t('Template'),
          [
            'HUAWEI_SIGN_CHANNEL_NUM', 'HUAWEI_VERIFY_SIGN_NAME', 'HUAWEI_VERIFY_TEMPLATE_CODE'
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
        HUAWEI_VERIFY_SIGN_TMPL: {
          fields: ['SIGN_NAME', 'TEMPLATE_CODE'],
          fieldsMeta: {}
        },
        HUAWEI_APP_SECRET: {
          component: UpdateToken
        },
        HUAWEI_SIGN_CHANNEL_NUM: {
          label: this.$t('SignChannelNum')
        },
        HUAWEI_SMS_ENDPOINT: {
          label: this.$t('AppEndpoint')
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
