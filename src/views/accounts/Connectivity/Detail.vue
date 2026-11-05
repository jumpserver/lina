<template>
  <GenericDetailPage
    :key="connectivity.type"
    v-model:object="task"
    v-model:active-menu="activeMenu"
    :url="connectivity.url"
    :actions="actions"
    :submenu="submenu"
    :has-activity="false"
  >
    <TwoCol v-if="task.id && activeMenu === 'basic'">
      <AutoDetailCard :key="task.id" :object="task" :url="detailUrl" :fields="detailFields" />
      <template #right>
        <QuickActions :actions="quickActions" />
      </template>
    </TwoCol>
    <DrawerListTable
      v-else-if="task.id && activeMenu === 'assets'"
      :table-config="assetTableConfig"
      :header-actions="assetHeaderActions"
    />
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import { QuickActions } from '@/components'
import DrawerListTable from '@/components/Table/DrawerListTable/index.vue'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'
import { connectivityMixin } from './config'

export default {
  name: 'ConnectivityDetail',
  components: {
    GenericDetailPage,
    TwoCol,
    AutoDetailCard,
    QuickActions,
    DrawerListTable
  },
  mixins: [connectivityMixin],
  data() {
    return {
      task: {},
      activeMenu: 'basic',
      assetHeaderActions: {
        hasCreate: false,
        hasImport: false,
        hasExport: false,
        hasLeftActions: false,
        hasMoreActions: false,
        searchConfig: { getUrlQuery: false }
      }
    }
  },
  computed: {
    detailUrl() {
      return `${this.connectivity.url}${this.task.id}/`
    },
    submenu() {
      return [
        { name: 'basic', title: this.$t('Basic') },
        { name: 'assets', title: this.$t('Assets') }
      ]
    },
    actions() {
      return {
        canUpdate:
          this.$hasPerm(this.connectivity.changePermission) &&
          !this.$store.getters.currentOrgIsRoot,
        canDelete: this.$hasPerm(this.connectivity.deletePermission),
        updateRoute: this.connectivity.updateRoute,
        deleteSuccessRoute: 'ConnectivityList'
      }
    },
    detailFields() {
      return [
        'id',
        'name',
        ...(this.connectivity.type === 'account'
          ? [
              {
                key: this.$t('Accounts'),
                value: this.task.accounts?.join(', ') || this.$t('ConnectivityAllAccounts')
              }
            ]
          : []),
        {
          key: this.$t('Nodes'),
          value: this.task.nodes?.map((node) => node.name).join(', ') || '-'
        },
        {
          key: this.$t('Assets'),
          value: this.task.assets?.map((asset) => asset.name).join(', ') || '-'
        },
        'is_periodic',
        'periodic_display',
        'last_execution_date',
        'executed_amount',
        'is_active',
        'date_created',
        'date_updated',
        'comment'
      ]
    },
    quickActions() {
      return [
        {
          title: this.$t('ManualExecution'),
          attrs: {
            type: 'primary',
            label: this.$t('Execute'),
            disabled: !this.task.is_active || !this.$hasPerm(this.connectivity.executePermission)
          },
          callbacks: {
            click: async () => {
              const data = await this.$axios.post(this.connectivity.executionUrl, {
                automation: this.task.id
              })
              openTaskPage(data.task)
            }
          }
        }
      ]
    },
    assetTableConfig() {
      return {
        url: `${this.connectivity.relationUrl}${this.task.id}/assets/`,
        columns: ['name', 'address'],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AssetDetail',
              drawer: true,
              can: this.$hasPerm('assets.view_asset')
            }
          },
          actions: { has: false }
        }
      }
    }
  }
}
</script>
