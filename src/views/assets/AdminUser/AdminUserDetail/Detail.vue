<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailCardItems" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'Detail',
  components: {
    DetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {

    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('assets.Name'),
          value: this.object.name
        },
        {
          key: this.$t('assets.Username'),
          value: this.object.username
        },
        {
          key: this.$t('assets.sshKeyFingerprint'),
          value: this.object.ssh_key_fingerprint
        },
        {
          key: this.$t('assets.date_joined'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('assets.CreatedBy'),
          value: this.object.created_by
        }
      ]
    }
  }
}
</script>

<style lang='less' scoped>

</style>
