<template>
  <el-alert
    v-if="enabled && !isViewed()"
    type="success"
    :center="false"
    :title="this.$t('common.Announcement') + ': ' + announcement.subject"
    @close="onClose"
  >
    <span> {{ announcement.content }}</span>
    <span v-if="announcement.link">
      <el-link :href="announcement.link" target="_blank" class="link-more"> 查看更多</el-link> <i class="fa fa-share-square-o" />
    </span>
  </el-alert>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Announcement',
  data() {
    return {
      viewedKey: 'AnnouncementViewed'
    }
  },
  computed: {
    ...mapGetters([
      'publicSettings'
    ]),
    announcement() {
      const ann = this.publicSettings.ANNOUNCEMENT
      return { id: ann['ID'], subject: ann['SUBJECT'], content: ann['CONTENT'], link: ann['LINK'] }
    },
    enabled() {
      return this.publicSettings.ANNOUNCEMENT_ENABLED
    }
  },
  methods: {
    onClose() {
      localStorage.setItem(this.viewedKey, this.announcement.id)
    },
    isViewed() {
      const viewedId = localStorage.getItem(this.viewedKey)
      return viewedId === this.announcement.id
    }
  }
}
</script>

<style scoped>
.link-more {
  font-size: 10px;
  margin-left: 10px;
  border-bottom: solid 1px;
}

</style>
