<template>
  <GenericDetailPage :object.sync="user" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" @update:activeMenu="handleUpdate" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import LunaUpdate from './LunaUpdate'
import KokoUpdate from './KokoUpdate'
import LinaUpdate from './LinaUpdate'
export default {
  components: {
    GenericDetailPage,
    LunaUpdate,
    KokoUpdate,
    LinaUpdate
  },
  data() {
    return {
      user: this.$store.state.users.profile,
      config: {
        title: this.$t('common.Basic'),
        activeMenu: 'LinaUpdate',
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
          title: this.$t('common.Basic'),
          name: 'LinaUpdate'
        },
        {
          title: this.$t('users.LunaSettingUpdate'),
          name: 'LunaUpdate'
        },
        {
          title: this.$t('users.KokoSettingUpdate'),
          name: 'KokoUpdate'
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
