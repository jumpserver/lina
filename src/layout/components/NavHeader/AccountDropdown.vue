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
        <div v-if="currentOrgRoles.length > 1 || hasAdminOrg ">
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
import orgUtil from '@/utils/org'

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
    ...mapGetters([
      'currentUser',
      'currentRole',
      'currentOrgRoles',
      'userAdminOrgList',
      'currentOrgPerms'
    ]),
    isInAdminRole() {
      const inAdmin = (this.currentRole & this.adminPageRequirePerm) !== 0
      return inAdmin
    },
    hasAdminOrg() {
      return this.userAdminOrgList.length > 0
    },
    adminPageRequirePerm() {
      return rolec.PERM_SUPER | rolec.PERM_ADMIN | rolec.PERM_AUDIT
    },
    currentOrgAdminPagePerm() {
      // 只有有一个权限就可以
      return this.adminPageRequirePerm & this.currentOrgPerms
    },
    currentOrgUsePagePerm() {
      const userPageRequireRole = rolec.PERM_USE
      return userPageRequireRole & this.currentOrgPerms
    }
  },
  methods: {
    handleClick(val) {
      switch (val) {
        case 'profile':
          this.$router.push({ name: 'UserProfile' })
          break
        case 'adminPage':
          this.$store.dispatch('users/setCurrentRole', this.currentOrgAdminPagePerm)
          if (this.currentOrgAdminPagePerm) {
            window.location.href = `/ui/`
          } else {
            orgUtil.change2PropOrg()
          }
          break
        case 'userPage':
          if (this.currentOrgUsePagePerm) {
            this.$store.dispatch('users/setCurrentRole', rolec.USER)
            console.log('Switch to: ', rolec.USER)
            window.location.href = `/ui/`
          }
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
