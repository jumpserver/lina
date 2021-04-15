<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :url="url"
      :perform-submit="performSubmit"
      :get-method="getMethod"
      :fields-meta="fieldsMeta"
      :more-buttons="moreButtons"
      :has-detail-in-msg="false"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { testEmailSetting } from '@/api/settings'
import { IBox } from '@/components'
import rules from '@/components/DataForm/rules'

export default {
  name: 'Email',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    const vm = this
    return {
      fields: [
        [
          this.$t('common.BasicInfo'),
          [
            'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_HOST_USER',
            'EMAIL_HOST_PASSWORD'
          ]
        ],
        [
          this.$t('setting.Security'),
          [
            'EMAIL_USE_SSL', 'EMAIL_USE_TLS'
          ]
        ],
        [
          this.$t('setting.MailSend'),
          [
            'EMAIL_FROM', 'EMAIL_SUBJECT_PREFIX'
          ]
        ],
        [
          this.$t('common.Other'),
          [
            'EMAIL_RECIPIENT'
          ]
        ]
      ],
      fieldsMeta: {
        EMAIL_HOST_USER: {
          rules: [
            rules.EmailCheck,
            rules.Required
          ]
        },
        EMAIL_FROM: {
          rules: [
            rules.EmailCheck
          ]
        },
        EMAIL_RECIPIENT: {
          rules: [
            rules.EmailCheck
          ]
        }
      },
      url: '/api/v1/settings/setting/?category=email',
      moreButtons: [
        {
          title: this.$t('setting.emailTest'),
          callback: function(value, form) {
            if (value['EMAIL_HOST_PASSWORD'] === undefined) {
              value['EMAIL_HOST_PASSWORD'] = ''
            }
            testEmailSetting(value).then(res => {
              vm.$message.success(res['msg'])
            }).catch(res => {
              vm.$message.error(res['response']['data']['error'])
            })
          }
        }
      ]
    }
  },
  methods: {
    getMethod() {
      return 'put'
    },
    performSubmit(validValues) {
      Object.keys(validValues).forEach(
        function(key) {
          if (validValues[key] === null) {
            delete validValues[key]
          }
        }
      )

      return this.$axios['put'](`/api/v1/settings/setting/?category=email`, validValues)
    }

  }

}
</script>

<style scoped>

</style>
