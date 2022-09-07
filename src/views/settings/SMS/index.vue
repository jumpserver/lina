<template>
  <GenericCreateUpdatePage v-bind="$data" class="form" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import SMSAlibaba from './SMSAlibaba'
import SMSTencent from './SMSTencent'
import SMSHuawei from './SMSHuawei'
import CMPP2 from './CMPP2'

export default {
  name: 'Auth',
  components: {
    GenericCreateUpdatePage
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
            'ALIYUN', 'QCLOUD', 'HUAWEICLOUD', 'CMPP2'
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
