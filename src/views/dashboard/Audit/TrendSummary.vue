<template>
  <div class="box">
    <Title :config="config" style="margin-bottom: 16px;" />
    <ColumnChart />
  </div>
</template>

<script>
import Title from '../components/Title.vue'
import ColumnChart from '../components/ColumnChart'
export default {
  components: { Title, ColumnChart },
  props: {
    days: {
      type: [Number, String],
      default: 7
    }
  },
  data() {
    return {
      config: {
        title: '用户登录趋势',
        tip: '用户登录趋势'
      },
      data: {}
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
      this.data = await this.$axios.get(`/api/v1/index/?days=${this.days}
        &total_count_login_users=1`)
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  margin-top: 16px;
  padding: 20px;
  background-color: #fff;
}
</style>
