<template>
  <el-alert
    v-if="enabled && !isViewed()"
    :center="false"
    :title="title"
    class="announcement"
    type="success"
    @close="onClose"
  >
    <MarkDown :value="announcement.content" class="markdown" />
    <span v-if="announcement.link">
      <el-link :href="announcement.link" class="link-more" target="_blank" type="info">
        {{ $t('ViewMore') }}
      </el-link>
      <i class="fa fa-external-link icon" />
    </span>
  </el-alert>
</template>

<script>
import { mapGetters } from 'vuex'
import MarkDown from '@/components/Widgets/MarkDown'

export default {
  name: 'Announcement',
  components: { MarkDown },
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
      return this.$t('Announcement') + ': ' + this.announcement.subject
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

<style lang="scss" scoped>
.announcement >>> .el-alert__content {
  width: 100%;
}

.announcement-main {
  word-wrap: break-word;
  white-space: pre-wrap;
}

.icon {
  vertical-align: text-bottom;
  color: var(--color-info) !important;
}

.markdown {
  background-color: transparent !important;

  .link-more {
    font-size: 10px;
    margin-left: 10px;
    border-bottom: solid 1px;
    color: var(--color-info) !important;
  }

  h1, h2, h3, h4, h5 {
    margin-top: 0;
    margin-bottom: 10px;
  }
}
</style>
