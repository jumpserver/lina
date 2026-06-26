<template>
  <GenericDetailPage v-bind="config" v-model:active-menu="config.activeMenu" v-model:object="user">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" @update:active-menu="handleUpdate" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import Lina from './Lina'
import Luna from './Luna'

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

<style scoped></style>
