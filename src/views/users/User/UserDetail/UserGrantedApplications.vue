<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
export default {
  name: 'UserGrantedApplications',
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
        url: `/api/v1/perms/users/${this.$route.params.id}/applications/`,
        columns: ['name', 'category_display', 'type', 'asset', 'comment'],
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'RemoteAppDetail'
            }
          },
          type: {
            displayKey: 'type_display',
            width: '140px'
          },
          asset: {
            label: '资产',
            formatter(row) {
              return row.attrs.host || row.attrs.hostname
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
