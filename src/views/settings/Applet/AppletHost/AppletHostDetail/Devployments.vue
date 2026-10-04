<template>
  <TwoCol>
    <ListTable ref="table" :header-actions="headerConfig" :table-config="config" />
    <template #right>
      <TinkerDeploymentActions
        v-if="object.id"
        :key="object.id"
        :host-id="object.id"
        @changed="$refs.table?.reloadTable()"
      />
    </template>
  </TwoCol>
</template>

<script lang="jsx">
import { ListTable } from '@/components'
import { openTaskPage } from '@/utils/jms/index'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import TinkerDeploymentActions from './TinkerDeploymentActions.vue'
export default {
  name: 'Developments',
  components: {
    TwoCol,
    ListTable,
    TinkerDeploymentActions
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      headerConfig: {
        hasImport: false,
        hasExport: false,
        hasLeftActions: false
      },
      config: {
        hasSelection: false,
        url: `/api/v1/terminal/applet-host-deployments/?host=${this.object.id}`,
        columns: ['id', 'date_start', 'date_finished', 'status', 'actions'],
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
                pending: 'success',
                success: 'primary',
                failed: 'danger',
                unknown: 'warning'
              }
              const tp = typeMapper[row.status.value] || 'info'
              return (
                <el-tag size="small" type={tp}>
                  {row.status.label}
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
                  callback: function (val) {
                    openTaskPage(val.row.task)
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped></style>
