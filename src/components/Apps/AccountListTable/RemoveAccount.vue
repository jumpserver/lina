<template>
  <Dialog
    v-bind="$attrs"
    v-model:visible="show"
    :destroy-on-close="true"
    :show-cancel="false"
    width="720px"
    @confirm="accountConfirmHandle"
  />
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { openTaskPage } from '@/utils/jms/index'

export default {
  name: 'RemoveAccount',
  components: {
    Dialog
  },
  props: {
    accounts: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: false
    }
  },
  mounted() {
    const url = `/api/v1/accounts/accounts/tasks/`
    this.$axios.post(url, { disableFlashErrorMsg: true, action: 'remove' }).then(() => {
      this.$axios
        .post(`/api/v1/accounts/accounts/tasks/`, {
          action: 'remove',
          gather_accounts: this.accounts.map((account) => account.id)
        })
        .then((res) => {
          openTaskPage(res['task'])
        })
    })
  },
  methods: {
    accountConfirmHandle() {
      this.show = false
    },
    exit() {
      this.$emit('update:visible', false)
    }
  }
}
</script>
