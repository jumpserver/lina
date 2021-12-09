<template>
  <BaseSMS :title="$t('setting.AlibabaCloud')" :config="$data" />
</template>

<script>
import BaseSMS from './Base'
import { UpdateToken } from '@/components/FormFields'

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
          title: this.$t('common.Test'),
          callback: function(value, form) {
            vm.$axios.post(
              `/api/v1/settings/alibaba/testing/`,
              value
            ).then(res => {
              vm.$message.success(res['msg'])
            }).catch(() => {
              this.$log.error('err occur')
            })
          }
        }
      ],
      fields: [
        [
          this.$t('common.BasicInfo'),
          [
            'ALIBABA_ACCESS_KEY_ID', 'ALIBABA_ACCESS_KEY_SECRET'
          ]
        ],
        [
          this.$t('setting.VerifySignTmpl'),
          [
            'ALIBABA_VERIFY_SIGN_NAME', 'ALIBABA_VERIFY_TEMPLATE_CODE'
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
        ALIBABA_VERIFY_SIGN_TMPL: {
          fields: ['SIGN_NAME', 'TEMPLATE_CODE'],
          fieldsMeta: {
          }
        },
        ALIBABA_ACCESS_KEY_SECRET: {
          component: UpdateToken
        }
      },
      submitMethod() {
        return 'patch'
      }
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
