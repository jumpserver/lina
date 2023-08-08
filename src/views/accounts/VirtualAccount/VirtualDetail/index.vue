<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="account"
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
        submenu: [
          {
            title: this.$t('common.Detail'),
            name: 'Detail'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
