<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
export default {
  name: 'UserGrantedDatabases',
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
        url: `/api/v1/perms/users/${this.object.id}/database-apps/?draw=1`,
        columns: ['name', 'get_type_display', 'host', 'port', 'database', 'comment'],
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'DatabaseAppDetail'
            }
          },
          get_type_display: {
            label: this.$t('applications.type'),
            width: '80px'
          },
          host: {
            width: '140px'
          },
          port: {
            width: '60px'
          },
          database: {
            showOverflowTooltip: true
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
