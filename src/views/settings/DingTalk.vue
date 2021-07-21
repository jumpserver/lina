<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :url="url"
      :get-method="getMethod"
      :fields-meta="fieldsMeta"
      :more-buttons="moreButtons"
      :has-detail-in-msg="false"
      :clean-form-value="cleanFormValue"
    />
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'

export default {
  name: 'DingTalk',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    const vm = this
    return {
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
      }
    }
  },
  methods: {
    getMethod() {
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
</script>

<style scoped>

</style>
