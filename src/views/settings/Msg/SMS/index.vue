<template>
  <IBox>
    <GenericCreateUpdateForm class="form" v-bind="$data" />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'
import SMSAlibaba from './SMSAlibaba.vue'
import SMSTencent from './SMSTencent.vue'
import SMSHuawei from './SMSHuawei.vue'
import SMSCustom from './SMSCustom.vue'
import CMPP2 from './CMPP2.vue'
import { IBox } from '@/components'

export default {
  name: 'Auth',
  components: {
    GenericCreateUpdateForm,
    IBox
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
            'ALIYUN', 'QCLOUD', 'HUAWEICLOUD', 'CMPP2', 'SMSCustom'
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
        },
        HUAWEICLOUD: {
          label: this.$t('setting.HuaweiCloud'),
          component: SMSHuawei,
          hidden: (form) => {
            return form['SMS_BACKEND'] !== 'huawei'
          }
        },
        CMPP2: {
          label: this.$t('setting.CMPP2'),
          component: CMPP2,
          hidden: (form) => {
            return form['SMS_BACKEND'] !== 'cmpp2'
          }
        },
        SMSCustom: {
          label: this.$t('setting.Custom'),
          component: SMSCustom,
          hidden: (form) => {
            return form['SMS_BACKEND'] !== 'custom'
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
  padding-top: 30px;
}

</style>
