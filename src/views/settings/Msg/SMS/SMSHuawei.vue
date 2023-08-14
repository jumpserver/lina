<template>
  <BaseSMS ref="baseSms" :config="$data" :title="$tc('setting.HuaweiCloud')" />
</template>

<script>
import BaseSMS from './Base.vue'
import { PhoneInput, UpdateToken } from '@/components/Form/FormFields'

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
          title: this.$t('common.Test'),
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
          this.$t('common.BasicInfo'),
          [
            'HUAWEI_APP_KEY', 'HUAWEI_APP_SECRET', 'HUAWEI_SMS_ENDPOINT'
          ]
        ],
        [
          this.$t('setting.VerifySignTmpl'),
          [
            'HUAWEI_SIGN_CHANNEL_NUM', 'HUAWEI_VERIFY_SIGN_NAME', 'HUAWEI_VERIFY_TEMPLATE_CODE'
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
        HUAWEI_VERIFY_SIGN_TMPL: {
          fields: ['SIGN_NAME', 'TEMPLATE_CODE'],
          fieldsMeta: {}
        },
        HUAWEI_APP_SECRET: {
          component: UpdateToken
        },
        HUAWEI_SIGN_CHANNEL_NUM: {
          label: this.$t('setting.SignChannelNum')
        },
        HUAWEI_SMS_ENDPOINT: {
          label: this.$t('setting.AppEndpoint')
        },
        SMS_TEST_PHONE: {
          component: PhoneInput
        }
      },
      submitMethod() {
        return 'put'
      }
    }
  },
  computed: {},
  methods: {}
}
</script>

<style scoped>

</style>
