<template>
  <div class="content">
    <el-tooltip
      v-if="!isEdit"
      :content="currentValue"
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

    <span v-if="realValue" class="action">
      <template v-for="(item, index) in iActions">
        <el-tooltip
          v-if="item.has"
          :key="index"
          :content="item.tooltip"
          effect="dark"
          open-delay="500"
          placement="top"
        >
          <i :class="[item.class, item.icon]" class="fa" @click="item.action()" />
        </el-tooltip>
      </template>
    </span>
  </div>
</template>

<script>
import { copy, downloadText } from '@/utils/common'
import BaseFormatter from '@/components/Table/TableFormatters/base.vue'

export default {
  name: 'ShowKeyCopyFormatter',
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
          defaultShow: false
        }
      }
    }
  },
  data() {
    return {
      isEdit: false,
      realValue: this.cellValue,
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs || {}),
      isShow: false
    }
  },
  computed: {
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
  mounted() {
    this.isShow = this.formatterArgs.defaultShow
  },
  methods: {
    onShow() {
      this.isShow = !this.isShow
    },
    onCopy() {
      copy(this.realValue)
    },
    onDownload() {
      downloadText(this.realValue, this.name + '.txt')
    },
    onEdit() {
      this.isEdit = !this.isEdit
      if (this.isEdit) {
        this.$nextTick(() => {
          this.$refs.editInput.focus()
        })
      }
    },
    onEditBlur() {
      this.$emit('input', this.realValue)
    }
  }
}
</script>
<style lang="scss" scoped>
  .content {
    display: flex;
    width: 100%;
    overflow: hidden;
    //white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 13px;

    .text {
      flex: 1;
      margin: 0;
      padding: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .action {
      float: right;
      font-size: 15px;
      cursor: pointer;
      margin-left: 5px;

      .fa {
        margin-right: 10px;

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
