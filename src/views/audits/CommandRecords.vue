<template>
  <TabPage
    v-model:active-menu="activeMenu"
    :title="$t('CommandRecords')"
    :submenu="submenu"
    :clear-query-keys-on-tab-change="queryKeys"
  >
    <keep-alive :key="orgId" :max="2">
      <component
        :is="activeMenu === 'AgentActions' ? 'AgentList' : 'CommandList'"
        v-if="contentReady"
        :key="`${activeMenu}:${orgId}`"
        v-bind="activeMenu === 'AgentActions' ? { kind: 'actions', orgId } : {}"
      />
    </keep-alive>
  </TabPage>
</template>

<script>
import TabPage from '@/layout/components/TabPage'
import CommandList from '@/views/sessions/CommandList/BaseList.vue'
import AgentList from './AgentAudit/List.vue'

export default {
  components: { TabPage, CommandList, AgentList },
  data() {
    return {
      activeMenu: this.$hasPerm('terminal.view_command') ? 'TerminalCommands' : 'AgentActions',
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
          name: 'TerminalCommands',
          title: this.$t('TerminalCommands'),
          hidden: !this.$hasPerm('terminal.view_command')
        },
        { name: 'AgentActions', title: this.$t('AgentActions') }
      ]
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
        this.$route.path === '/audit/sessions/command' &&
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
