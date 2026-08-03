<template>
  <span class="cc-users">
    <template v-if="normalizedUsers.length">
      <span>{{ previewUsers.map(formatUser).join(', ') }}</span>
      <el-link
        v-if="normalizedUsers.length > previewLimit"
        class="cc-users__more"
        type="primary"
        :underline="false"
        @click="visible = true"
      >
        {{ $t('CcUsersViewAll', { count: normalizedUsers.length }) }}
      </el-link>
    </template>
    <span v-else>-</span>

    <UserListDialog v-model="visible" :title="$t('CcUsers')" :users="normalizedUsers" />
  </span>
</template>

<script>
import UserListDialog from './UserListDialog'

export default {
  name: 'CcUsers',
  components: { UserListDialog },
  props: {
    users: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      previewLimit: 3,
      visible: false
    }
  },
  computed: {
    normalizedUsers() {
      const users = Array.isArray(this.users) && this.users.length ? this.users : this.value
      return Array.isArray(users) ? users.filter(Boolean) : []
    },
    previewUsers() {
      return this.normalizedUsers.slice(0, this.previewLimit)
    }
  },
  methods: {
    formatUser(user) {
      const name = user.name || user.username || '-'
      return user.username && name !== user.username ? `${name} (${user.username})` : name
    }
  }
}
</script>

<style lang="scss" scoped>
.cc-users__more {
  margin-left: 8px;
}
</style>
