<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :url="url"
      :get-method="getMethod"
      :fields-meta="fieldsMeta"
      :has-detail-in-msg="false"
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
    return {
      url: '/api/v1/settings/setting/?category=dingtalk',
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
    }
  }
}
</script>

<style scoped>

</style>
