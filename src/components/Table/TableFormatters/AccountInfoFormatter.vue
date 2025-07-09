<template>
  <el-popover
    :title="title"
    placement="left-start"
    trigger="click"
    :offset="-200"
    @show="getAsyncItems"
  >
    <div v-if="!loading" class="detail-content">
      <div v-if="accountData.length === 0" class="empty-item">
        <span>{{ $t('No accounts') }}</span>
      </div>
      <div v-for="account of accountData" :key="account.id" class="detail-item">
        <span>{{ getDisplay(account) }}</span>
        <el-tag style="float:right" type="success" size="mini" class="expired-date">{{ $t('Expired') }} : {{
          $moment(account.date_expired).format('YYYY-MM-DD HH:mm:ss')
        }}
        </el-tag>
      </div>
    </div>
    <el-button slot="reference" class="link-btn" plain size="mini" type="primary">
      {{ $t('View') }} <i class="el-icon-arrow-down" />
    </el-button>
  </el-popover>
</template>

<script>
import BaseFormatter from './base.vue'

export default {
  name: 'SwitchFormatter',
  extends: BaseFormatter,
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs),
      value: this.cellValue,
      accountData: [],
      loading: false
    }
  },
  computed: {
    title() {
      return this.formatterArgs.title || this.col.label
    }
  },
  methods: {
    getDisplay(account) {
      const { username, name } = account
      if (username.startsWith('@')) {
        return name
      } else if (name === username) {
        return username
      } else {
        return `${name}(${username})`
      }
    },
    async getAsyncItems() {
      this.loading = true
      const userId = this.$route.params.id || 'self'
      const url = `/api/v1/perms/users/${userId}/assets/${this.row.id}/`
      this.$axios.get(url).then(res => {
        this.accountData = res?.permed_accounts || []
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-content {
  max-height: 150px;
  overflow-y: auto;
  min-width: 350px;
}

.detail-item {
  border-bottom: 1px solid #EBEEF5;
  padding: 5px 0;
  margin-bottom: 0;
  display: flex;
  justify-content: space-between;

  &:hover {
    background-color: #F5F7FA;
  }

  .expired-date {

  }
}
</style>
