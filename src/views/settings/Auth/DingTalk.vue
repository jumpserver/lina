<template>
  <BaseAuth
    :value="value"
    :config="settings"
    :title="$t('setting.DingTalk')"
    enable-field="AUTH_DINGTALK"
    v-on="$listeners"
  />
</template>

<script>
import BaseAuth from './Base'

export default {
  name: 'DingTalk',
  components: {
    BaseAuth
  },
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    const vm = this
    return {
      settings: {
        url: '/api/v1/settings/setting/?category=dingtalk',
        moreButtons: [
          {
            title: this.$t('setting.dingTalkTest'),
            callback: function(value, form) {
              vm.$axios.post(
                '/api/v1/settings/dingtalk/testing/',
                value
              ).then(res => {
                vm.$message.success(res['msg'])
              }).catch(() => {
                this.$log.error('err occur')
              })
            }
          }
        ],
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
