<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="TaskDetail" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import Detail from './Detail.vue'

export default {
  components: {
    GenericDetailPage,
    Detail
  },
  props: {
    object: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Detail'
          }
        ],
        hasRightSide: false,
        url: `/api/v1/acls/login-acls/`,
        actions: {
          deleteApiUrl: `/api/v1/acls/login-acls/${this.object.id}/`,
          detailApiUrl: `/api/v1/acls/login-acls/`
        }
      }
    }
  }
}
</script>

<style scoped>
</style>
