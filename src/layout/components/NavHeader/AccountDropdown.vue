<template>
  <div class="header-tools header-profile">
    <el-dropdown trigger="click" @command="handleClick">
      <span class="el-dropdown-link">
        <el-avatar :src="avatarUrl" class="header-avatar" />
        {{ currentUser.name }}
        <i class="el-icon-arrow-down el-icon--right" />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item icon="el-icon-user" command="profile">{{ $t('common.nav.Profile') }}</el-dropdown-item>
        <div v-if="currentOrgRoles.length > 1|| hasAdminOrg ">
          <el-dropdown-item v-if="isInAdminRole " icon="el-icon-guide" command="userPage">
            {{ $t('common.nav.UserPage') }}
          </el-dropdown-item>
          <el-dropdown-item v-else icon="el-icon-guide" command="adminPage">
            {{ $t('common.nav.AdminPage') }}
          </el-dropdown-item>
        </div>
        <el-dropdown-item icon="el-icon-key" command="apiKey">{{ $t('common.nav.APIKey') }}</el-dropdown-item>
        <el-dropdown-item divided command="logout">{{ $t('common.nav.Logout') }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <ApiKey ref="api" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ApiKey from './ApiKey'
import rolec from '@/utils/role'

export default {
  name: 'AccountDropdown',
  components: {
    ApiKey
  },
  data() {
    return {
      avatarUrl: require('@/assets/img/admin.png'),
      showApiKey: false
    }
  },
  computed: {
    isInAdminRole() {
      const inAdmin = rolec.hasPerm(this.currentRole, rolec.PERM_ADMIN)
      this.$log.debug('Current in admin role: ', inAdmin)
      return inAdmin
    },
    hasAdminOrg() {
      return this.userAdminOrgList.length > 0
    },
    hasAdminRole() {
      return this.currentOrgRoles.includes('Admin')
    },
    ...mapGetters([
      'currentUser',
      'currentRole',
      'currentOrgRoles',
      'userAdminOrgList'
    ])
  },
  methods: {
    handleClick(val) {
      switch (val) {
        case 'profile':
          this.$router.push({ name: 'UserProfile' })
          break
        case 'adminPage':
          this.$store.dispatch('users/setCurrentRole', this.currentOrgRoles[0])
          window.location.href = `/ui/`
          break
        case 'userPage':
          this.$store.dispatch('users/setCurrentRole', this.currentOrgRoles[1])
          console.log('Switch to: ', this.currentOrgRoles[1])
          window.location.href = `/ui/`
          break
        case 'logout':
          window.location.href = `${process.env.VUE_APP_LOGOUT_PATH}?next=${this.$route.fullPath}`
          break
        case 'apiKey':
          this.$refs.api.showApi()
          break
      }
    }
  }
}
</script>

<style scoped>
  .header-avatar {
    height: 30px;
    width: 30px;
    margin-right: 5px;
    vertical-align: middle;
  }
</style>
