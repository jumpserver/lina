<template>
  <CentralForm
    v-if="loading"
    :config="config"
  />
</template>

<script>
import { getErrorResponseMsg } from '@/utils/common'
import { CentralForm } from '@/components'
import Message from './Message'

export default {
  name: 'FlashMessage',
  components: {
    CentralForm
  },
  data() {
    return {
      loading: false,
      config: {
        title: '',
        submitButton: false,
        extraMenu: Message,
        extraMenuConfig: {}
      }
    }
  },
  created() {
    this.getMessageInfo()
  },
  methods: {
    async getMessageInfo() {
      try {
        const code = this.$route.params.code
        const data = await this.$axios.get(`/api/v1/common/flash-message/?code=${code}`)
        this.config.title = data.title
        this.config.extraMenuConfig = data
      } catch (error) {
        this.config.title = this.$t('common.Failed')
        this.config.extraMenuConfig = { error: getErrorResponseMsg(error), 'redirect_url': '/' }
      } finally {
        this.loading = true
      }
    }
  }
}
</script>

<style scoped>

</style>
