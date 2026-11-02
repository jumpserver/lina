<template>
  <div>
    <el-alert :closable="false" :title="helpMessage" type="info" />
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
      encryptedFields: [],
      hasDetailInMsg: false,
      visible: false,
      moreButtons: [
        {
          title: this.$t('Test'),
          loading: false,
          callback: function(value, form, btn) {
            return vm.$refs.baseSms.testSettings(value, form, btn, 'custom_file')
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
  }
}
</script>
