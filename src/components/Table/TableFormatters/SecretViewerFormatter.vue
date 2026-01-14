<template>
  <div class="content">
    <span :class="formatterArgs.actionLeft ? 'left' : 'right'" class="action">
      <template v-for="(item, index) in iActions">
        <el-tooltip
          v-if="item.has"
          :key="index"
          :content="item.tooltip"
          :open-delay="500"
          effect="dark"
          placement="top"
        >
          <i :class="[item.class, item.icon]" class="fa" @click="item.action()" />
        </el-tooltip>
      </template>
    </span>
    <el-tooltip
      v-if="!isEdit"
      :content="currentValue"
      :disabled="!isShow"
      :open-delay="500"
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
      getIt: false
    }
  },
  computed: {
    ...mapGetters({
      publicSettings: 'publicSettings'
    }),
    hasShow: function() {
      return this.formatterArgs.hasShow
    },
    hasDownload: function() {
      return this.formatterArgs.hasDownload
    },
    hasCopy: function() {
      return this.formatterArgs.hasCopy
    },
    hasEdit: function() {
      return this.formatterArgs.hasEdit
    },
    name: function() {
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
          action: this.onShow,
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
      if (this.isShow) {
        return this.realValue || '-'
      } else {
        return this.realValue ? '******' : '-'
      }
    }
  },
  watch: {
    cellValue: {
      handler: function(val) {
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
      if (!this.publicSettings.SECURITY_ACCOUNT_SECRET_READ) {
        this.$message.warning(this.$tc('AccountSecretReadDisabled'))
        return
      }
      if (this.formatterArgs.secretFrom === 'cellValue' || this.getIt) {
        return
      }
      const res = await this.$axios.get(`/api/v1/accounts/account-secrets/${this.row.id}/`)
      this.realValue = res.secret
    },
    async onShow() {
      await this.getAccountSecret()
      this.isShow = !this.isShow
      setTimeout(() => {
        this.isShow = false
      }, 10000)
    },
    async onCopy() {
      await this.getAccountSecret()
      copy(this.realValue)
    },
    async onDownload() {
      await this.getAccountSecret()
      downloadText(this.realValue, this.name + '.txt')
    },
    async onEdit() {
      await this.getAccountSecret()
      this.isEdit = !this.isEdit
      if (this.isEdit) {
        this.$nextTick(() => {
          this.$refs.editInput.focus()
        })
      }
    },
    onEditBlur() {
      this.isEdit = false
      this.$emit('input', this.realValue)
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

.edit-input ::v-deep input {
  border-left: none;
  border-right: none;
  border-top: none;
  height: 30px;
}
</style>
