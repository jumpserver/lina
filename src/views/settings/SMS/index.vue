<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" class="form" />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import IBox from '@/components/IBox'
import SMSAlibaba from './SMSAlibaba'
import SMSTencent from './SMSTencent'

export default {
  name: 'Auth',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=sms',
      fields: [
        [
          this.$t('setting.Basic'), [
            'SMS_ENABLED', 'SMS_BACKEND'
          ]
        ],
        [
          this.$t('setting.SMSProvider'), [
            'ALIYUN', 'QCLOUD'
          ]
        ]
      ],
      fieldsMeta: {
        ALIYUN: {
          label: this.$t('setting.AlibabaCloud'),
          component: SMSAlibaba,
          hidden: (form) => {
            return form['SMS_BACKEND'] !== 'alibaba'
          }
        },
        QCLOUD: {
          label: this.$t('setting.TencentCloud'),
          component: SMSTencent,
          hidden: (form) => {
            return form['SMS_BACKEND'] !== 'tencent'
          }
        }
      },
      submitMethod() {
        return 'patch'
      },
      cleanFormValue(data) {
        // 这个页面不去提交auth这些
        const removeFields = [
          'SET_UP'
        ]
        for (const i of removeFields) {
          delete data[i]
        }
        return data
      }
    }
  },
  methods: {}
}
</script>

<style scoped>
.form >>> .form-buttons {
  padding-top: 50px;
}

</style>
