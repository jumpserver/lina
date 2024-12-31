<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="execution" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="execution" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import Info from './info.vue'
import More from './more.vue'

export default {
  name: 'AccountDiscoverDetail',
  components: {
    GenericDetailPage,
    Info,
    More
  },
  data() {
    return {
      execution: { id: '' },
      config: {
        activeMenu: 'Info',
        url: '/api/v1/accounts/gathered-accounts',
        actions: {
          hasUpdate: false,
          hasDelete: false
        },
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Info'
          },
          {
            title: this.$t('More'),
            name: 'More'
          }
        ],
        getTitle: this.getExecutionTitle

      }
    }
  },
  methods: {
    getExecutionTitle() {
      return `${this.$route.meta.title}: ${this.execution.id}`
    }
  }
}
</script>

<style scoped>

</style>
