<template>
  <span v-if="systemuser.length===0"><a style="color: #1c84c6;" @click="showSystemUser">{{ this.$t('显示') }}</a></span>
  <span v-else>{{ this.systemuser.toString() }}</span>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'SystemUserFormatter',
  extends: BaseFormatter,
  data() {
    return {
      systemuser: []
    }
  },
  computed: {

  },
  mounted() {

  },
  methods: {
    showSystemUser() {
      const id = (this.row.id)
      this.$axios.get(
        `/api/v1/perms/users/assets/${id}/system-users/?cache_policy=1`
      ).then(res => {
        res.forEach((v, i) => {
          this.systemuser.push(v.name)
        })
        console.log(this.systemuser)
      }
      )
    }
  }
}
</script>
<style scoped>

</style>
