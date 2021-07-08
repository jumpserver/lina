<template>
  <GenericDetailPage
    :submenu="submenu"
    :object.sync="sessionData"
    :active-menu.sync="activeSubMenu"
    :has-right-side="false"
    :get-object-name="getSessionName"
  >
    <keep-alive>
      <component :is="activeSubMenu" :object="sessionData" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import SessionCommands from './SessionCommands'
import SessionDetailInfo from './SessionDetailInfo'
export default {
  name: 'SessionDetail',
  components: {
    GenericDetailPage,
    SessionCommands,
    SessionDetailInfo
  },
  data() {
    return {
      sessionData: {},
      activeSubMenu: 'SessionDetailInfo',
      submenu: [
        {
          title: this.$t('route.SessionDetail'),
          name: 'SessionDetailInfo'
        },
        {
          title: this.$t('sessions.command'),
          name: 'SessionCommands'
        }
      ]
    }
  },
  methods: {
    getSessionName() {
      return this.sessionData.id
    }
  }
}
</script>

<style scoped>

</style>
