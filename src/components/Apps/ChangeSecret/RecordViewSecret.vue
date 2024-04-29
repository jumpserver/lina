<template>
  <div>
    <Dialog
      :destroy-on-close="true"
      :show-cancel="false"
      :title="title"
      :visible.sync="showSecret"
      :width="'50'"
      v-bind="$attrs"
      @confirm="accountConfirmHandle"
      v-on="$listeners"
    >
      <el-form :model="secretInfo" class="password-form" label-position="right" label-width="100px">
        <el-form-item :label="$tc('accounts.AccountChangeSecret.OldSecret')">
          <ShowKeyCopyFormatter
            :cell-value="secretInfo.old_secret"
            :col="{ formatterArgs: {
              name: 'old_secret'
            }}"
          />
        </el-form-item>
        <el-form-item :label="$tc('accounts.AccountChangeSecret.NewSecret')">
          <ShowKeyCopyFormatter
            :cell-value="secretInfo.new_secret"
            :col="{ formatterArgs: {
              name: 'new_secret'
            }}"
          />
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { ShowKeyCopyFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'RecordViewSecret',
  components: {
    Dialog,
    ShowKeyCopyFormatter
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: function() {
        return this.$tc('common.ViewSecret')
      }
    }
  },
  data() {
    return {
      secretInfo: {},
      showSecret: false,
      mfaDialogVisible: true
    }
  },
  computed: {
  },
  mounted() {
    this.showSecretDialog()
  },
  methods: {
    accountConfirmHandle() {
      this.showSecret = false
      this.mfaDialogVisible = false
    },
    showSecretDialog() {
      return this.$axios.get(this.url, { disableFlashErrorMsg: true }).then((res) => {
        this.secretInfo = res
        this.showSecret = true
      })
    },
    exit() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss" scoped>
  .item-textarea >>> .el-textarea__inner {
    height: 110px;
  }

  .el-form-item {
    border-bottom: 1px solid #EBEEF5;
    padding: 5px 0;
    margin-bottom: 0;

    &:last-child {
      border-bottom: none;
    }

    >>> .el-form-item__label {
      padding-right: 20px;
      line-height: 30px;
    }

    >>> .el-form-item__content {
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
