<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="TaskDetail" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail.vue'
import Automation from './Automation.vue'
import Assets from './Assets.vue'

export default {
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    Automation,
    Assets
  },
  data() {
    return {
      TaskDetail: {},
      actions: {},
      config: {
        url: '/api/v1/assets/platforms',
        title: this.$t('PlatformDetail'),
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Detail'
          },
          {
            title: this.$t('Assets'),
            name: 'Assets'
          },
          {
            title: this.$t('Automations'),
            name: 'Automation'
          }
        ],
        actions: {
          canUpdate: () => {
            return !this.TaskDetail.internal && this.$hasPerm('assets.change_platform')
          },
          canDelete: () => {
            return !this.TaskDetail.internal && this.$hasPerm('assets.delete_platform')
          },
          updateCallback: () => {
            const { id, type, category } = this.TaskDetail
            this.$router.push({
              name: 'PlatformUpdate',
              params: { id },
              query: {
                type: type.value,
                category: category.value
              }
            })
          }
        },
        hasRightSide: this.$route.params.id > 7
      }
    }
  },
  computed: {
    hasRightSide() {
      return this.$route.params.id > 7
    }
  }
}
</script>

<style scoped>

</style>
