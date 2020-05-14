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
import SessionCommandList from './SessionCommandList'
import SessionDetailCard from './SessionDetailCard'
export default {
  name: 'SessionDetail',
  components: {
    GenericDetailPage,
    SessionCommandList,
    SessionDetailCard
  },
  data() {
    return {
      sessionData: {},
      activeSubMenu: 'SessionDetailCard',
      submenu: [
        {
          title: this.$t('route.SessionDetail'),
          name: 'SessionDetailCard'
        },
        {
          title: this.$t('sessions.command'),
          name: 'SessionCommandList'
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
