<template>
  <div>
    <el-row :gutter="16">
      <el-col :md="24" :sm="24" class="margin-top-10">
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
        title: this.$t('RunningSummary')
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
          title: this.$t('Total'),
          body: {
            count: this.data.total_count_ongoing_change_secret
          }
        },
        {
          title: this.$t('Assets'),
          body: {
            count: this.data.total_count_ongoing_change_secret_assets
          }
        },
        {
          title: this.$t('Accounts'),
          body: {
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

<style lang="scss" scoped>
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
