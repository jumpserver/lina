<template>
  <el-row :gutter="20">
    <el-col :md="20" :sm="24">
      <ListTable :header-actions="headerConfig" :table-config="config" />
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import { DrawerListTable as ListTable } from '@/components'

export default {
  name: 'Containers',
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
        url: `/api/v1/terminal/app-providers/${this.object.id}/containers/`,
        columns: [
          'container_id', 'container_name', 'container_image', 'container_ports', 'container_status'
        ],
        excludes: ['actions'],
        columnsMeta: {
          'container_id': {
            label: this.$t('ID')
          },
          'container_name': {
            label: this.$t('Name')
          },
          'container_status': {
            label: this.$t('Status')
          },
          'container_ports': {
            label: this.$t('Ports')
          },
          'container_image': {
            label: this.$t('ImageName')
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
