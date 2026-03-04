<template>
  <div>
    <el-dialog
      v-if="enabled && showModal"
      :visible.sync="dialogVisible"
      :title="title"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="35%"
      class="announcement-dialog"
      center
    >
      <div class="announcement-content">
        <div class="content-wrapper">
          <MarkDown :value="announcement.content" class="markdown" />
        </div>
        <div v-if="announcement.link" class="link-section">
          <el-link :href="announcement.link" class="link-more" target="_blank" type="info">
            {{ $t('ViewMore') }}
          </el-link>
          <i class="fa fa-external-link icon" />
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onModalConfirm">
          {{ $t('Confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <el-alert
      v-if="enabled && showAlert"
      :center="false"
      :title="title"
      class="announcement"
      type="info"
      @close="onAlertClose"
    >
      <MarkDown :value="announcement.content" class="markdown" />
      <span v-if="announcement.link">
        <el-link :href="announcement.link" class="link-more" target="_blank" type="info">
          {{ $t('ViewMore') }}
        </el-link>
        <i class="fa fa-external-link icon" />
      </span>
    </el-alert>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MarkDown from '@/components/Widgets/MarkDown'

export default {
  name: 'Announcement',
  components: { MarkDown },
  data() {
    return {
      viewedKey: 'AnnouncementViewed',
      modalConfirmedKey: 'AnnouncementModalConfirmed',
      dialogVisible: false,
      modalConfirmed: false,
      alertViewed: false
    }
  },
  computed: {
    ...mapGetters([
      'publicSettings'
    ]),
    announcement() {
      const ann = this.publicSettings.ANNOUNCEMENT
      return {
        id: ann['ID'],
        subject: ann['SUBJECT'],
        content: ann['CONTENT'],
        link: ann['LINK'],
        date_start: ann['DATE_START'],
        date_end: ann['DATE_END']
      }
    },
    enabled() {
      return this.publicSettings.ANNOUNCEMENT_ENABLED && (this.announcement.content || this.announcement.subject) && this.isDateValid
    },
    title() {
      return this.$t('Announcement') + ': ' + this.announcement.subject
    },
    isDateValid() {
      if (this.announcement.date_start === undefined || this.announcement.date_end === undefined) {
        return true
      }
      const now = new Date()
      const start = new Date(this.announcement.date_start)
      const end = new Date(this.announcement.date_end)
      return now >= start && now <= end
    },
    showModal() {
      return !this.modalConfirmed
    },
    showAlert() {
      return this.modalConfirmed && !this.alertViewed
    }
  },
  watch: {
    enabled: {
      handler(val) {
        if (val) {
          this.initializeState()
          this.checkAndShowDialog()
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.initializeState()
    this.checkAndShowDialog()
  },
  methods: {
    initializeState() {
      this.modalConfirmed = this.isModalConfirmed()
      this.alertViewed = this.isAlertViewed()
    },
    checkAndShowDialog() {
      if (this.enabled && this.showModal) {
        this.dialogVisible = true
      }
    },
    onModalConfirm() {
      localStorage.setItem(this.modalConfirmedKey, this.announcement.id)
      this.modalConfirmed = true
      this.dialogVisible = false

      this.$emit('announcement-modal-confirmed', {
        id: this.announcement.id,
        subject: this.announcement.subject,
        confirmedAt: new Date().toISOString()
      })
    },
    onAlertClose() {
      localStorage.setItem(this.viewedKey, this.announcement.id)
      this.alertViewed = true

      this.$emit('announcement-read', {
        id: this.announcement.id,
        subject: this.announcement.subject,
        readAt: new Date().toISOString()
      })
    },
    isModalConfirmed() {
      const confirmedId = localStorage.getItem(this.modalConfirmedKey)
      return confirmedId === this.announcement.id
    },
    isAlertViewed() {
      const viewedId = localStorage.getItem(this.viewedKey)
      return viewedId === this.announcement.id
    },
    isViewed() {
      return this.isAlertViewed()
    }
  }
}
</script>

<style lang="scss" scoped>
.announcement-dialog ::v-deep .el-dialog {
  border-radius: 5px;
}

.announcement-dialog ::v-deep .el-dialog__wrapper {
  backdrop-filter: blur(4px);
}

@media (max-width: 768px) {
  .announcement-dialog ::v-deep .el-dialog {
    width: 95% !important;
    margin: 0 auto;
  }

  .announcement-content {
    padding: 20px 25px 15px;

    .content-wrapper {
      padding: 15px;
    }
  }

  .dialog-footer {
    .el-button {
      padding: 10px;
      font-size: 14px;
    }
  }
}

.announcement-dialog ::v-deep .el-dialog__header {
  border-radius: 8px 8px 0 0;
  padding: 10px 20px 10px 20px;

  .el-dialog__title {
    color: black;
    font-weight: 600;
  }
}

.announcement-dialog ::v-deep .el-dialog__body {
  padding: 0;
}

.announcement-content {
  padding: 25px 30px 20px;

  .link-section {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #e4e7ed;
    text-align: center;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;

  .el-button {
    padding: 10px 20px;
    font-size: 14px;
  }
}

.announcement ::v-deep .el-alert__content {
  width: 100%;
}

.icon {
  vertical-align: text-bottom;
  color: var(--color-info) !important;
  margin-left: 5px;
}

.markdown {
  background-color: transparent !important;
  font-size: 14px;
  line-height: 1.8;
  color: #2c3e50;

  .link-more {
    font-size: 13px;
    color: #409eff !important;
    text-decoration: none;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(64, 158, 255, 0.1);
    transition: all 0.3s;

    &:hover {
      background: #409eff;
      color: white !important;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 15px 0;
    color: #303133;
    font-weight: 600;
    line-height: 1.4;
  }

  h1 {
    font-size: 20px;
  }

  h2 {
    font-size: 18px;
  }

  h3 {
    font-size: 16px;
  }

  h4, h5, h6 {
    font-size: 14px;
  }

  p {
    margin-bottom: 16px;
    line-height: 1.8;
    color: #4b5563;
  }
}
</style>
