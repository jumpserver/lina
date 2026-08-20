<template>
  <el-dialog
    v-model="visible"
    align-center
    append-to-body
    class="ticket-user-list-dialog"
    destroy-on-close
    :title="title"
    width="520px"
  >
    <div class="ticket-user-list-dialog__summary">
      {{ $t('TicketUserCount', { count: displayUsers.length }) }}
    </div>
    <div class="ticket-user-list-dialog__list">
      <span
        v-for="user in displayUsers"
        :key="user.key"
        :title="user.label"
        class="ticket-user-list-dialog__user"
      >
        {{ user.label }}
      </span>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'UserListDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    users: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    displayUsers() {
      return this.users.filter(Boolean).map((user, index) => {
        return {
          key: this.getUserKey(user, index),
          label: this.formatUser(user)
        }
      })
    }
  },
  methods: {
    getUserKey(user, index) {
      if (typeof user === 'string') {
        return `${user}-${index}`
      }
      return `${user.id || user.username || user.name || 'user'}-${index}`
    },
    formatUser(user) {
      if (typeof user === 'string') {
        return user
      }
      const name = user.name || user.username || '-'
      return user.username && name !== user.username ? `${name} (${user.username})` : name
    }
  }
}
</script>

<style lang="scss">
.ticket-user-list-dialog {
  max-width: calc(100vw - 32px);
  border-radius: 6px;

  .el-dialog__header {
    margin-right: 0;
    padding: 20px 22px 14px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .el-dialog__title {
    color: var(--color-text-primary);
    font-size: 17px;
    font-weight: 600;
  }

  .el-dialog__headerbtn {
    top: 12px;
    right: 12px;
  }

  .el-dialog__body {
    padding: 16px 22px 22px;
  }
}

.ticket-user-list-dialog__summary {
  margin-bottom: 12px;
  color: var(--color-help-text);
  font-size: 13px;
}

.ticket-user-list-dialog__list {
  display: flex;
  overflow-y: auto;
  align-content: flex-start;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 320px;
}

.ticket-user-list-dialog__user {
  display: inline-block;
  overflow: hidden;
  max-width: 100%;
  padding: 4px 10px;
  color: var(--el-color-primary);
  font-size: 13px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 4px;
}
</style>
