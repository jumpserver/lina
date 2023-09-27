<template>
  <IBox>
    <GenericCreateUpdateForm
      :create-success-next-route="successUrl"
      :update-success-next-route="successUrl"
      v-bind="$data"
    />
  </IBox>

</template>

<script>
import { IBox } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import { testEmailSetting } from '@/api/settings'
import EmailContent from './EmailContent.vue'
import SMTP from './SMTP.vue'
import rules from '@/components/Form/DataForm/rules'

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
            'EMAIL_RECIPIENT', 'EMAIL_SUFFIX'
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
      successUrl: { name: 'Msg' },
      url: '/api/v1/settings/setting/?category=email',
      moreButtons: [
        {
          title: this.$t('setting.emailTest'),
          loading: false,
          callback: function(value, form, btn) {
            const testValue = {}
            testValue['EMAIL_FROM'] = value['EMAIL_FROM']
            testValue['EMAIL_RECIPIENT'] = value['EMAIL_RECIPIENT']
            btn.loading = true
            testEmailSetting(value).then(res => {
              vm.$message.success(res['msg'])
            }).catch(res => {
              vm.$message.error(res['response']['data']['error'])
            }).finally(() => { btn.loading = false })
          }
        }
      ],
      cleanFormValue(data) {
        Object.keys(data).forEach(
          function(key) {
            if (data[key] === null) {
              delete data[key]
            }
          }
        )
        return data
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
