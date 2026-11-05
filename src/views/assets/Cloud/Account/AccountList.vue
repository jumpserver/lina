<template>
  <div>
    <SmallCard v-bind="table" ref="table" class="account-table" />
    <CreateDialog v-bind="providerConfig" v-if="visible" v-model:visible="visible" />
    <UpdateDialog
      v-if="updateVisible"
      v-model:visible="updateVisible"
      :object="object"
      @submit-success="onSubmitSuccess"
    />
    <SyncDialog v-if="onlineSyncVisible" v-model:visible="onlineSyncVisible" :object="object" />
  </div>
</template>

<script>
import SmallCard from '@/components/Table/InfoCardTable/index.vue'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { ACCOUNT_PROVIDER_ATTRS_MAP } from '@/views/assets/Cloud/const'
import { lan, privateCloudProviders, publicDBProviders, publicHostProviders } from '../const'
import CreateDialog from './components/CreateDialog.vue'
import SyncDialog from './components/SyncDialog.vue'
import UpdateDialog from './components/UpdateDialog.vue'

export default {
  name: 'CloudAccountList',
  components: {
    SyncDialog,
    SmallCard,
    CreateDialog,
    UpdateDialog
  },
  data() {
    const vm = this
    const category = this.$route.query.category || 'host'
    return {
      object: null,
      table: {
        tableConfig: {
          url: '/api/v1/xpack/cloud/accounts/',
          permissions: {
            app: 'xpack',
            resource: 'cloudaccount'
          },
          extraQuery: { category }
        },
        subComponentProps: {
          handleUpdate: (obj) => {
            this.object = obj
            this.updateVisible = true
          },
          getImage: (obj) => {
            return ACCOUNT_PROVIDER_ATTRS_MAP[obj.provider.value].image
          },
          getInfos: (obj) => {
            const status = obj?.sync_status || {}
            const summary = status.summary || {}
            return [
              {
                title: this.$tc('SyncHealth'),
                content: this.getHealthDisplay(status)
              },
              {
                title: this.$tc('TotalSyncAsset'),
                content: obj?.task.instance_count || 0
              },
              {
                title: this.$tc('LatestExecution'),
                content: toSafeLocalDateStr(status.latest_execution_at)
              },
              {
                title: this.$tc('LatestSuccess'),
                content: toSafeLocalDateStr(status.latest_success_at)
              },
              {
                title: this.$tc('NextExecution'),
                content: this.getNextExecutionDisplay(obj, status)
              },
              {
                title: this.$tc('Duration'),
                content: this.formatDuration(status.duration)
              },
              {
                title: this.$tc('LatestChanges'),
                content: `${this.$t('Create')} ${summary.new || 0} · ${this.$t('Update')} ${summary.updated || 0} · ${this.$t('NoChange')} ${summary.nochange || 0} · ${this.$t('PendingRelease')} ${summary.stale || 0} · ${this.$t('Failed')} ${summary.failed || 0}`
              },
              {
                title: this.$tc('SyncException'),
                content: status.primary_exception?.message || '-'
              }
            ]
          },
          actions: [
            {
              id: 'online-sync',
              name: this.$tc('DiscoverAndImport'),
              icon: 'el-icon-thumb',
              callback: this.handleOnlineExecute,
              disabled: !this.$hasPerm('xpack.change_syncinstancetask')
            }
          ]
        },
        headerActions: {
          hasImport: false,
          hasExport: false,
          hasColumnSetting: false,
          hasMoreActions: false,
          searchConfig: {
            getUrlQuery: false
          },
          moreCreates: {
            loading: false,
            callback: (option) => {
              vm.$router.push({ name: 'AccountCreate', query: { provider: option.name } })
            },
            dropdown: [
              {
                name: 'publicCloud',
                title: this.$t('PublicCloud'),
                icon: 'public-cloud',
                callback: () => {
                  const providers =
                    this.iCategory === 'host' ? publicHostProviders : publicDBProviders
                  this.providerConfig.providers = providers.map(
                    (item) => ACCOUNT_PROVIDER_ATTRS_MAP[item]
                  )
                  this.visible = true
                }
              },
              {
                name: 'privateCloud',
                title: this.$t('PrivateCloud'),
                icon: 'private-cloud',
                has: () => this.iCategory === 'host',
                callback: () => {
                  this.providerConfig.providers = privateCloudProviders.map(
                    (item) => ACCOUNT_PROVIDER_ATTRS_MAP[item]
                  )
                  this.visible = true
                }
              },
              {
                name: 'LAN',
                title: this.$t('LAN'),
                icon: 'computer',
                has: () => this.iCategory === 'host',
                callback: () => {
                  const providers = [lan]
                  this.providerConfig.providers = providers.map(
                    (item) => ACCOUNT_PROVIDER_ATTRS_MAP[item]
                  )
                  this.visible = true
                }
              }
            ]
          }
        },
        detailDrawer: () => import('@/views/assets/Cloud/Account/AccountDetail/index.vue')
      },
      providerConfig: {
        providers: []
      },
      visible: false,
      updateVisible: false,
      onlineSyncVisible: false,
      healthRefreshTimer: null,
      healthRefreshTimeouts: []
    }
  },
  computed: {
    iCategory() {
      return this.$route.query.category || 'host'
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (!val) {
          this.$refs.table.reloadTable()
        }
      }
    },
    onlineSyncVisible: {
      handler(newValue) {
        if (newValue === false) {
          this.$refs.table.reloadTable()
        }
      }
    },
    updateVisible: {
      handler(newValue) {
        if (newValue === false) {
          this.$refs.table.reloadTable()
        }
      }
    }
  },
  mounted() {
    this.startHealthRefresh()
  },
  activated() {
    this.startHealthRefresh()
    this.refreshHealth()
  },
  deactivated() {
    this.stopHealthRefresh()
  },
  beforeUnmount() {
    this.stopHealthRefresh()
  },
  methods: {
    startHealthRefresh() {
      if (this.healthRefreshTimer) return
      window.addEventListener('focus', this.refreshHealth)
      window.addEventListener('cloud-sync-triggered', this.handleSyncTriggered)
      this.healthRefreshTimer = window.setInterval(this.refreshHealth, 60000)
    },
    stopHealthRefresh() {
      if (!this.healthRefreshTimer) return
      window.removeEventListener('focus', this.refreshHealth)
      window.removeEventListener('cloud-sync-triggered', this.handleSyncTriggered)
      window.clearInterval(this.healthRefreshTimer)
      this.healthRefreshTimeouts.forEach((timer) => window.clearTimeout(timer))
      this.healthRefreshTimeouts = []
      this.healthRefreshTimer = null
    },
    handleSyncTriggered() {
      this.refreshHealth()
      this.healthRefreshTimeouts.forEach((timer) => window.clearTimeout(timer))
      this.healthRefreshTimeouts = [3000, 10000, 20000, 40000, 90000].map((delay) =>
        window.setTimeout(this.refreshHealth, delay)
      )
    },
    refreshHealth() {
      if (document.visibilityState !== 'visible') return
      this.$refs.table?.reloadTable()
    },
    getHealthDisplay(status) {
      if (!status) return '-'
      const healthLabels = {
        healthy: this.$t('Healthy'),
        degraded: this.$t('Degraded'),
        unhealthy: this.$t('Unhealthy'),
        running: this.$t('Running'),
        unknown: this.$t('NeverRun')
      }
      const statusLabels = {
        0: this.$t('Failed'),
        1: this.$t('Success'),
        2: this.$t('Pending'),
        3: this.$t('Running'),
        4: this.$t('Partial'),
        5: this.$t('Cancelled'),
        6: this.$t('Timeout')
      }
      const health = healthLabels[status.health] || '-'
      const execution = status.status === null ? this.$t('NeverRun') : statusLabels[status.status]
      return health === execution ? health : `${health} · ${execution || '-'}`
    },
    getNextExecutionDisplay(account, status) {
      const task = account?.task || {}
      if (task.is_periodic && !task.interval && !task.crontab) {
        return this.$t('CloudScheduleIncomplete')
      }
      return toSafeLocalDateStr(status.next_execution_at)
    },
    formatDuration(seconds) {
      if (!seconds) return '-'
      if (seconds < 60) return `${seconds.toFixed(1)}s`
      return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
    },
    valid(status) {
      if (status !== 200) {
        this.$message.error(this.$tc('TestAccountConnectionError'))
        return 200
      }
      return status
    },
    handleOnlineExecute(obj) {
      this.object = obj
      this.onlineSyncVisible = true
    },
    onSubmitSuccess() {
      this.$refs.table.reloadTable()
      this.updateVisible = false
    }
  }
}
</script>
<style lang="scss" scoped>
.account-table {
  :deep(.card-container) {
    grid-template-columns: repeat(auto-fill, minmax(min(540px, 100%), 1fr));
  }

  :deep(.info-panel) {
    gap: 4px;
    padding: 8px 10px;
  }

  :deep(.panel-header) {
    padding: 8px 14px 12px;

    .comment {
      font-size: 12px;
      font-weight: 400;
    }
  }

  :deep(.panel-content) {
    padding: 0 14px 10px;

    .el-row {
      row-gap: 14px;
    }
  }

  :deep(.panel-item) {
    flex: 0 0 33.3333%;
    max-width: 33.3333%;
    min-width: 0;
    padding-right: 18px;

    .item-label {
      margin-bottom: 2px;
      color: var(--el-text-color-secondary);
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
    }

    .item-value {
      display: -webkit-box;
      min-height: 20px;
      margin: 0;
      overflow: hidden;
      color: var(--el-text-color-primary);
      font-size: 13px;
      font-weight: 500;
      line-height: 20px;
      overflow-wrap: normal;
      word-break: normal;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    &:nth-child(1),
    &:nth-child(2) {
      .item-value {
        font-size: 14px;
        font-weight: 600;
      }
    }

    &:nth-child(7) {
      flex-basis: 66.6667%;
      max-width: 66.6667%;
    }

    &:nth-child(8) .item-value {
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

@media (max-width: 720px) {
  .account-table {
    :deep(.panel-item) {
      flex-basis: 50%;
      max-width: 50%;

      &:nth-child(7),
      &:nth-child(8) {
        flex-basis: 100%;
        max-width: 100%;
      }
    }
  }
}

@media (max-width: 440px) {
  .account-table {
    :deep(.panel-item) {
      flex-basis: 100%;
      max-width: 100%;
    }
  }
}
</style>
