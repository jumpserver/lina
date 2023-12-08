<template>
  <Dialog
    :destroy-on-close="true"
    :show-cancel="false"
    :visible.sync="show"
    :width="'50'"
    v-bind="$attrs"
    @confirm="accountConfirmHandle"
    v-on="$listeners"
  />
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { openTaskPage } from '@/utils/jms'

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
      show: false,
      mfaDialogVisible: true
    }
  },
  computed: {},
  mounted() {
    const url = `/api/v1/accounts/accounts/tasks/`
    this.$axios.post(
      url, { disableFlashErrorMsg: true, action: 'remove' }
    ).then(resp => {
      this.$axios.post(
        `/api/v1/accounts/accounts/tasks/`,
        {
          action: 'remove',
          gather_accounts: this.accounts.map(account => account.id)
        }
      ).then(res => {
        openTaskPage(res['task'])
      })
    })
  },
  methods: {
    accountConfirmHandle() {
      this.show = false
      this.mfaDialogVisible = false
    },
    exit() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.item-textarea > > > .el-textarea__inner {
  height: 110px;
}

.el-form-item {
  border-bottom: 1px solid #EBEEF5;
  padding: 5px 0;
  margin-bottom: 0;

  &:last-child {
    border-bottom: none;
  }

  > > > .el-form-item__label {
    padding-right: 20px;
    line-height: 30px;
  }

  > > > .el-form-item__content {
    line-height: 30px;

    pre {
      margin: 0;
    }
  }
}

ul {
  margin: 0;
}

li {
  display: block;
  font-size: 13px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .title {
    color: #303133;
    font-weight: 500;
  }
}
</style>
