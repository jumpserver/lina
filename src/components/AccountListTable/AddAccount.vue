<template>
  <Dialog
    :title="this.$tc('assets.AddAccount')"
    :visible.sync="iVisible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :close-on-click-modal="false"
    width="70%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <AccountCreateUpdateForm
      v-if="!loading"
      :platform="platform"
      :protocols="protocols"
      :account="account"
      @add="addAccount"
      @edit="editAccount"
    />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import AccountCreateUpdateForm from '@/components/AccountCreateUpdateForm'
export default {
  name: 'CreateAccountDialog',
  components: {
    Dialog,
    AccountCreateUpdateForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    asset: {
      type: Object,
      default: () => ({})
    },
    account: {
      type: Object,
      default: () => ({
        name: '',
        username: '',
        secret: ''
      })
    }
  },
  data() {
    return {
      loading: true,
      platform: {}
    }
  },

  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    protocols() {
      return this.asset ? this.asset.protocol : []
    }
  },
  async mounted() {
    try {
      await this.getPlatform()
    } finally {
      this.loading = false
    }
  },
  methods: {
    async getPlatform() {
      this.platform = await this.$axios.get(`/api/v1/assets/platforms/${this.asset.platform.id}/`)
      console.log('Platform: ', this.platform)
    },
    addAccount(form) {
      const data = { asset: this.asset.id, ...form }
      this.$axios.post(`/api/v1/assets/accounts/`, data)
        .then(() => {
          this.iVisible = false
          this.$emit('add', true)
        })
        .catch(() => {
          this.$message.error(this.$tc('common.createErrorMsg'))
        })
    },
    editAccount(form) {
      const data = { ...form }
      this.$axios.patch(`/api/v1/assets/accounts/${this.account.id}/`, data).then(() => {
        this.iVisible = false
        this.$emit('add', true)
        this.$message.success(this.$t('common.updateSuccessMsg'))
      })
    }
  }
}
</script>

<style scoped>

</style>
