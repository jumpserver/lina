<template>
  <TabPage
    v-model:active-menu="activeMenu"
    :title="$t('SessionRecords')"
    :submenu="submenu"
    :clear-query-keys-on-tab-change="queryKeys"
  >
    <keep-alive :key="orgId" :max="3">
      <component
        :is="activeComponent"
        v-if="contentReady"
        :key="`${activeMenu}:${orgId}`"
        v-bind="activeMenu === 'AgentSessions' ? { kind: 'sessions', orgId } : {}"
      />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import OnlineList from '@/views/sessions/SessionList/OnlineList.vue'
import OfflineList from '@/views/sessions/SessionList/OfflineList.vue'
import AgentList from './AgentAudit/List.vue'

export default {
  components: { TabPage, OnlineList, OfflineList, AgentList },
  data() {
    return {
      activeMenu: this.$hasPerm('terminal.view_session') ? 'OnlineList' : 'AgentSessions',
      active: true
    }
  },
  activated() {
    this.active = true
  },
  deactivated() {
    this.active = false
  },
  computed: {
    submenu() {
      return [
        {
          name: 'OnlineList',
          title: this.$t('SessionOnline'),
          hidden: !this.$hasPerm('terminal.view_session')
        },
        {
          name: 'OfflineList',
          title: this.$t('SessionOffline'),
          hidden: !this.$hasPerm('terminal.view_session')
        },
        { name: 'AgentSessions', title: this.$t('AgentSessions') }
      ]
    },
    activeComponent() {
      return this.activeMenu === 'AgentSessions' ? 'AgentList' : this.activeMenu
    },
    contentReady() {
      const selected = String(this.$route.query.tab || '').toLowerCase()
      const tab = this.submenu.find((item) => !item.hidden && item.name.toLowerCase() === selected)
      return !tab || tab.name === this.activeMenu
    },
    orgId() {
      return this.$route.query.oid || this.$store.getters.currentOrg?.id
    },
    queryKeys() {
      return Object.keys(this.$route.query).filter((key) => !['oid', 'tab'].includes(key))
    }
  },
  watch: {
    submenu(items) {
      if (!items.some((item) => item.name === this.activeMenu && !item.hidden)) {
        this.activeMenu = items.find((item) => !item.hidden)?.name || ''
      }
    },
    '$store.getters.currentOrg.id'(next, previous) {
      if (
        this.active &&
        this.$route.path === '/audit/sessions/sessions' &&
        previous &&
        next &&
        next !== previous &&
        this.$route.query.oid
      ) {
        this.$router.replace({ query: { ...this.$route.query, oid: next } })
      }
    }
  }
}
</script>
