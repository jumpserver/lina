<template>
  <BaseAuth
    :config="settings"
    enable-field="AUTH_DINGTALK"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { UpdateToken } from '@/components/Form/FormFields'

export default {
  name: 'DingTalk',
  components: {
    BaseAuth
  },
  data() {
    const vm = this
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=dingtalk',
        moreButtons: [
          {
            title: this.$t('setting.dingTalkTest'),
            loading: false,
            callback: function(value, form, btn) {
              btn.loading = true
              vm.$axios.post(
                '/api/v1/settings/dingtalk/testing/',
                value
              ).then(res => {
                vm.$message.success(res['msg'])
              }).catch(() => {
                vm.$log.error('err occur')
              }).finally(() => { btn.loading = false })
            }
          }
        ],
        encryptedFields: ['DINGTALK_APPSECRET'],
        fields: [
          [
            this.$t('common.BasicInfo'),
            [
              'AUTH_DINGTALK', 'DINGTALK_AGENTID',
              'DINGTALK_APPKEY', 'DINGTALK_APPSECRET'
            ]
          ]
        ],
        fieldsMeta: {
          DINGTALK_APPSECRET: {
            component: UpdateToken
          }
        },
        hasDetailInMsg: false,
        submitMethod() {
          return 'put'
        },
        // 不清理的话，编辑secret，在删除提交会报错
        cleanFormValue(data) {
          if (!data['DINGTALK_APPSECRET']) {
            delete data['DINGTALK_APPSECRET']
          }
          return data
        }
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
