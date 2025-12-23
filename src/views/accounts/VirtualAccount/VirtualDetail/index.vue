<template>
  <GenericDetailPage
    v-model:active-menu="config.activeMenu"
    v-model:object="account"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="account" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import GenericDetailPage from '@/layout/components/GenericDetailPage/index.vue'
import Detail from './Detail.vue'

export default {
  name: 'VirtualAccountDetail',
  components: { GenericDetailPage, Detail },
  data() {
    return {
      account: {},
      config: {
        object: null,
        activeMenu: 'Detail',
        url: '/api/v1/accounts/virtual-accounts/',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Detail'
          }
        ]
      }
    }
  }
}
</script>
