<template>
  <GenericDetailPage :submenu="submenu" :active-menu="activeSubMenu" :title="title" />
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
export default {
  name: 'PlatformDetail',
  components: {
    GenericDetailPage
  },
  data() {
    return {
      submenu: [
        {
          title: this.$t('perms.AssetPermissionDetail'),
          name: 'detail'
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
