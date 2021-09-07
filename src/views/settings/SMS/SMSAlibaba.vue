<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import { JsonRequired } from '@/components/DataForm/rules'
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
          title: this.$t('setting.SMS'),
          callback: function(value, form) {
            if (value['ALIBABA_SMS_SIGN_AND_TEMPLATES']) {
              value['ALIBABA_SMS_SIGN_AND_TEMPLATES'] = JSON.parse(value['ALIBABA_SMS_SIGN_AND_TEMPLATES'])
            }
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
            'AUTH_SMS', 'SMS_TEST_PHONE',
            'ALIBABA_ACCESS_KEY_ID', 'ALIBABA_ACCESS_KEY_SECRET', 'ALIBABA_SMS_SIGN_AND_TEMPLATES'
          ]
        ]
      ],
      fieldsMeta: {
        ALIBABA_SMS_SIGN_AND_TEMPLATES: {
          component: 'el-input',
          el: {
            type: 'textarea'
          },
          label: this.$t('setting.SignaturesAndTemplates'),
          rules: [JsonRequired]
        }
      },
      afterGetFormValue(obj) {
        obj.ALIBABA_SMS_SIGN_AND_TEMPLATES = JSON.stringify(obj.ALIBABA_SMS_SIGN_AND_TEMPLATES)
        return obj
      },
      cleanFormValue(data) {
        if (data['ALIBABA_SMS_SIGN_AND_TEMPLATES']) {
          data['ALIBABA_SMS_SIGN_AND_TEMPLATES'] = JSON.parse(data['ALIBABA_SMS_SIGN_AND_TEMPLATES'])
        }
        return data
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
