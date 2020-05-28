<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :fields-meta="fieldsMeta"
      :initial="object"
      :url="url"
      :get-method="getMethod"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'

export default {
  name: 'ProfileUpdate',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      url: `/api/v1/users/profile/`,
      getMethod: () => 'put',
      fields: [
        [this.$t('users.Account'), ['username', 'name', 'email']],
        [this.$t('common.Other'), ['phone', 'wechat']]
      ],
      fieldsMeta: {
        username: {
          disabled: true
        },
        name: {
          disabled: true
        },
        email: {
          disabled: true
        }
      }
      // successUrl: { name: 'UserProfile', params: { activeMenu: 'ProfileUpdate' }}
    }
  }
}
</script>

<style scoped>

</style>
