<template>
  <GenericDetailPage :object.sync="user" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import Guide from './Guide'

export default {
  components: {
    GenericDetailPage,
    Guide
  },
  data() {
    return {
      user: {},
      config: {
        title: this.$t('users.FirstLogin'),
        activeMenu: 'Guide',
        submenu: [
          {
            title: this.$t('users.Guide'),
            name: 'Guide'
          }
        ],
        hasRightSide: false,
        actions: {
          detailApiUrl: '/api/v1/users/profile/'
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
