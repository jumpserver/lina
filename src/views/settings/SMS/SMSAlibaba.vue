<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'

export default {
  name: 'SMSAlibaba',
  components: {
    IBox,
    GenericCreateUpdateForm
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
            'SMS_TEST_PHONE', 'ALIBABA_ACCESS_KEY_ID', 'ALIBABA_ACCESS_KEY_SECRET', 'ALIBABA_SMS_SIGN_AND_TEMPLATES'
          ]
        ]
      ],
      fieldsMeta: {
        ALIBABA_SMS_SIGN_AND_TEMPLATES: {
          fields: ['verification_code'],
          fieldsMeta: {
            verification_code: {
              fields: ['sign_name', 'template_code']
            }
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
