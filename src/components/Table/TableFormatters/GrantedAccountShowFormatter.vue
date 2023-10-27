<template>
  <span v-if="!accounts"><a style="color: #1c84c6;" @click="showAccount">{{ this.$t('common.Show') }}</a></span>
  <span v-else>{{ accounts.toString() }}</span>
</template>

<script>
import BaseFormatter from './base.vue'

export default {
  name: 'GrantedSystemUsersShowFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          getUrl: ({ row, col }) => ''
        }
      }
    }
  },
  data() {
    return {
      accounts: null
    }
  },
  methods: {
    async showAccount() {
      const formatterArgs = Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
      const url = formatterArgs.getUrl({ row: this.row, col: this.col })
      const data = await this.$axios.get(url)
      this.accounts = data['permed_accounts'].map((item) => item.name)
    }
  }
}
</script>
<style scoped>
</style>
