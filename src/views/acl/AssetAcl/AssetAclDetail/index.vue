<template>
  <GenericDetailPage :object.sync="TaskDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import detail from './detail.vue'
export default {
  components: {
    GenericDetailPage,
    detail
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        activeMenu: 'detail',
        submenu: [
          {
            title: this.$t('acl.RuleDetail'),
            name: 'detail'
          }
        ],
        hasRightSide: true,
        actions: {
          detailApiUrl: `/api/v1/acls/login-asset-acls/${this.$route.params.id}/`,
          deleteApiUrl: `/api/v1/acls/login-asset-acls/${this.$route.params.id}/`
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
