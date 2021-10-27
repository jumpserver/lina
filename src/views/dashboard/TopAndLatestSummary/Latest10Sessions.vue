<template>
  <HeadingIBox :title="title">
    <div v-if="dates_login_record_top10_sessions.length > 0" class="feed-activity-list">
      <div v-for="(item, index ) of dates_login_record_top10_sessions" :key="item.user + index" class="feed-element">
        <a href="#" class="pull-left">
          <img alt="image" class="img-circle" :src="avatarUrl">
        </a>
        <div class="media-body ">
          <small class="pull-right">{{ item.timesince }}</small>
          <strong>{{ item.user }}</strong>
          {{ $t('dashboard.LoginTo') }} {{ item.asset }} <br>
          <small class="text-muted">{{ $d(new Date(item.date_start), 'medium') }}</small> <br>
        </div>
      </div>
    </div>
    <span v-else>{{ $t('common.NoData') }}</span>
  </HeadingIBox>
</template>
<script>
import HeadingIBox from '@/components/IBox/HeadingIBox'

export default {
  name: 'Latest10Sessions',
  components: { HeadingIBox },
  data() {
    return {
      title: this.$t('dashboard.LatestSessions10'),
      avatarUrl: require('@/assets/img/admin.png'),
      dates_login_record_top10_sessions: []
    }
  },
  mounted() {
    this.getLatest10Sessions()
  },
  methods: {
    async getLatest10Sessions() {
      const data = await this.$axios.get('/api/v1/index/?dates_login_record_top10_sessions=1')
      this.dates_login_record_top10_sessions = data.dates_login_record_top10_sessions
    }
  }
}
</script>

<style scoped>
  .feed-element, .feed-element .media {
    margin-top: 15px;
  }

  .feed-activity-list .feed-element {
    border-bottom: 1px solid #e7eaec;
  }

  .feed-element {
    padding-bottom: 15px;
  }

  .feed-element > .pull-left {
    margin-right: 10px;
  }

  .feed-element img.img-circle, .dropdown-messages-box img.img-circle {
    width: 38px;
    height: 38px;
  }

  .img-circle {
    border-radius: 50%;
  }
  .text-muted {
    color: #888888;
    padding-top: 5px;
  }
</style>
