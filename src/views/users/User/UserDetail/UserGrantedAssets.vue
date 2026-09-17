<template>
  <GrantedAssets v-bind="$data" :user="object.id" />
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
      tableUrl: `/api/v1/perms/users/${this.object.id}/assets/`,
      actions: {
        has: false
      },
      nameDisabled: false
    }
  }
}
</script>
