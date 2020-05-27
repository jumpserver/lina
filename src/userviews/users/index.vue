<template>
  <GenericDetailPage :object.sync="user" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import UserProfile from './UserProfile.vue'
export default {
  name: 'AssetListDetail',
  components: {
    GenericDetailPage,
    UserProfile
  },
  data() {
    return {
      user: {},
      config: {
        title: this.$t('common.nav.Profile'),
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'UserProfile'
          }
        ],
        hasRightSide: false
      }
    }
  }
}
</script>

<style scoped>
</style>
