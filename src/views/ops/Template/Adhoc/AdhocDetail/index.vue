<template>
  <GenericDetailPage :object.sync="AdhocDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="AdhocDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AdhocDetail from '@/views/ops/Template/Adhoc/AdhocDetail/AdhocDetail'

export default {
  components: {
    GenericDetailPage,
    AdhocDetail
  },
  data() {
    return {
      AdhocDetail: {},
      config: {
        getTitle(row) {
          return row['name']
        },
        url: '/api/v1/ops/adhocs',
        activeMenu: 'AdhocDetail',
        submenu: [
          {
            title: this.$t('ops.AdhocDetail'),
            name: 'AdhocDetail'
          }
        ],
        hasRightSide: false
      }
    }
  }
}
</script>

<style scoped>

</style>
