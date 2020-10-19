<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
export default {
  name: 'UserGrantedK8Ss',
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
        url: `/api/v1/perms/users/${this.object.id}/k8s-apps/?draw=1`,
        columns: ['name', 'type', 'cluster', 'comment'],
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'KubernetesAppDetail'
            }
          },
          comment: {
            width: '340px'
          },
          type: {
            width: '140px'
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
