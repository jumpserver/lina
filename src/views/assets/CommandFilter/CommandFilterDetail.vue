<template>
  <GenericDetailPage :object="object" :submenu="submenu" :active-menu="activeSubMenu" :title="title" />
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
export default {
  name: 'CommandFilterDetail',
  components: {
    GenericDetailPage
  },
  data() {
    return {
      object: { name: '' },
      submenu: [
        {
          title: this.$t('perms.AssetPermissionDetail'),
          name: 'detail'
        },
        {
          title: this.$t('perms.AssetPermissionDetail'),
          name: 'rule'
        }
      ],
      activeSubMenu: 'detail'
    }
  },
  computed: {
    title() {
      return this.$t('perms.AssetPermissionDetail')
    }
  }
}
</script>

<style lang='less' scoped>

</style>
