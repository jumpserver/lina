<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="user" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" @update:activeMenu="handleUpdate" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import Luna from './Luna'
import Lina from './Lina'

export default {
  components: {
    GenericDetailPage,
    Luna,
    Lina
  },
  data() {
    return {
      user: this.$store.state.users.profile,
      config: {
        title: this.$t('Preferences'),
        activeMenu: 'Lina',
        submenu: this.getSubmenu(),
        hasRightSide: false,
        hasActivity: false,
        actions: {
          detailApiUrl: '/api/v1/users/preference/?category=luna'
        }
      }
    }
  },
  methods: {
    getSubmenu() {
      return [
        {
          title: this.$t('General'),
          name: 'Lina'
        },
        {
          title: this.$t('WebTerminal'),
          name: 'Luna'
        }
      ]
    },
    handleUpdate(value) {
      this.config.activeMenu = value
    }
  }
}
</script>

<style scoped>
</style>
