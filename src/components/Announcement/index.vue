<template>
  <el-alert
    v-if="!isViewed()"
    type="success"
    :center="false"
    :title="this.$t('common.Announcement') + ': ' + announcement.subject"
    @close="onClose"
  >
    <span> {{ announcement.content }}</span>
    <span v-if="announcement.link">
      <el-link :href="announcement.link" class="link-more"> 查看更多</el-link> <i class="fa fa-share-square-o" />
    </span>
  </el-alert>
</template>

<script>
export default {
  name: 'Announcement',
  data() {
    return {
      viewedKey: 'AnnouncementViewed',
      announcement: {
        id: 'abcd',
        subject: '伟大的中国共产党万岁, 伟大中华民族万岁，伟大的中国人民万岁',
        content: '人民民日报刊发“宣言”文章：我们为什么能够成功，1840年鸦片战争以后，国家蒙辱、人民蒙难、文明蒙尘，\n' +
          '      中华民族遭受了前所未有的劫难。从此，实现中华民族伟大复兴就成为中国人民和中华民族最伟大的梦想，成为近代以来中国全部历史的主题。\n' +
          '      为了实现民族复兴的梦想，中国人民奋起抗争，各种力量前仆后继，各种方案轮番试验.',
        link: 'https://www.qq.com'
      }
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

</style>
