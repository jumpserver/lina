<template>
  <Dialog
    v-if="showColumnSettingPopover"
    v-model:visible="showColumnSettingPopover"
    :cancel-title="$tc('RestoreDefault')"
    :destroy-on-close="true"
    :title="$tc('ListPreference')"
    top="10%"
    width="50%"
    @cancel="restoreDefault()"
    @confirm="handleColumnConfirm()"
  >
    <el-col style="margin-bottom: 5px">
      <label>{{ $t('TableColSetting') }}</label>
    </el-col>
    <el-checkbox
      v-model="checkAll"
      :indeterminate="isIndeterminate"
      style="margin-left: 10px"
      @change="handleCheckAllChange"
    >
      {{ $t('All') }}
    </el-checkbox>
    <el-checkbox-group
      v-model="iCurrentColumns"
      class="column-setting"
      @change="handleCheckedChange"
    >
      <el-row>
        <el-col
          v-for="item in totalColumnsList"
          :key="item.prop"
          :span="8"
          class="col-item"
        >
          <el-checkbox
            :disabled="item.prop==='actions' || minColumns.indexOf(item.prop)!==-1"
            :label="item.prop"
            :title="item.label"
          >
            {{ item.label }}
          </el-checkbox>
        </el-col>
      </el-row>
    </el-checkbox-group>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'ColumnSettingPopover',
  components: {
    Dialog
  },
  props: {
    totalColumnsList: {
      type: Array,
      default: () => []
    },
    currentColumns: {
      type: Array,
      default: () => []
    },
    minColumns: {
      type: Array,
      default: () => []
    },
    defaultColumns: {
      type: Array,
      default: () => []
    },
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      checkAll: false,
      showColumnSettingPopover: false,
      iCurrentColumns: '',
      isIndeterminate: false
    }
  },
  watch: {
    currentColumns: {
      handler(val) {
        this.iCurrentColumns = val
      }
    }
  },
  beforeUnmount() {
    this.$eventBus.$off('showColumnSettingPopover', this.showColumnSettingPopoverHandler)
  },
  mounted() {
    this.$eventBus.$on('showColumnSettingPopover', this.showColumnSettingPopoverHandler)
  },
  methods: {
    showColumnSettingPopoverHandler({ url }) {
      if (url === this.url) {
        this.checkAll = false
        this.showColumnSettingPopover = true
        this.iCurrentColumns = this.currentColumns
      }

      if (this.iCurrentColumns.length === this.totalColumnsList.length) {
        this.checkAll = true
        this.isIndeterminate = false
      } else {
        this.checkAll = false
        this.isIndeterminate = true
      }
    },
    handleColumnConfirm() {
      this.showColumnSettingPopover = false
      this.$emit('columnsUpdate', { columns: this.iCurrentColumns, url: this.url })
    },
    restoreDefault() {
      this.showColumnSettingPopover = false
      this.$emit('columnsUpdate', { columns: null, url: this.url })
    },
    handleCheckAllChange(value) {
      if (value) {
        this.iCurrentColumns = this.totalColumnsList.reduce((prev, item) => {
          return [...prev, (item.prop)]
        }, [])
        this.isIndeterminate = false
      } else {
        this.iCurrentColumns = this.defaultColumns
        this.isIndeterminate = true
      }
    },
    handleCheckedChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.totalColumnsList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.totalColumnsList.length
    }
  }
}
</script>

<style lang='scss' scoped>
.column-setting {
  margin-left: 10px;

  .col-item {
    margin-top: 5px;

    :deep(.el-checkbox) {
      width: 100%;

      .el-checkbox__input {
        line-height: 16px
      }

      .el-checkbox__label {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        width: calc(100% - 20px); // 20px is the width of the checkbox
        line-height: 16px;
        vertical-align: text-top;
      }
    }
  }
}
</style>
