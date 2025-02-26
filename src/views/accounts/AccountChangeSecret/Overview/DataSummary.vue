<template>
  <div>
    <el-row :gutter="16">
      <el-col :sm="24" :md="24" class="margin-top-10">
        <SummaryCountCard :config="logConfig" :items="LogItems" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import SummaryCountCard from '@/components/Dashboard/SummaryCountCard.vue'

export default {
  components: { SummaryCountCard },
  props: {
    days: {
      type: [Number, String],
      default: '7'
    }
  },
  data() {
    return {
      logConfig: {
        title: this.$t('OngoingPwdChange'),
        tip: this.$t('OngoingPwdChange')
      },
      data: {
        total_count_ongoing_change_secret: 0,
        total_count_ongoing_change_secret_assets: 0,
        total_count_ongoing_change_secret_accounts: 0
      }
    }
  },
  computed: {
    LogItems() {
      return [
        {
          title: this.$t('TaskExecutionCount'),
          body: {
            route: { name: `LoginLogList` },
            count: this.data.total_count_ongoing_change_secret
          }
        },
        {
          title: this.$t('AssetsOfNumber'),
          body: {
            route: { name: `LoginLogList` },
            count: this.data.total_count_ongoing_change_secret_assets
          }
        },
        {
          title: this.$t('AccountAmount'),
          body: {
            route: { name: `OperateLogList` },
            count: this.data.total_count_ongoing_change_secret_accounts
          }
        }
      ]
    }
  },
  watch: {
    days() {
      this.getData()
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    async getData() {
      this.data = await this.$axios.get(
        '/api/v1/accounts/change-secret-dashboard/',
        {
          params: {
            total_count_ongoing_change_secret: 1
          }
        }
      )
    }
  }
}
</script>

<style scoped lang="scss">
.margin-top-10 {
  margin-top: 10px;
}

::v-deep .content .summary-card {
  flex: 1;
  width: 33%;
  max-width: 33%;

  .summary-header {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>
