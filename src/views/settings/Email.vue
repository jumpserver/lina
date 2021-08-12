<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" />
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
      hasDetailInMsg: false,
      url: '/api/v1/settings/setting/?category=email',
      moreButtons: [
        {
          title: this.$t('setting.emailTest'),
          callback: function(value, form) {
            if (value['EMAIL_HOST_PASSWORD'] === undefined) {
              value['EMAIL_HOST_PASSWORD'] = ''
            }
            if (value['EMAIL_USE_SSL'] === undefined) {
              value['EMAIL_USE_SSL'] = false
            }
            if (value['EMAIL_USE_TLS'] === undefined) {
              value['EMAIL_USE_TLS'] = false
            }
            if (value['EMAIL_FROM'] === undefined) {
              value['EMAIL_FROM'] = value['EMAIL_HOST_USER']
            }
            testEmailSetting(value).then(res => {
              vm.$message.success(res['msg'])
            }).catch(res => {
              vm.$message.error(res['response']['data']['error'])
            })
          }
        }
      ],
      cleanFormValue(data) {
        if (!data['EMAIL_HOST_PASSWORD']) {
          delete data['EMAIL_HOST_PASSWORD']
        }
        if (!data['EMAIL_USE_SSL']) {
          data['EMAIL_USE_SSL'] = false
        }
        if (!data['EMAIL_USE_TLS']) {
          data['EMAIL_USE_TLS'] = false
        }
        if (!data['EMAIL_FROM']) {
          data['EMAIL_FROM'] = data['EMAIL_HOST_USER']
        }
        Object.keys(data).forEach(
          function(key) {
            if (data[key] === null) {
              delete data[key]
            }
          }
        )
        return data
      },
      getMethod() {
        return 'put'
      }
    }
  },
  methods: {
  }

}
</script>

<style scoped>

</style>
