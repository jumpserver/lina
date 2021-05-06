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
  name: 'WeCom',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    const vm = this
    return {
      selectFields: [
        [
          this.$t('setting.wechatSetting'),
          [
            'WECOM_CORPID', 'WECOM_AGENTID',
            'WECOM_CORPSECRET'
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
            vm.testWechatSetting(value).then(res => {
              vm.$message.success(res.msg)
            }).catch(res => {
              vm.$message.error(res['response']['data']['error'])
            })
          }
        }
      ],
      url: '/api/v1/settings/setting/?category=wecom'
    }
  },
  methods: {
    getMethod() {
      return 'put'
    },
    testWechatSetting(data) {
      return request({
        disableFlashErrorMsg: true,
        url: '/api/v1/settings/wecom/testing/',
        method: 'post',
        data: data
      })
    }
  }
}
</script>

<style scoped>

</style>
