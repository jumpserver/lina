<template>
  <span v-if="systemuser.length===0"><a style="color: #1c84c6;" @click="showSystemUser">{{ this.$t('common.Show') }}</a></span>
  <span v-else>{{ systemuser.toString() }}</span>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'ShowKeyFormatter',
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
      this.systemuser.push(this.cellValue)
    }
  }
}
</script>
<style scoped>

</style>
