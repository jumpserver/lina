<template>
  <div>
    <DataTable :config="tableConfig" class="attr-list" />
    <AttrDialog
      v-if="attrVisible"
      :visible.sync="attrVisible"
    />
    <el-button type="primary" size="mini" @click="handleCreate">新建</el-button>
  </div>
</template>

<script>
import DataTable from '@/components/DataTable/index.vue'
import AttrDialog from './AttrDialog.vue'

export default {
  name: 'SyncInstanceTaskStrategy',
  components: { DataTable, AttrDialog },
  props: {},
  data() {
    return {
      attrVisible: false,
      tableConfig: {
        columns: [
          { prop: 'rules', label: this.$t('条件名称') },
          { prop: 'actions', label: this.$t('动作名称') },
          { prop: 'action', label: this.$t('common.Action'), align: 'center', width: '100px', formatter: (row, col, cellValue, index) => {
            return (
              <div className='input-button'>
                <el-button
                  icon='el-icon-minus'
                  size='mini'
                  style={{ 'flexShrink': 0 }}
                  type='danger'
                  onClick={this.handleAttrDelete({ row, col, cellValue, index })}
                />
              </div>
            )
          } }
        ],
        totalData: this.value?.attrs || [],
        hasPagination: false
      }
    }
  },
  computed: {},
  watch: {},
  mounted() {
    this.$emit('input', this.value)
  },
  methods: {
    handleCreate() {
      this.attrVisible = true
    },
    onAttrDialogConfirm(form) {
      this.$emit('confirm', form)
    },
    handleAttrDelete({ index }) {
      return () => {
        this.tableConfig.totalData.splice(index, 1)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.attr-list {
  width: 99%;
}
.attr-form {
  >>> .el-select {
    width: 100%;
  }
  >>> .el-form-item__content {
    width: 100%;
  }
  >>> .form-buttons {
    margin: auto;
  }
}
</style>
