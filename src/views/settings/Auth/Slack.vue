<template>
  <BaseAuth
    :config="settings"
    :title="$tc('setting.Slack')"
    enable-field="AUTH_SLACK"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { UpdateToken } from '@/components/Form/FormFields'

export default {
  name: 'Slack',
  components: {
    BaseAuth
  },
  data() {
    const vm = this
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=slack',
        hasDetailInMsg: false,
        moreButtons: [
          {
            title: this.$t('common.Test'),
            loading: false,
            callback: function(value, form, btn) {
              btn.loading = true
              vm.$axios.post(
                '/api/v1/settings/slack/testing/',
                value
              ).then(res => {
                vm.$message.success(res['msg'])
              }).catch(() => {
                vm.$log.error('err occur')
              }).finally(() => { btn.loading = false })
            }
          }
        ],
        encryptedFields: ['SLACK_SECRET'],
        fields: [
          [
            this.$t('common.BasicInfo'),
            [
              'AUTH_SLACK', 'SLACK_CLIENT_ID', 'SLACK_CLIENT_SECRET', 'SLACK_BOT_TOKEN'
            ]
          ]
        ],
        fieldsMeta: {
          SLACK_APP_SECRET: {
            component: UpdateToken
          },
          SLACK_BOT_TOKEN: {
            component: UpdateToken
          }
        },
        // 不清理的话，编辑secret，在删除提交会报错
        cleanFormValue(data) {
          const needDeleteValues = ['SLACK_CLIENT_SECRET', 'SLACK_BOT_TOKEN']
          needDeleteValues.map((k) => {
            if (!data[k]) {
              delete data[k]
            }
          })
          return data
        },
        submitMethod() {
          return 'put'
        }
      }
    }
  },
  methods: {}
}
</script>

<style scoped>

</style>
