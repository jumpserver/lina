<template>
  <ListTable
    :table-config="tableConfig"
    :header-actions="headerActions"
  />
</template>

<script>
import { ListTable } from '@/components'
export default {
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
      loading: true,
      tableConfig: {
        url: '/api/v1/users/users/',
        columns: ['name', 'username']
      },
      headerActions: {
        hasLeftActions: false
      }
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.perm-tree >>> .ztree {
}

</style>
