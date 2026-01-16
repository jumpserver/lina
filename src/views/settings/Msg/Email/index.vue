<template>
  <div>
    <el-alert v-sanitize="helpText" type="info" />
    <IBox>
      <GenericCreateUpdateForm
        :create-success-next-route="successUrl"
        :update-success-next-route="successUrl"
        v-bind="$data"
      />
    </IBox>
  </div>
</template>

<script>
import { IBox } from '@/components'
import { GenericCreateUpdateForm } from '@/layout/components'
import { testEmailSetting } from '@/api/settings'
import rules from '@/components/Form/DataForm/rules'
import EmailTemplate from './EmailTemplate.vue'

export default {
  name: 'Email',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    const vm = this
    return {
      helpText: this.$t('EmailHelpText'),
      encryptedFields: ['EMAIL_HOST_PASSWORD'],
      fields: [
        [
          this.$t('Server'),
          [
            'EMAIL_PROTOCOL',
            'EMAIL_HOST',
            'EMAIL_PORT',
            'EMAIL_HOST_USER',
            'EMAIL_HOST_PASSWORD',
            'EMAIL_FROM',
            'EMAIL_SECURITY_PROTOCOL'
          ]
        ],
        [this.$t('Other'), ['CREATE_USER_MSG']],
        [this.$t('Test'), ['EMAIL_RECIPIENT']]
      ],
      fieldsMeta: {
        EMAIL_PORT: {
          hidden: formValue => formValue.EMAIL_PROTOCOL !== 'smtp'
        },
        EMAIL_CUSTOM_USER_CREATED_BODY: {
          el: {
            type: 'textarea',
            rows: 3
          }
        },
        EMAIL_FROM: {
          rules: [rules.EmailCheck]
        },
        EMAIL_RECIPIENT: {
          rules: [rules.EmailCheck]
        },
        EMAIL_SECURITY_PROTOCOL: {
          hidden: formValue => formValue.EMAIL_PROTOCOL !== 'smtp',
          label: this.$t('UseSSL'),
          type: 'radio-group',
          value: 'ssl',
          options: [
            { label: this.$t('None'), value: 'none' },
            { label: this.$t('SSL'), value: 'ssl' },
            { label: this.$t('TLS'), value: 'tls' }
          ]
        },

        CREATE_USER_MSG: {
          label: this.$t('EmailTemplate'),
          component: EmailTemplate,
          helpTip: this.$t('EmailTemplateHelpTip')
        }
      },
      afterGetFormValue(obj) {
        if (obj?.EMAIL_USE_SSL === true) {
          obj.EMAIL_SECURITY_PROTOCOL = 'ssl'
        } else if (obj?.EMAIL_USE_TLS === true) {
          obj.EMAIL_SECURITY_PROTOCOL = 'tls'
        } else {
          obj.EMAIL_SECURITY_PROTOCOL = 'none'
        }
        return obj
      },
      hasDetailInMsg: false,
      successUrl: { name: 'Msg' },
      url: '/api/v1/settings/setting/?category=email',
      moreButtons: [
        {
          title: this.$t('EmailTest'),
          loading: false,
          callback: function (value, form, btn) {
            const testValue = {}
            testValue['EMAIL_FROM'] = value['EMAIL_FROM']
            testValue['EMAIL_RECIPIENT'] = value['EMAIL_RECIPIENT']
            btn.loading = true
            testEmailSetting(value)
              .then(res => {
                vm.$message.success(res['msg'])
              })
              .catch(res => {
                vm.$message.error(res['response']['data']['error'])
              })
              .finally(() => {
                btn.loading = false
              })
          }
        }
      ],
      cleanFormValue(data) {
        Object.keys(data).forEach(function (key) {
          if (data[key] === null) {
            delete data[key]
          }
          if (!data['EMAIL_HOST_PASSWORD']) {
            delete data['EMAIL_HOST_PASSWORD']
          }
          switch (data['EMAIL_SECURITY_PROTOCOL']) {
            case 'ssl':
              data['EMAIL_USE_SSL'] = true
              data['EMAIL_USE_TLS'] = false
              break
            case 'tls':
              data['EMAIL_USE_SSL'] = false
              data['EMAIL_USE_TLS'] = true
              break
            default:
              data['EMAIL_USE_SSL'] = false
              data['EMAIL_USE_TLS'] = false
              break
          }
        })
        return data
      },
      submitMethod() {
        return 'patch'
      }
    }
  },
  methods: {}
}
</script>

<style scoped></style>
