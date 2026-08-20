<template>
  <div class="content">
    <span :class="formatterArgs.actionLeft ? 'left' : 'right'" class="action">
      <template v-for="(item, index) in iActions">
        <el-tooltip
          v-if="item.has"
          :key="index"
          :content="item.tooltip"
          :show-after="500"
          effect="dark"
          placement="top"
        >
          <i
            :class="[item.class, item.icon]"
            class="fa"
            @mousedown.prevent
            @click="item.action()"
          />
        </el-tooltip>
      </template>
    </span>
    <el-tooltip
      v-if="!isEdit"
      :content="vaultUnavailable ? $t('VaultSecretUnavailableTip') : currentValue"
      :disabled="!isShow && !vaultUnavailable"
      :show-after="500"
      placement="top"
    >
      <pre class="text" style="cursor: pointer">{{ currentValue }}</pre>
    </el-tooltip>

    <el-input
      v-else
      ref="editInput"
      v-model="realValue"
      class="text edit-input"
      size="small"
      @blur="onEditBlur"
    />
  </div>
</template>

<script>
import { copy, downloadText } from '@/utils/common/index'
import BaseFormatter from '@/components/Table/TableFormatters/base.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'SecretViewerFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          name: 'key',
          hasShow: true,
          hasDownload: true,
          hasCopy: true,
          hasEdit: true,
          defaultShow: false,
          secretFrom: 'cellValue', // fromCellValue or api,
          actionLeft: false
        }
      }
    }
  },
  data() {
    return {
      isEdit: false,
      realValue: this.cellValue,
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs || {}),
      isShow: false,
      getIt: false,
      vaultUnavailable: false
    }
  },
  computed: {
    ...mapGetters({
      publicSettings: 'publicSettings'
    }),
    hasShow: function () {
      return this.formatterArgs.hasShow
    },
    hasDownload: function () {
      return this.formatterArgs.hasDownload && !this.vaultUnavailable
    },
    hasCopy: function () {
      return this.formatterArgs.hasCopy && !this.vaultUnavailable
    },
    hasEdit: function () {
      return this.formatterArgs.hasEdit && !this.vaultUnavailable
    },
    name: function () {
      return this.formatterArgs.name
    },
    iActions() {
      const actions = [
        {
          has: this.hasEdit && this.formatterArgs?.secretType === 'password',
          class: this.isEdit ? 'fa-check' : 'fa-pencil',
          action: this.onEdit,
          tooltip: this.$t('Edit')
        },
        {
          has: this.hasShow,
          class: this.isShow ? 'fa-eye-slash' : 'fa-eye',
          action: () => {
            this.onShow()
          },
          tooltip: this.$t('View')
        },
        {
          has: this.hasDownload,
          icon: 'fa-download',
          action: this.onDownload,
          tooltip: this.$t('Download')
        },
        {
          has: this.hasCopy,
          icon: 'fa-clone',
          action: this.onCopy,
          tooltip: this.$t('Copy')
        }
      ]
      if (this.formatterArgs.actionLeft) {
        actions.reverse()
      }
      return actions
    },
    currentValue() {
      if (this.vaultUnavailable) {
        return this.$t('VaultSecretUnavailable')
      }
      if (this.isShow) {
        return this.realValue || '-'
      } else {
        return this.realValue ? '******' : '-'
      }
    }
  },
  watch: {
    cellValue: {
      handler: function (val) {
        this.realValue = val
      },
      immediate: true
    }
  },
  mounted() {
    this.isShow = this.formatterArgs.defaultShow
    if (this.formatterArgs.secretFrom !== 'cellValue') {
      this.realValue = '--'
    }
  },
  methods: {
    async getAccountSecret() {
      if (this.publicSettings.SECURITY_DISABLE_VIEW_SECRET) {
        this.$message.warning(this.$tc('AccountSecretReadDisabled'))
        return false
      }
      if (this.formatterArgs.secretFrom === 'cellValue' || this.getIt) {
        return true
      }
      try {
        const res = await this.$axios.get(`/api/v1/accounts/account-secrets/${this.row.id}/`)
        this.realValue = res.secret
        this.getIt = true
        this.vaultUnavailable = false
        return true
      } catch (error) {
        if (error?.response?.data?.code === 'vault_unavailable') {
          this.vaultUnavailable = true
          return false
        }
        throw error
      }
    },
    async onShow() {
      if (!(await this.getAccountSecret())) return
      this.isShow = !this.isShow
      setTimeout(() => {
        this.isShow = false
      }, 10000)
    },
    async onCopy() {
      if (!(await this.getAccountSecret())) return
      copy(this.realValue)
    },
    async onDownload() {
      if (!(await this.getAccountSecret())) return
      downloadText(this.realValue, this.name + '.txt')
    },
    async onEdit() {
      // 编辑态下点击(对号)即确认退出；非编辑态点击(铅笔)进入编辑。
      // 不再用 this.isEdit = !this.isEdit,避免 action 图标的 click 与 input blur
      // 竞态导致的重复取反(点对号又被翻回编辑态)。
      if (this.isEdit) {
        this.confirmEdit()
        return
      }
      if (!(await this.getAccountSecret())) return
      this.isEdit = true
      this.$nextTick(() => {
        this.$refs.editInput?.focus()
      })
    },
    confirmEdit() {
      this.isEdit = false
      this.$emit('input', this.realValue)
    },
    onEditBlur() {
      // action 图标已 @mousedown.prevent,点它们不会触发 blur;
      // 这里只处理点击输入框外部的失焦(同样视为确认)。
      if (this.isEdit) {
        this.confirmEdit()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.content {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  //white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 13px;

  .text {
    flex: 1;
    display: inline;
    margin: 0;
    padding: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .action {
    font-size: 13px;
    cursor: pointer;
    margin-left: 1px;
    display: inline;

    &.right {
      float: right;
    }

    .fa {
      margin-right: 5px;

      &:hover {
        color: var(--color-primary);
      }
    }
  }
}

.edit-input :deep(input) {
  border-left: none;
  border-right: none;
  border-top: none;
  height: 30px;
}
</style>
