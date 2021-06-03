<template>
  <Dialog
    v-if="showColumnSettingPopover"
    :title="$t('common.CustomCol')"
    :visible.sync="showColumnSettingPopover"
    :destroy-on-close="true"
    :show-cancel="false"
    width="35%"
    top="10%"
    @confirm="handleColumnConfirm()"
  >
    <el-alert type="success">
      {{ this.$t('common.TableColSettingInfo') }}
    </el-alert>
    <el-checkbox-group
      v-model="iCurrentColumns"
    >
      <el-row>
        <el-col
          v-for="item in totalColumnsList"
          :key="item.prop"
          :span="8"
          style="margin-top:5px;"
        >
          <el-checkbox
            :label="item.prop"
            :disabled="
              item.prop==='id' ||
                item.prop==='actions' ||
                minColumns.indexOf(item.prop)!==-1
            "
          >
            {{ item.label }}
          </el-checkbox>
        </el-col>
      </el-row>

    </el-checkbox-group>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index'
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
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showColumnSettingPopover: false,
      iCurrentColumns: ''
    }
  },
  mounted() {
    this.$eventBus.$on('showColumnSettingPopover', ({ url }) => {
      if (url === this.url) {
        this.showColumnSettingPopover = true
        this.iCurrentColumns = this.currentColumns
      }
    })
  },
  methods: {
    handleColumnConfirm() {
      this.showColumnSettingPopover = false
      this.$emit('columnsUpdate', { columns: this.iCurrentColumns, url: this.url })
    }
  }
}
</script>

<style lang='less' scoped>
</style>
