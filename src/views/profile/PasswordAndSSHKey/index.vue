<template>
  <GenericDetailPage v-model:active-menu="config.activeMenu" v-model:object="user" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="user" @update:active-menu="handleUpdate" />
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
  computed: {
    passwordMenuDisabled() {
      return this.$store.state.users.profile.source.value !== 'local'
    }
  },
  watch: {
    passwordMenuDisabled: {
      immediate: true,
      handler(disabled) {
        this.config.submenu = this.getSubmenu()
        if (disabled && this.config.activeMenu === 'Password') {
          this.config.activeMenu = 'SSHKeyList'
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
