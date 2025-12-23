<template>
  <GenericDetailPage v-model:active-menu="config.activeMenu" v-model:object="instance" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="instance" />
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
      instance: {},
      actions: {},
      config: {
        url: '/api/v1/assets/platforms/',
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
            title: this.$t('Automation'),
            name: 'Automation'
          }
        ],
        actions: {
          canUpdate: () => {
            return !this.instance.internal && this.$hasPerm('assets.change_platform')
          },
          canDelete: () => {
            return !this.instance.internal && this.$hasPerm('assets.delete_platform')
          },
          updateCallback: () => {
            const { id, type, category } = this.instance
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
