<template>
  <GenericDetailPage v-model:active-menu="config.activeMenu" v-model:object="instance" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="instance" />
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
  data() {
    return {
      instance: {},
      config: {
        url: `/api/v1/acls/login-acls/`,
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Detail'
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
