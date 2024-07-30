<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="user" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" @update:activeMenu="handleUpdate" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import Password from './Password/Password.vue'
import SSHKeyList from './SSHKey/SSHKeyList.vue'

export default {
  components: {
    GenericDetailPage,
    Password,
    SSHKeyList
  },
  data() {
    return {
      user: this.$store.state.users.profile,
      config: {
        title: this.$t('PasswordAndSSHKey'),
        activeMenu: 'Password',
        submenu: this.getSubmenu(),
        hasRightSide: false,
        hasActivity: false,
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
          title: this.$t('LoginPasswordSetting'),
          name: 'Password',
          disabled: this.$store.state.users.profile.source.value !== 'local'
        },
        {
          title: this.$t('LoginSSHKeySetting'),
          name: 'SSHKeyList',
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
