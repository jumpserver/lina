<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { ListTable } from '@/components'

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
        columns: ['name', 'type', 'host', 'database', 'comment'],
        columnsMeta: {
          name: {
            route: 'DatabaseAppDetail'
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false
      }
    }
  }
}
</script>

<style scoped>

</style>
