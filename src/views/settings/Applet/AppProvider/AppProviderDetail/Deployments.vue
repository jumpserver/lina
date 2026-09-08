<template>
  <TwoCol>
    <div>
      <el-alert :title="$t('AppProviderDeployHelp')" type="info" :closable="false" />
      <el-alert
        v-if="object.deployment_error"
        :title="object.deployment_error"
        type="warning"
        :closable="false"
      />
      <ListTable ref="table" :header-actions="headerActions" :table-config="tableConfig" />
    </div>
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
    </template>
  </TwoCol>
</template>

<script lang="jsx">
import { ListTable, QuickActions } from '@/components'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { openTaskPage } from '@/utils/jms/index'

export default {
  name: 'AppProviderDeployments',
  components: { ListTable, QuickActions, TwoCol },
  emits: ['refresh', 'deployment-created'],
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      submitting: false,
      active: true,
      headerActions: {
        hasImport: false,
        hasExport: false,
        hasLeftActions: false,
        hasRefresh: true
      },
      tableConfig: {
        hasSelection: false,
        url: `/api/v1/terminal/app-provider-deployments/?provider=${this.object.id}&publication__isnull=true`,
        columns: ['id', 'date_created', 'date_start', 'date_finished', 'status', 'actions'],
        columnsMeta: {
          id: {
            type: 'index',
            label: 'ID',
            sortable: 'custom'
          },
          status: {
            label: this.$t('Status'),
            formatter: (row) => {
              const typeMapper = {
                pending: 'warning',
                running: 'warning',
                success: 'success',
                successful: 'success',
                failed: 'danger',
                error: 'danger',
                unknown: 'warning'
              }
              const status = row.status?.value || row.status
              const label = row.status?.label || row.status
              return (
                <el-tag size="small" type={typeMapper[status] || 'info'}>
                  {label}
                </el-tag>
              )
            }
          },
          actions: {
            formatterArgs: {
              hasClone: false,
              hasDelete: false,
              hasUpdate: false,
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('View'),
                  type: 'primary',
                  can: ({ row }) => Boolean(row.task),
                  callback: ({ row }) => openTaskPage(row.task)
                }
              ]
            }
          }
        }
      }
    }
  },
  computed: {
    status() {
      return this.object.deployment?.status?.value || this.object.deployment?.status
    },
    deploying() {
      return ['pending', 'running'].includes(this.status)
    },
    canDeploy() {
      return (
        Boolean(this.object.host) &&
        !this.object.deployment_error &&
        !this.submitting &&
        !this.deploying &&
        this.$hasPerm('terminal.add_appproviderdeployment')
      )
    },
    quickActions() {
      return [
        {
          title: this.$t('AppProviderDeployment'),
          attrs: {
            type: 'primary',
            label: this.$t(['failed', 'error'].includes(this.status) ? 'Retry' : 'Deploy'),
            loading: this.submitting || this.deploying,
            disabled: !this.canDeploy
          },
          callbacks: {
            click: this.deploy
          }
        },
        {
          title: this.$t('Task'),
          attrs: {
            type: 'primary',
            label: this.$t('View'),
            disabled: !this.object.deployment?.task
          },
          callbacks: {
            click: () => openTaskPage(this.object.deployment.task)
          }
        },
        {
          title: this.$t('Status'),
          attrs: { type: 'primary', label: this.$t('Refresh') },
          callbacks: {
            click: () => {
              this.$emit('refresh')
              this.$refs.table?.reloadTable()
            }
          }
        }
      ]
    }
  },
  watch: {
    'object.deployment': function () {
      if (this.active) this.$refs.table?.reloadTable()
    }
  },
  activated() {
    this.active = true
    this.$refs.table?.reloadTable()
  },
  deactivated() {
    this.active = false
  },
  methods: {
    async deploy() {
      if (!this.canDeploy) return
      this.submitting = true
      try {
        const deployment = await this.$axios.post('/api/v1/terminal/app-provider-deployments/', {
          provider: this.object.id
        })
        this.$emit('deployment-created', deployment)
        this.$refs.table?.reloadTable()
        if (deployment.task) openTaskPage(deployment.task)
      } catch (error) {
        this.$emit('refresh')
        this.$log.warn('Deploy application provider failed', error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.el-alert {
  margin-bottom: 12px;
}
</style>
