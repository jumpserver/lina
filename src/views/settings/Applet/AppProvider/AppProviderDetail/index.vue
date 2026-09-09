<template>
  <GenericDetailPage v-bind="config" v-model:active-menu="config.activeMenu" v-model:object="host">
    <keep-alive>
      <component
        :is="config.activeMenu"
        :object="host"
        @refresh="refreshObject"
        @deployment-created="onDeploymentCreated"
        @change-tab="config.activeMenu = $event"
      />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import Apps from './Apps.vue'
import Accounts from './Accounts.vue'
import Containers from './Containers'
import Detail from './Detail'
import Deployments from './Deployments'

export default {
  name: 'AppProviderDetail',
  components: {
    GenericDetailPage,
    Detail,
    Apps,
    Accounts,
    Containers,
    Deployments
  },
  props: {
    initialActiveMenu: {
      type: String,
      default: 'Detail'
    }
  },
  data() {
    return {
      host: {},
      refreshing: false,
      refreshVersion: 0,
      active: true,
      refreshTimer: null,
      config: {
        url: '/api/v1/terminal/app-providers',
        activeMenu: this.initialActiveMenu,
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Detail'
          },
          {
            title: this.$t('Accounts'),
            name: 'Accounts',
            hidden: () => !this.$hasPerm('accounts.view_account')
          },
          {
            title: this.$t('VirtualApps'),
            name: 'Apps'
          },
          {
            title: this.$t('Containers'),
            name: 'Containers'
          },
          {
            title: this.$t('AppProviderDeployment'),
            name: 'Deployments'
          }
        ],
        hasRightSide: true,
        actions: {
          hasDelete: true,
          hasUpdate: true,
          canDelete: this.$hasPerm('terminal.delete_appprovider'),
          canUpdate: this.$hasPerm('terminal.change_appprovider'),
          updateRoute: 'AppProviderUpdate',
          deleteSuccessRoute: 'Applets'
        }
      }
    }
  },
  watch: {
    'host.deployment': 'scheduleRefresh',
    'config.activeMenu': 'refreshObject'
  },
  activated() {
    this.active = true
    this.refreshObject()
  },
  deactivated() {
    this.active = false
    clearTimeout(this.refreshTimer)
  },
  beforeUnmount() {
    this.active = false
    clearTimeout(this.refreshTimer)
  },
  methods: {
    onDeploymentCreated(deployment) {
      this.refreshVersion += 1
      this.host = { ...this.host, deployment }
      this.refreshObject()
    },
    scheduleRefresh() {
      clearTimeout(this.refreshTimer)
      const status = this.host.deployment?.status
      if (this.active && ['pending', 'running'].includes(status?.value || status)) {
        this.refreshTimer = setTimeout(this.refreshObject, 5000)
      }
    },
    async refreshObject() {
      if (!this.host.id || this.refreshing || !this.active) return
      this.refreshing = true
      const version = ++this.refreshVersion
      try {
        const object = await this.$axios.get(`/api/v1/terminal/app-providers/${this.host.id}/`)
        if (version === this.refreshVersion && this.active) this.host = object
        this.scheduleRefresh()
      } catch (error) {
        clearTimeout(this.refreshTimer)
        this.$log.warn('Refresh application provider failed', error)
      } finally {
        this.refreshing = false
      }
    }
  }
}
</script>

<style scoped></style>
