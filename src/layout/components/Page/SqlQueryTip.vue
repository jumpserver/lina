<template>
  <div class="container">
    <el-tag
      v-for="item in sqlQueryCounter || []"
      :key="item.url"
      :type="getType(item)"
      size="small"
      style="margin-right: 5px"
    >
      {{ item.url }}: <b>{{ item.count }}</b>
    </el-tag>
  </div>
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
      'sqlQueryCounter'
    ])
  },
  mounted() {
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
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 5px;
  width: 100%;
  overflow: hidden;
}

</style>
