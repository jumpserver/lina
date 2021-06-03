<template>
  <DetailCard :items="message" :title="subject" />
</template>

<script>
import DetailCard from '@/components/DetailCard'

export default {
  components: {
    DetailCard
  },
  data() {
    return {
      subject: '',
      message: []
    }
  },
  computed: {},
  mounted() {
    this.$axios.get(`/api/v1/notifications/site-message/${this.$route.params.id}`).then(res => {
      this.subject = res.subject
      this.message = [
        {
          key: this.$t('notifications.Sender'),
          value: res.sender
        },
        {
          key: this.$t('notifications.DeliveryTime'),
          value: res.date_created
        },
        {
          key: this.$t('notifications.Message'),
          value: res.message
        }
      ]
      this.mark_as_read([res.id])
    }).catch(err => {
      console.error(err)
    })
  },
  methods: {
    mark_as_read: function(msgIds) {
      this.$axios.patch('/api/v1/notifications/site-message/mark_as_read/', { ids: msgIds }).catch(err => {
        console.error(err)
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
