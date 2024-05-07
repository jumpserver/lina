<template>
  <el-alert v-show="showSqlQueryCounter" class="container" :class="{ noContent }" type="info" @close="handleClose">
    <el-tag
      v-for="item in sqlQueryCounter || []"
      :key="item.url"
      :type="getType(item)"
      size="small"
      style="margin-right: 5px"
    >
      {{ item.url }}: <b>{{ item.count }}</b>
    </el-tag>
  </el-alert>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'LicenseRelatedTip',
  data() {
    return {
      loading: true,
      licenseData: {}
    }
  },
  computed: {
    ...mapGetters([
      'sqlQueryCounter',
      'showSqlQueryCounter'
    ]),
    noContent() {
      return this.sqlQueryCounter.length === 0
    }
  },
  methods: {
    getType(item) {
      if (item.count > 10) {
        return 'danger'
      } else if (item.count > 5) {
        return 'warning'
      } else {
        return 'success'
      }
    },
    handleClose() {
      this.$store.dispatch('common/showSqlQueryCounter', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 5px;
  width: 100%;
  overflow: hidden;
  background-color: #f3f3f4 !important;
  border: none !important;
}

.noContent {
  display: none;
}
</style>
