<template>
  <GenericDetailPage
    :object.sync="PlaybookDetail"
    :active-menu.sync="config.activeMenu"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="PlaybookDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import PlaybookDetail from '@/views/ops/Template/Playbook/PlaybookDetail/PlaybookDetail'
import Workspace from '@/views/ops/Template/Playbook/PlaybookDetail/Workspace.vue'

export default {
  components: {
    GenericDetailPage,
    PlaybookDetail,
    Workspace
  },
  data() {
    return {
      PlaybookDetail: {},
      config: {
        getTitle(row) {
          return row['name']
        },
        url: '/api/v1/ops/playbooks',
        activeMenu: 'PlaybookDetail',
        submenu: [
          {
            title: this.$t('ops.PlaybookDetail'),
            name: 'PlaybookDetail'
          },
          {
            title: this.$t('ops.Workspace'),
            name: 'Workspace'
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
