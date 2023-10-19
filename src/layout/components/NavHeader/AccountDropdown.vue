<template>
  <div class="header-tools header-profile">
    <el-dropdown :show-timeout="50" @command="handleClick">
      <span class="el-dropdown-link">
        <el-avatar :src="avatarUrl" class="header-avatar" />
        {{ currentUser.name }}
        <i class="el-icon-arrow-down el-icon--right" />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="profile">
          <svg-icon class="icon" icon-class="attestation" />
          {{ $t('common.nav.Profile') }}
        </el-dropdown-item>
        <el-dropdown-item command="UserSetting">
          <svg-icon class="icon" icon-class="preference" />
          {{ $t('users.UserSetting') }}
        </el-dropdown-item>
        <el-dropdown-item v-if="$hasPerm('authentication.view_accesskey')" command="apiKey">
          <svg-icon class="icon" icon-class="key" />
          {{ $t('common.nav.APIKey') }}
        </el-dropdown-item>
        <el-dropdown-item
          v-if="$store.getters.publicSettings.AUTH_TEMP_TOKEN && $hasPerm('authentication.view_temptoken')"
          command="tempPassword"
        >
          <svg-icon class="icon" icon-class="unlock-one" />
          {{ $t('common.nav.TempPassword') }}
        </el-dropdown-item>
        <el-dropdown-item command="logout" divided>
          <svg-icon class="icon" icon-class="logout" />
          {{ $t('common.nav.Logout') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AccountDropdown',
  data() {
    return {
      avatarUrl: require('@/assets/img/avatar.png'),
      showApiKey: false
    }
  },
  computed: {
    ...mapGetters([
      'currentUser'
    ])
  },
  created() {
  },
  methods: {
    handleClick(val) {
      switch (val) {
        case 'profile':
          this.$router.push('/profile')
          break
        case 'logout':
          this.logout()
          window.location.href = `${process.env.VUE_APP_LOGOUT_PATH}?next=${this.$route.fullPath}`
          break
        case 'apiKey':
          this.$router.push('/profile/api-keys')
          break
        case 'tempPassword':
          this.$router.push('/profile/temp-password')
          break
        case 'UserSetting':
          this.$router.push('/profile/user/setting')
      }
    },
    logout() {
    }
  }
}
</script>

<style lang="scss" scoped>
  .header-profile {
    .el-dropdown {
      color: #fff;
    }
  }

  .header-avatar {
    height: 24px;
    width: 24px;
    margin-right: 5px;
    vertical-align: middle;
    background: white;
  }

  .mobile .header-avatar {
    display: none;
  }

  .icon {
    font-size: 14px;
  }
</style>
