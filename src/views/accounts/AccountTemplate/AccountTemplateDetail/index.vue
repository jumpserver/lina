<template>
  <GenericDetailPage
    :object.sync="object"
    :active-menu.sync="config.activeMenu"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="object" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail.vue'

export default {
  components: {
    GenericDetailPage,
    TabPage,
    Detail
  },
  data() {
    return {
      object: {},
      config: {
        url: '/api/v1/accounts/account-templates',
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
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
