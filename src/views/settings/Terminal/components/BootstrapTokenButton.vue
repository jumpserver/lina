<template>
  <div>
    <el-button
      size="mini"
      type="primary"
      @click="showToken"
    >
      {{ $t('GetToken') }}
    </el-button>
    <SecretDialog ref="secretDialog" />
  </div>
</template>

<script>
import SecretDialog from '@/components/Dialog/Secret.vue'

export default {
  name: 'BootstrapTokenButton',
  components: {
    SecretDialog
  },
  methods: {
    showToken() {
      this.$axios.get('/api/v1/settings/bootstrap-token/').then(res => {
        this.$refs.secretDialog.show({
          id: 'BOOTSTRAP_TOKEN',
          secret: res.bootstrap_token
        })
      })
    }
  }
}
</script>
