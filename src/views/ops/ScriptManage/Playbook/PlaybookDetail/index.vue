<template>
  <GenericDetailPage :object.sync="PlaybookDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="PlaybookDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import PlaybookDetail from '@/views/ops/ScriptManage/Playbook/PlaybookDetail/PlaybookDetail'

export default {
  components: {
    GenericDetailPage,
    PlaybookDetail
  },
  data() {
    return {
      PlaybookDetail: {},
      config: {
        getTitle(row) {
          return row['name']
        },
        url: '/api/v1/ops/playbooks/',
        activeMenu: 'PlaybookDetail',
        submenu: [
          {
            title: this.$t('ops.PlaybookDetail'),
            name: 'PlaybookDetail'
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
