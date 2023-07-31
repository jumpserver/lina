<template>
  <GrantedAssets :table-url="tableUrl" :tree-url="treeUrl" />
</template>

<script>
import GrantedAssets from '@/components/Apps/GrantedAssets'

export default {
  name: 'UserGrantedAssets',
  components: {
    GrantedAssets
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      treeUrl: `/api/v1/perms/users/${this.object.id}/nodes/children/tree/?cache_policy=1`,
      tableUrl: `/api/v1/perms/users/${this.object.id}/assets/?cache_policy=1&all=1`
    }
  }
}
</script>

<style scoped>

</style>
