<template>
  <BaseSMS :title="$t('setting.TencentCloud')">
    <GenericCreateUpdateForm v-bind="$data" />
  </BaseSMS>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import BaseSMS from './Base'

export default {
  name: 'SMSTencent',
  components: {
    BaseSMS,
    GenericCreateUpdateForm
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=tencent`,
      hasDetailInMsg: false,
      moreButtons: [
        {
          title: this.$t('common.Test'),
          callback: function(value, form) {
            vm.$axios.post(
              `/api/v1/settings/tencent/testing/`,
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
            'TENCENT_SECRET_ID', 'TENCENT_SECRET_KEY', 'TENCENT_SDKAPPID'
          ]
        ],
        [
          this.$t('setting.VerifySignTmpl'),
          [
            'TENCENT_VERIFY_SIGN_NAME', 'TENCENT_VERIFY_TEMPLATE_CODE'
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
        TENCENT_VERIFY_SIGN_TMPL: {
          fields: ['SIGN_NAME', 'TEMPLATE_CODE'],
          fieldsMeta: {
          }
        }
      },
      submitMethod() {
        return 'put'
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
