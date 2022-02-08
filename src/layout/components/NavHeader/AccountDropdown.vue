<template>
  <div class="header-tools header-profile">
    <el-dropdown @command="handleClick">
      <span class="el-dropdown-link">
        <el-avatar :src="avatarUrl" class="header-avatar" />
        {{ currentUser.name }}
        <i class="el-icon-arrow-down el-icon--right" />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item icon="el-icon-user" command="profile">{{ $t('common.nav.Profile') }}</el-dropdown-item>
        <el-dropdown-item v-show="showSettings" icon="el-icon-setting" command="settings">{{ $t('route.Settings') }}</el-dropdown-item>
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
import orgUtil from '@/utils/org'
import store from '@/store'

export default {
  name: 'AccountDropdown',
  components: {
    ApiKey
  },
  data() {
    return {
      avatarUrl: require('@/assets/img/admin.png'),
      showSettings: false,
      showApiKey: false
    }
  },
  computed: {
    ...mapGetters([
      'currentUser',
      'currentRole',
      'currentOrgRoles',
      'orgs',
      'currentOrgPerms'
    ]),
    isInAdminRole() {
      const inAdmin = rolec.hasPerm(rolec.ADMIN_PAGE_REQUIRE_PERM_MIN, this.currentRole)
      return inAdmin
    },
    hasAdminOrg() {
      return this.orgs.length > 0
    },
    adminPageRequirePerm() {
      return rolec.PERM_SUPER | rolec.PERM_ADMIN | rolec.PERM_AUDIT
    },
    hasCurrentOrgAdminPagePerm() {
      // 只有有一个权限就可以
      return rolec.hasAdminPagePerm(this.currentOrgPerms)
    },
    currentOrgUsePagePerm() {
      const userPageRequireRole = rolec.PERM_USE
      return userPageRequireRole & this.currentOrgPerms
    }
  },
  created() {
    store.dispatch('permission/getRootPerms', 'settings.change_setting').then(res => {
      this.showSettings = res
    })
  },
  methods: {
    handleClick(val) {
      const fromRoute = this.$route
      switch (val) {
        case 'profile':
          this.$router.push('/users/profile', () => {
            store.dispatch('permission/generateViewRoutes', { to: this.$route, from: fromRoute })
          })
          break
        case 'settings':
          this.$router.push('/settings', () => {
            store.dispatch('permission/generateViewRoutes', { to: this.$route, from: fromRoute })
          })
          break
        case 'adminPage':
          if (this.hasCurrentOrgAdminPagePerm) {
            const currentRole = rolec.getUserInAdminPagePerm(this.currentOrgPerms)
            this.$store.dispatch('users/setCurrentRole', currentRole)
            window.location.href = `/ui/`
          } else {
            orgUtil.change2PropOrg()
          }
          break
        case 'userPage':
          if (this.currentOrgUsePagePerm) {
            this.$store.dispatch('users/setCurrentRole', rolec.USER)
            window.location.href = `/ui/`
          }
          break
        case 'logout':
          this.logout()
          window.location.href = `${process.env.VUE_APP_LOGOUT_PATH}?next=${this.$route.fullPath}`
          break
        case 'apiKey':
          this.$refs.api.showApi()
          break
      }
    },
    logout() {
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
