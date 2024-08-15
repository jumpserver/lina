<template>
  <BaseAuth
    :config="settings"
    enable-field="AUTH_DINGTALK"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'
import { JsonEditor, UpdateToken } from '@/components/Form/FormFields'
import { getOrgSelect2Meta } from '@/views/settings/Auth/const'

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
            title: this.$t('DingTalkTest'),
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
          [this.$t('Basic'), [
            'AUTH_DINGTALK', 'DINGTALK_AGENTID',
            'DINGTALK_APPKEY', 'DINGTALK_APPSECRET',
            'DINGTALK_RENAME_ATTRIBUTES'
          ]],
          [this.$t('Other'), [
            'DINGTALK_ORG_IDS'
          ]]
        ],
        fieldsMeta: {
          DINGTALK_APPSECRET: {
            component: UpdateToken
          },
          DINGTALK_RENAME_ATTRIBUTES: {
            component: JsonEditor
          },
          DINGTALK_ORG_IDS: getOrgSelect2Meta()
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
