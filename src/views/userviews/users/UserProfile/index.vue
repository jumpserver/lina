<template>
  <GenericDetailPage :object.sync="user" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" @update:activeMenu="handleUpdate" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ProfileInfo from './ProfileInfo'
import ProfileUpdate from './ProfileUpdate'
import PasswordUpdate from './PasswordUpdate'
import SSHUpdate from './SSHUpdate'

export default {
  components: {
    GenericDetailPage,
    ProfileInfo,
    ProfileUpdate,
    PasswordUpdate,
    SSHUpdate
  },
  data() {
    return {
      user: {},
      config: {
        title: this.$t('users.Profile'),
        activeMenu: 'ProfileInfo',
        submenu: this.getSubmenu(),
        hasRightSide: false,
        actions: {
          detailApiUrl: '/api/v1/users/profile/'
        }
      }
    }
  },
  methods: {
    getSubmenu() {
      return [
        {
          title: this.$t('common.BasicInfo'),
          name: 'ProfileInfo'
        },
        {
          title: this.$t('users.ProfileSetting'),
          name: 'ProfileUpdate'
        },
        {
          title: this.$t('users.LoginPasswordSetting'),
          name: 'PasswordUpdate',
          disabled: this.$store.state.users.profile.source !== 'local'
        },
        {
          title: this.$t('users.SSHKeySetting'),
          name: 'SSHUpdate',
          disabled: !this.$store.state.users.profile.can_public_key_auth
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
