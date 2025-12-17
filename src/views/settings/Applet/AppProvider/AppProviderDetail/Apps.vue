<template>
  <el-row :gutter="20">
    <el-col :md="20" :sm="24">
      <ListTable :header-actions="headerConfig" :table-config="config" />
    </el-col>
  </el-row>
</template>

<script lang="jsx">
import { DrawerListTable as ListTable } from '@/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'Apps',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      headerConfig: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false
      },
      config: {
        url: `/api/v1/terminal/virtual-app-publications/?provider=${this.object.id}`,
        columns: [
          'app.name', 'app.image_name', 'date_updated', 'status'
        ],
        excludes: ['actions'],
        columnsMeta: {
          'app.name': {
            label: this.$t('Name'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => row.app.name,
              getRoute: ({ row }) => ({
                name: 'VirtualAppDetail',
                params: { id: row.app.id }
              })
            },
            id: ({ row }) => row.app.id
          },
          'app.image_name': {
            label: this.$t('ImageName')
          },
          status: {
            label: this.$t('PublishStatus'),
            formatter: (row) => {
              const typeMapper = {
                'pending': 'success',
                'success': 'primary',
                'failed': 'danger',
                'unknown': 'warning'
              }
              const tp = typeMapper[row.status.value] || 'warning'
              return <el-tag size='mini' type={tp}>{row.status.label}</el-tag>
            }
          },
          date_updated: {
            label: this.$t('Date')
          },
          actions: {
            hidden: true,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: true,
              canDelete: false,
              hasClone: false
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
