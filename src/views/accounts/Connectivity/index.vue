<template>
  <TabPage
    v-model:active-menu="activeMenu"
    :submenu="submenu"
    :clear-query-keys-on-tab-change="['automation_id', 'execution_id']"
  >
    <component
      :is="activeTab.component"
      v-if="activeTab"
      :key="`${activeTab.name}:${$route.query.automation_id || ''}:${$route.query.execution_id || ''}`"
      :automation-id="$route.query.automation_id || ''"
      :execution-id="$route.query.execution_id || ''"
    />
  </TabPage>
</template>

<script>
import { TabPage } from '@/layout/components'
import TaskList from './TaskList.vue'
import ExecutionList from './ExecutionList.vue'
import RecordList from './RecordList.vue'
import { getConnectivityConfig } from './config'

const legacyExecutionTabs = ['AccountConnectivityExecutions', 'AssetConnectivityExecutions']

export default {
  name: 'ConnectivityList',
  components: { TabPage, TaskList, ExecutionList, RecordList },
  data() {
    return {
      activeMenu: legacyExecutionTabs.includes(this.$route.query.tab)
        ? 'ConnectivityExecutions'
        : this.$route.query.tab || 'ConnectivityTasks'
    }
  },
  created() {
    if (legacyExecutionTabs.includes(this.$route.query.tab)) {
      this.$router.replace({
        path: this.$route.path,
        query: { ...this.$route.query, tab: 'ConnectivityExecutions' },
        hash: this.$route.hash
      })
    }
  },
  computed: {
    submenu() {
      const configs = ['account', 'asset'].map(getConnectivityConfig)
      return [
        {
          name: 'ConnectivityTasks',
          title: this.$t('ConnectivityTasks'),
          component: 'TaskList',
          hidden: !configs.some((config) => this.$hasPerm(config.viewPermission))
        },
        {
          name: 'ConnectivityExecutions',
          title: this.$t('ExecutionHistory'),
          component: 'ExecutionList',
          hidden: !configs.some((config) => this.$hasPerm(config.viewExecutionPermission))
        },
        {
          name: 'ConnectivityRecords',
          title: this.$t('ExecutionRecord'),
          component: 'RecordList',
          hidden: !configs.some((config) => this.$hasPerm(config.viewExecutionPermission))
        }
      ]
    },
    activeTab() {
      return this.submenu.find((tab) => tab.name === this.activeMenu && !tab.hidden)
    }
  }
}
</script>
