<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="title">
      <span>{{ $t('common.Announcement') }}</span>
    </div>
    <ul class="content">
      <li v-if="announcement.content" class="item">
        <span class="item-title">【{{ announcement.subject }}】</span>
        <span>{{ announcement.content }}</span>
      </li>
      <li v-else class="other">{{ $t('common.noAnnouncement') }}</li>
    </ul>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Announcement',
  data() {
    return {
      content: ''
    }
  },
  computed: {
    ...mapGetters([
      'publicSettings'
    ]),
    announcement() {
      const ann = this.publicSettings?.ANNOUNCEMENT || {}
      return {
        id: ann?.ID,
        subject: ann?.SUBJECT || '',
        content: ann?.CONTENT || '',
        link: ann?.LINK
      }
    }
  }
}
</script>

<style lang="scss" scoped>
ul,li {
  padding: 0;
  margin: 0;
  list-style: none
}
.box-card {
  margin-bottom: 20px;
}
.title {
  font-weight: 500;
}
.content {
  width: 100%;
  .item {
    margin-bottom: 16px;
    cursor: pointer;
    vertical-align: middle;
    .item-title {
      display: inline-block;
      color: #8b9db6;
      text-align: center;
      font-size: 15px;
      vertical-align: middle;
    }
  }
  .other {
    text-align: center;
  }
}
</style>
