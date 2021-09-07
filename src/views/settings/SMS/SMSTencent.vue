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
  name: 'SMSTencent',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=tencent`,
      hasDetailInMsg: false,
      moreButtons: [
        {
          title: this.$t('setting.SMS'),
          callback: function(value, form) {
            if (value['TENCENT_SMS_SIGN_AND_TEMPLATES']) {
              value['TENCENT_SMS_SIGN_AND_TEMPLATES'] = JSON.parse(value['TENCENT_SMS_SIGN_AND_TEMPLATES'])
            }
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
            'AUTH_SMS', 'SMS_TEST_PHONE',
            'TENCENT_SECRET_ID', 'TENCENT_SECRET_KEY', 'TENCENT_SDKAPPID', 'TENCENT_SMS_SIGN_AND_TEMPLATES'
          ]
        ]
      ],
      fieldsMeta: {
        TENCENT_SMS_SIGN_AND_TEMPLATES: {
          component: 'el-input',
          el: {
            type: 'textarea'
          },
          label: this.$t('setting.SignaturesAndTemplates'),
          rules: [JsonRequired]
        }
      },
      afterGetFormValue(obj) {
        obj.TENCENT_SMS_SIGN_AND_TEMPLATES = JSON.stringify(obj.TENCENT_SMS_SIGN_AND_TEMPLATES)
        return obj
      },
      cleanFormValue(data) {
        if (data['TENCENT_SMS_SIGN_AND_TEMPLATES']) {
          data['TENCENT_SMS_SIGN_AND_TEMPLATES'] = JSON.parse(data['TENCENT_SMS_SIGN_AND_TEMPLATES'])
        }
        return data
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
