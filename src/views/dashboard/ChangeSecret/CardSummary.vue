<template>
  <div>
    <el-row :gutter="16">
      <el-col :lg="12" :md="24" class="margin-top-10 card-left">
        <SummaryCountCard :config="logConfig" :items="LogItems" />
      </el-col>
      <el-col :lg="12" :md="24" class="margin-top-10 card-right">
        <SummaryCountCard :config="sessionConfig" :items="sessionItems" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import SummaryCountCard from '../components/SummaryCountCard.vue'

export default {
  name: 'CardSummary',
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
        title: this.$t('CurrentStatus'),
        tip: this.$t('CurrentStatus')
      },
      sessionConfig: {
        title: this.$t('ChangeSecretTaskStatus'),
        tip: this.$t('ChangeSecretTaskStatus')
      },
      data: {
        total_count_change_secrets: 0,
        total_count_periodic_change_secrets: 0,
        total_count_change_secret_assets: 0,
        total_count_change_secret_executions: 0,
        total_count_success_change_secret_executions: 0,
        total_count_failed_change_secret_executions: 0
      }
    }
  },
  computed: {
    LogItems() {
      return [
        {
          title: this.$t('TaskCount'),
          body: {
            count: this.data.total_count_change_secrets
          }
        },
        {
          title: this.$t('ScheduledTaskCount'),
          body: {
            count: this.data.total_count_periodic_change_secrets
          }
        },
        {
          title: this.$t('AssetsOfNumber'),
          body: {
            count: this.data.total_count_change_secret_assets
          }
        }
      ]
    },
    sessionItems() {
      return [
        {
          title: this.$t('TaskExecutionCount'),
          body: {
            count: this.data.total_count_change_secret_executions
          }
        },
        {
          title: this.$t('SuccessCount'),
          body: {
            count: this.data.total_count_success_change_secret_executions
          }
        },
        {
          title: this.$t('FailCount'),
          body: {
            count: this.data.total_count_failed_change_secret_executions
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
            days: this.days,
            total_count_change_secrets: 1,
            total_count_periodic_change_secrets: 1,
            total_count_change_secret_assets: 1,
            total_count_change_secret_status: 1
          }
        }
      )
    }
  }
}
</script>

<style scoped>
.margin-top-10 {
  margin-top: 10px;
}
</style>
