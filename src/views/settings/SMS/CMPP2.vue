<template>
  <BaseSMS ref="baseSms" :title="$t('setting.CMPP2')" :config="$data" />
</template>

<script>
import BaseSMS from './Base'
import { UpdateToken } from '@/components/FormFields'

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
          title: this.$t('common.Test'),
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
            }).finally(() => { btn.loading = false })
          }
        }
      ],
      fields: [
        [
          this.$t('common.BasicInfo'),
          [
            'CMPP2_HOST', 'CMPP2_PORT', 'CMPP2_SP_ID', 'CMPP2_SP_SECRET', 'CMPP2_SRC_ID', 'CMPP2_SERVICE_ID',
            'CMPP2_VERIFY_SIGN_NAME', 'CMPP2_VERIFY_TEMPLATE_CODE'
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
        CMPP2_SP_SECRET: {
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
