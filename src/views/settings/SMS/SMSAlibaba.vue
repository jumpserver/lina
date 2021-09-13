<template>
  <BaseSMS :title="$t('setting.AlibabaCloud')">
    <GenericCreateUpdateForm v-bind="$data" />
  </BaseSMS>
</template>

<script>
import BaseSMS from './Base'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'

export default {
  name: 'SMSAlibaba',
  components: {
    GenericCreateUpdateForm,
    BaseSMS
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=alibaba`,
      hasDetailInMsg: false,
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
