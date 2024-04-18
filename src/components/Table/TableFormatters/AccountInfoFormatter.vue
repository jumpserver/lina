<template>
  <el-popover
    :title="title"
    placement="left-start"
    trigger="click"
    @show="getAsyncItems"
  >
    <div class="detail-content">
      <div v-for="account of accountData" :key="account.id" class="detail-item">
        <span>{{ account.name }}({{ account.username }})</span>
      </div>
    </div>
    <el-button slot="reference" size="mini" type="primary">{{ $t('common.View') }}</el-button>
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
      accountData: []
    }
  },
  computed: {
    title() {
      return this.formatterArgs.title || this.col.label
    }
  },
  methods: {
    async getAsyncItems() {
      const userId = this.$route.params.id
      const url = `/api/v1/perms/users/${userId}/assets/${this.row.id}`
      this.$axios.get(url).then(res => {
        this.accountData = res?.permed_accounts || []
      })
    }
  }
}
</script>

<style scoped>
.detail-content {
  max-height: 150px;
  overflow-y: auto;
}

.detail-item {
  border-bottom: 1px solid #EBEEF5;
  padding: 5px 0;
  margin-bottom: 0;

  &:hover {
    background-color: #F5F7FA;
  }
}
</style>
