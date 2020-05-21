<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <AutoPushCard v-bind="AutoPushConfig" />
    </el-col>
  </el-row>
</template>a

<script>
import DetailCard from '@/components/DetailCard'
import AutoPushCard from './AutoPushCard'

export default {
  name: 'Detail',
  components: {
    DetailCard,
    AutoPushCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      AutoPushConfig: {
        icon: 'fa-info',
        title: this.$t('assets.QuickUpdate'),
        url: `/api/v1/assets/system-users/${this.object.id}/`,
        content: [
          {
            name: this.$t('assets.AutoPush'),
            auto_push: this.object.auto_push
          }
        ]
      }
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
          key: this.$t('assets.LoginModel'),
          value: this.object.login_mode_display
        },
        {
          key: 'Sudo',
          value: this.object.sudo
        },
        {
          key: 'Shell',
          value: this.object.shell
        },
        {
          key: this.$t('assets.date_joined'),
          value: '暂时没有这个API'
        },
        {
          key: this.$t('assets.CreatedBy'),
          value: '暂时没有这个API'
        }
      ]
    }
  }
}
</script>

<style lang='less' scoped>

</style>
