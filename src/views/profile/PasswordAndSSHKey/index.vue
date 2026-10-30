<template>
  <GenericDetailPage v-bind="config" v-model:active-menu="config.activeMenu" v-model:object="user">
    <keep-alive>
      <component
        :is="config.activeMenu"
        :key="config.activeMenu"
        :credential-type="config.activeMenu === 'FileEncryption' ? 'file' : 'lock'"
        :object="user"
        @update:active-menu="handleUpdate"
      />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import Password from './Password/Password.vue'
import SSHKeyList from './SSHKey/SSHKeyList.vue'
import ClientCredentials from './ClientCredentials.vue'

export default {
  components: {
    GenericDetailPage,
    Password,
    SSHKeyList,
    ClientCredentials,
    FileEncryption: ClientCredentials
  },
  data() {
    return {
      user: this.$store.state.users.profile,
      config: {
        title: this.$t('PasswordAndSSHKey'),
        activeMenu: ['ClientCredentials', 'FileEncryption'].includes(this.$route.query.tab)
          ? this.$route.query.tab
          : 'Password',
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
          this.config.activeMenu =
            this.$store.state.users.profile.can_public_key_auth &&
            this.$hasPerm('authentication.view_sshkey')
              ? 'SSHKeyList'
              : 'ClientCredentials'
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
          disabled:
            !this.$store.state.users.profile.can_public_key_auth ||
            !this.$hasPerm('authentication.view_sshkey')
        },
        {
          title: this.$t('ClientCredentials'),
          name: 'ClientCredentials'
        },
        {
          title: this.$t('FileEncryption'),
          name: 'FileEncryption'
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
