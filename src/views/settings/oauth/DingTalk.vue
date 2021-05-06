<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="selectFields"
      :url="url"
      :fields-meta="fieldsMeta"
      :more-buttons="moreButtons"
      :get-method="getMethod"
      :has-detail-in-msg="false"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'
import request from '@/utils/request'

export default {
  name: 'DingTalk',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    const vm = this
    return {
      selectFields: [
        [
          this.$t('setting.dingtalkSetting'),
          [
            'DINGTALK_APPKEY', 'DINGTALK_AGENTID',
            'DINGTALK_APPSECRET'
          ]
        ]
      ],
      successUrl: { name: 'Settings', params: { activeMenu: 'Auth' }},
      fieldsMeta: {

      },
      moreButtons: [
        {
          title: this.$t('setting.TestConnective'),
          callback: function(value, form) {
            vm.testDingTalkSetting(value).then(res => {
              vm.$message.success(res['msg'])
            }).catch(res => {
              vm.$message.error(res['response']['data']['error'])
            })
          }
        }
      ],
      url: '/api/v1/settings/setting/?category=dingtalk'
    }
  },
  methods: {
    getMethod() {
      return 'put'
    },
    testDingTalkSetting(data) {
      return request({
        disableFlashErrorMsg: true,
        url: '/api/v1/settings/dingtalk/testing/',
        method: 'post',
        data: data
      })
    }
  }
}
</script>

<style scoped>

</style>
