<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
export default {
  name: 'UserGrantedRemoteApps',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/users/${this.object.id}/remote-apps/?draw=1`,
        columns: ['name', 'type', 'asset', 'comment'],
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'RemoteAppDetail'
            }
          },
          type: {
            displayKey: 'get_type_display',
            width: '140px'
          },
          asset: {
            formatter(row) {
              return row.asset_info.hostname
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false
      }
    }
  }
}
</script>

<style scoped>

</style>
