<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="selectFields"
      :url="url"
      :fields-meta="fieldsMeta"
      :get-method="getMethod"
      :has-detail-in-msg="false"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'
export default {
  name: 'EmailContent',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    return {
      selectFields: [
        [
          this.$t('setting.createUserSetting'),
          [
            'WECOM_CORPID', 'WECOM_AGENTID',
            'WECOM_CORPSECRET'
          ]
        ]
      ],
      successUrl: { name: 'Settings', params: { activeMenu: 'EmailContent' }},
      fieldsMeta: {

      },
      url: '/api/v1/settings/setting/?category=wecom'
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
