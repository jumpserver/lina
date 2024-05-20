<template>
  <div>
    <el-alert :closable="false" :title="helpMessage" type="success" />
    <BaseSMS ref="baseSms" :config="$data" :title="$tc('Custom')" />
  </div>
</template>

<script>
import BaseSMS from './Base.vue'
import { PhoneInput } from '@/components/Form/FormFields'

export default {
  name: 'SMSFileCustom',
  components: {
    BaseSMS
  },
  data() {
    const vm = this
    return {
      helpMessage: this.$t('CustomFile'),
      url: `/api/v1/settings/setting/?category=custom_file`,
      hasDetailInMsg: false,
      visible: false,
      moreButtons: [
        {
          title: this.$t('Test'),
          loading: false,
          callback: function(value, form, btn) {
            btn.loading = true
            vm.$axios.post(
              `/api/v1/settings/sms/custom_file/testing/`,
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
          this.$t('Test'),
          [
            'SMS_TEST_PHONE'
          ]
        ]
      ],
      fieldsMeta: {
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
