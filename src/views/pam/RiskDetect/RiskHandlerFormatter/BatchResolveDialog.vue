<template>
  <Dialog :title="$tc('ResolveSelected')" :visible.sync="iVisible">
    <div v-if="iVisible">
      <el-form class="el-form">
        <el-form-item class="risk-select" prop="selected">
          <el-select v-model="riskSelected" :placeholder="$t('Select risk')">
            <el-option
              v-for="item in riskTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <HandleDropdown :cell-value="fakeCell" :changed="changed" :row="fakeRow" :value="1" class="risk-handler" />
      </el-form>
      <DataTable :config="tableConfig" />
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import DataTable from '@/components/Table/DataTable/index.vue'
import HandleDropdown from './index.vue'

export default {
  name: 'BatchResolveDialog',
  components: { DataTable, Dialog, HandleDropdown },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    risks: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      changed: false,
      riskSelected: '',
      fakeRow: {
        id: '',
        risk: {
        }
      },
      fakeCell: {
        value: '0',
        label: this.$t('Pending')
      },
      tableConfig: {
        totalData: [],
        columns: [
          {
            prop: 'asset',
            label: this.$t('Asset'),
            formatter: (row) => row.asset.name
          },
          {
            prop: 'username',
            label: this.$t('Username')
          },
          {
            prop: 'risk',
            label: this.$t('Risk'),
            formatter: (row) => row.risk.label
          }
        ]
      }
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
    riskTypes() {
      const types = {}
      for (const item of this.unConfirmedRisks) {
        if (!types[item.risk.value]) {
          types[item.risk.value] = item.risk.label
        }
      }
      return Object.keys(types).map(key => ({ value: key, label: types[key] }))
    },
    unConfirmedRisks() {
      return this.risks.filter(item => item.status.value === '0')
    }
  },
  watch: {
    riskSelected(val) {
      console.log('Risk: ', this.unConfirmedRisks)
      if (val) {
        this.tableConfig.totalData = this.unConfirmedRisks.filter(item => item.risk.value === this.riskSelected)
      } else {
        this.tableConfig.totalData = this.unConfirmedRisks.filter(item => item.status.value === '0')
      }
      this.fakeRow.risk = {
        value: this.riskSelected
      }
      this.changed = true
      setTimeout(() => {
        this.changed = false
      }, 100)
    }
  },
  mounted() {
    this.tableConfig.totalData = this.unConfirmedRisks
  }
}
</script>

<style lang="scss" scoped>

.el-form {
  ::v-deep .el-form-item {
    margin-bottom: 5px;
  }

  .risk-select {
    display: inline-block;

    ::v-deep .el-form-item__content {
      width: 100%;
    }
  }

  .risk-handler {
    margin-left: 10px;

    ::v-deep button {
      padding: 8px;
    }
  }

}

</style>
