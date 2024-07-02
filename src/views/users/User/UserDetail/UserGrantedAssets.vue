<template>
  <GrantedAssets v-bind="$data" />
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
      treeUrl: `/api/v1/perms/users/${this.object.id}/nodes/children/tree/`,
      tableUrl: `/api/v1/perms/users/${this.object.id}/assets/?all=1`,
      actions: {
        has: false
      },
      nameDisabled: false
    }
  }
}
</script>
