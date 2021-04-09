<template>
  <GenericDetailPage :object.sync="TaskDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import Detail from './Detail.vue'
import UserLoginACLList from './UserLoginACLList'
export default {
  components: {
    GenericDetailPage,
    Detail,
    UserLoginACLList
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        activeMenu: 'UserLoginACLList',
        submenu: [
          {
            title: this.$t('acl.Rules'),
            name: 'UserLoginACLList'
          }
        ],
        hasRightSide: false,
        actions: {
          detailApiUrl: `/api/v1/acls/login-acls/${this.$route.params.id}/?user=${this.$route.query.user}`,
          deleteApiUrl: `/api/v1/acls/login-acls/${this.$route.params.id}/?user=${this.$route.query.user}`
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
