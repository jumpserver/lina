<template>
  <GenericDetailPage :object.sync="plan" :active-menu.sync="config.activeMenu" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ChangeAuthPlanInfo from './ChangeAuthPlanDetail'

export default {
  components: {
    GenericDetailPage,
    ChangeAuthPlanInfo
  },
  data() {
    return {
      plan: { name: '', username: '', comment: '' },
      config: {
        activeMenu: 'ChangeAuthPlanInfo',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'ChangeAuthPlanInfo'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
