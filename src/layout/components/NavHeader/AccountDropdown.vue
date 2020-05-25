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
        <el-dropdown-item v-if="CheckPermission && CheckRules " icon="el-icon-guide" command="UserPage">{{
          $t('common.nav.UserPage') }}
        </el-dropdown-item>
        <el-dropdown-item v-if="!CheckPermission && CheckRules " icon="el-icon-guide" command="AdminPage">{{
          $t('common.nav.AdminPage') }}
        </el-dropdown-item>
        <el-dropdown-item icon="el-icon-key" command="apiKey">{{ $t('common.nav.APIKey') }}</el-dropdown-item>
        <el-dropdown-item divided command="logout">{{ $t('common.nav.Logout') }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <ApiKey ref="api" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ApiKey from '@/views/dashboard/ApiKey'
import { getPermission, setPermission } from '@/utils/auth'

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
    CheckPermission() {
      return getPermission() === 'Admin'
    },
    CheckRules() {
      return this.getCurrentOrgRoles.includes('Admin')
    },
    ...mapGetters([
      'currentUser',
      'getCurrentOrgRoles'
    ])
  },
  methods: {
    handleClick(val) {
      switch (val) {
        case 'AdminPage':
          setPermission('Admin')
          window.location.href = `/`
          break
        case 'UserPage':
          setPermission('User')
          window.location.href = `/`
          break
        case 'logout':
          window.location.href = `/auth/logout/?next=${this.$route.fullPath}`
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
