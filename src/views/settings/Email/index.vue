<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :update-success-next-route="successUrl"
    :create-success-next-route="successUrl"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { testEmailSetting } from '@/api/settings'
import EmailContent from './EmailContent'
import SMTP from './SMTP'
import rules from '@/components/DataForm/rules'

export default {
  name: 'Email',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    return {
      fields: [
        [
          this.$t('setting.SMTP'),
          [
            'SMTP'
          ]
        ],
        [
          this.$t('setting.MailSend'),
          [
            'EMAIL_FROM', 'EMAIL_SUBJECT_PREFIX'
          ]
        ],
        [
          this.$t('setting.EmailContent'),
          [
            'CREATE_USER_MSG'
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
        },
        CREATE_USER_MSG: {
          label: this.$t('setting.CreateUserSetting'),
          component: EmailContent
        },
        SMTP: {
          label: this.$t('setting.SMTP'),
          component: SMTP
        }
      },
      hasDetailInMsg: false,
      successUrl: { name: 'Email' },
      url: '/api/v1/settings/setting/?category=email',
      moreButtons: [
        {
          title: this.$t('setting.emailTest'),
          callback: function(value, form) {
            const testValue = {}
            testValue['EMAIL_FROM'] = value['EMAIL_FROM']
            testValue['EMAIL_RECIPIENT'] = value['EMAIL_RECIPIENT']
            testEmailSetting(value).then(res => {
              vm.$message.success(res['msg'])
            }).catch(res => {
              vm.$message.error(res['response']['data']['error'])
            })
          }
        }
      ],
      cleanFormValue(data) {
        const submitValue = {}
        submitValue['EMAIL_RECIPIENT'] = data['EMAIL_RECIPIENT']
        submitValue['EMAIL_FROM'] = data['EMAIL_FROM']
        submitValue['EMAIL_SUBJECT_PREFIX'] = data['EMAIL_SUBJECT_PREFIX']
        Object.keys(submitValue).forEach(
          function(key) {
            if (submitValue[key] === null) {
              delete submitValue[key]
            }
          }
        )
        return submitValue
      },
      submitMethod() {
        return 'patch'
      }
    }
  },
  methods: {
  }

}
</script>

<style scoped>

</style>
