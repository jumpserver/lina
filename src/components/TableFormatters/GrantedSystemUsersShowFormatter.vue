<template>
  <span v-if="!systemUsers"><a style="color: #1c84c6;" @click="showSystemUser">{{ this.$t('common.Show') }}</a></span>
  <span v-else>{{ systemUsers.toString() }}</span>
</template>

<script>
import BaseFormatter from './base'
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
      systemUsers: null
    }
  },
  methods: {
    async showSystemUser() {
      const formatterArgs = Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
      const url = formatterArgs.getUrl({ row: this.row, col: this.col })
      const data = await this.$axios.get(url)
      this.systemUsers = data.map((item) => item.name)
    }
  }
}
</script>
<style scoped>
</style>
