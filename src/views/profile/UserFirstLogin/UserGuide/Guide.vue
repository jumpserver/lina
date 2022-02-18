<template>
  <IBox>
    <div>
      <span>{{ describe }}</span>
      <el-link type="success" :href="guide.url">{{ guide.label }}</el-link>
    </div>
  </IBox>
</template>

<script>
import { IBox } from '@/components'

export default {
  components: {
    IBox
  },
  props: {
  },
  data() {
    return {
      describe: this.$t('users.DescribeOfGuide'),
      guide: {
        url: '',
        label: this.$t('users.Guide')
      }
    }
  },
  async mounted() {
    const data = await this.getObject()
    this.guide.url = data.guide_url
  },
  methods: {
    getObject() {
      const url = `/api/v1/users/profile/`
      return this.$axios.get(url)
    }
  }
}
</script>

<style scoped>

</style>
