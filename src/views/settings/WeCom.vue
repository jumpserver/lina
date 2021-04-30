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
  name: 'Wecom',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=wecom',
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
