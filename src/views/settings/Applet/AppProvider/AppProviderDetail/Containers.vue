<template>
  <el-row :gutter="20">
    <el-col :md="16" :sm="24">
      <ListTable :header-actions="headerConfig" :table-config="config" />
    </el-col>
  </el-row>
</template>

<script type="text/jsx">
import { ListTable } from '@/components'

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
            label: this.$t('common.ID')
          },
          'container_name': {
            label: this.$t('common.Name')
          },
          'container_status': {
            label: this.$t('common.Status')
          },
          'container_ports': {
            label: this.$t('common.Ports')
          },
          'container_image': {
            label: this.$t('common.ImageName')
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
