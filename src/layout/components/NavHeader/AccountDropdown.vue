<template>
  <div class="header-tools header-profile">
    <el-dropdown :show-timeout="50" @command="handleClick">
      <span class="el-dropdown-link">
        <el-avatar :src="avatarUrl" class="header-avatar" />
        {{ currentUser.name }}
        <i class="el-icon-arrow-down el-icon--right" />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="ProfileIndex">
          <svg-icon class="icon" icon-class="attestation" />
          {{ $t('YourProfile') }}
        </el-dropdown-item>

        <el-dropdown-item command="PasswordAndSSHKey">
          <svg-icon class="icon" icon-class="personal" />
          {{ $t('PasswordAndSSHKey') }}
        </el-dropdown-item>

        <!--  Preference -->
        <el-dropdown-item command="Preferences" divided>
          <svg-icon class="icon" icon-class="preference" />
          {{ $t('Preferences') }}
        </el-dropdown-item>

        <!-- logout -->
        <el-dropdown-item command="logout" divided>
          <svg-icon class="icon" icon-class="logout" />
          {{ $t('Logout') }}
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
        case 'ProfileIndex':
          this.$router.push({ name: 'Profile' })
          break
        case 'PasswordAndSSHKey':
          this.$router.push({ name: 'SSHKeyList' })
          break
        case 'Preferences':
          this.$router.push({ name: 'Preferences' })
          break
        case 'logout':
          this.logout()
          break
      }
    },
    async logout() {
      const currentOrg = this.$store.getters.currentOrg
      if (currentOrg.autoEnter) {
        await this.$store.dispatch('users/setCurrentOrg', this.$store.getters.preOrg)
      }
      window.location.href = `${process.env.VUE_APP_LOGOUT_PATH}?next=${this.$route.fullPath}`
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
    margin-right: 3px;
  }
</style>
