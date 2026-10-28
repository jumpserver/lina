<template>
  <BaseSMS ref="baseSms" :config="$data" :title="$tc('Custom')" />
</template>

<script>
import BaseSMS from './Base.vue'
import { JsonEditor, PhoneInput } from '@/components/Form/FormFields'

export default {
  name: 'SMSCustom',
  components: {
    BaseSMS
  },
  data() {
    const vm = this
    return {
      url: `/api/v1/settings/setting/?category=custom`,
      encryptedFields: [],
      hasDetailInMsg: false,
      visible: false,
      moreButtons: [
        {
          title: this.$t('Test'),
          loading: false,
          callback: function(value, form, btn) {
            return vm.$refs.baseSms.testSettings(value, form, btn, 'custom')
          }
        }
      ],
      fields: [
        [
          this.$t('Basic'),
          [
            'CUSTOM_SMS_URL', 'CUSTOM_SMS_REQUEST_METHOD', 'CUSTOM_SMS_API_PARAMS'
          ]
        ],
        [
          this.$t('Test'),
          [
            'SMS_TEST_PHONE'
          ]
        ]
      ],
      fieldsMeta: {
        'CUSTOM_SMS_API_PARAMS': {
          label: this.$t('Params'),
          component: JsonEditor,
          helpText: this.$t('CustomParams')
        },
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
