<template>
  <GenericDetailPage :object="object" :submenu="submenu" :active-menu="activeSubMenu" :title="title">
    <template #detail>
      <div>
        <el-row :gutter="20">
          <el-col :md="14" :sm="24">
            <DetailCard v-if="flag" :title="cardTitle" :items="detailCardItems" />
          </el-col>
        </el-row>
      </div>
    </template>
  </GenericDetailPage>
</template>

<script>
import { DetailCard } from '@/components'
import { GenericDetailPage } from '@/layout/components'
export default {
  name: 'PlatformDetail',
  components: {
    GenericDetailPage,
    DetailCard
  },
  data() {
    return {
      object: { name: '' },
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
