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
import EmailTemplate from './EmailTemplate.vue'
import { UpdateToken } from '@/components/Form/FormFields'
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
      encryptedFields: ['EMAIL_HOST_PASSWORD'],
      fields: [
        [this.$t('Server'), [
          'EMAIL_PROTOCOL',
          'EMAIL_HOST',
          'EMAIL_PORT',
          'EMAIL_HOST_USER',
          'EMAIL_HOST_PASSWORD',
          'EMAIL_FROM',
          'EMAIL_USE_SSL',
          'EMAIL_USE_TLS'
        ]
        ],
        [this.$t('Other'), ['CREATE_USER_MSG']],
        [this.$t('Test'), ['EMAIL_RECIPIENT']]
      ],
      fieldsMeta: {
        EMAIL_PORT: {
          hidden: (formValue) => formValue.EMAIL_PROTOCOL !== 'smtp'
        },
        EMAIL_HOST_PASSWORD: {
          component: UpdateToken
        },
        EMAIL_HOST_USER: {
          rules: [
            rules.EmailCheck,
            rules.Required
          ]
        },
        EMAIL_CUSTOM_USER_CREATED_BODY: {
          el: {
            type: 'textarea',
            rows: 3
          }
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
        EMAIL_USE_SSL: {
          hidden: (formValue) => formValue.EMAIL_PROTOCOL !== 'smtp'
        },
        EMAIL_USE_TLS: {
          hidden: (formValue) => formValue.EMAIL_PROTOCOL !== 'smtp'
        },
        CREATE_USER_MSG: {
          label: this.$t('EmailTemplate'),
          component: EmailTemplate,
          helpTip: this.$t('EmailTemplateHelpTip')
        }
      },
      hasDetailInMsg: false,
      successUrl: { name: 'Msg' },
      url: '/api/v1/settings/setting/?category=email',
      moreButtons: [
        {
          title: this.$t('EmailTest'),
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
            if (!data['EMAIL_HOST_PASSWORD']) {
              delete data['EMAIL_HOST_PASSWORD']
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
