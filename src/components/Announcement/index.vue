<template>
  <el-alert
    v-if="enabled && !isViewed()"
    class="announcement"
    type="success"
    :center="false"
    :title="title"
    @close="onClose"
  >
    <span class="announcement-main">{{ announcement.content }}</span>
    <span v-if="announcement.link">
      <el-link :href="announcement.link" target="_blank" class="link-more">
        {{ $t('common.ViewMore') }}
      </el-link>
      <i class="fa fa-share-square-o" />
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
      return this.publicSettings.ANNOUNCEMENT_ENABLED && (this.announcement.content || this.announcement.subject)
    },
    title() {
      return this.$t('common.Announcement') + ': ' + this.announcement.subject
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
.announcement >>> .el-alert__content {
  width: 100%;
}
.announcement-main {
  word-wrap:break-word;
  white-space: pre-wrap;
}
.link-more {
  font-size: 10px;
  margin-left: 10px;
  border-bottom: solid 1px;
}

</style>
