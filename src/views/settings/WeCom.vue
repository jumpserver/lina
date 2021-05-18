<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :url="url"
      :get-method="getMethod"
      :fields-meta="fieldsMeta"
      :more-buttons="moreButtons"
      :has-detail-in-msg="false"
    />
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'

export default {
  name: 'Wecom',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    const vm = this
    return {
      url: '/api/v1/settings/setting/?category=wecom',
      moreButtons: [
        {
          title: this.$t('setting.weComTest'),
          callback: function(value, form) {
            vm.$axios.post(
              '/api/v1/settings/wecom/testing/',
              value
            ).then(res => {
              vm.$message.success(res['msg'])
            }).catch(err => {
              vm.$message.error(err['response']['data']['error'])
            })
          }
        }
      ],
      fields: [
        [
          this.$t('common.BasicInfo'),
          [
            'AUTH_WECOM', 'WECOM_CORPID', 'WECOM_AGENTID',
            'WECOM_SECRET'
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
    }
  }
}
</script>

<style scoped>

</style>
