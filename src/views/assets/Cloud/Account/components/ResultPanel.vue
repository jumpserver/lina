<template>
  <div>
    <el-table
      size="medium"
      :data="tableData"
      :show-header="false"
    >
      <el-table-column
        width="120"
        prop="key"
      />
      <el-table-column
        prop="value"
      >
        <template v-slot="scope">
          <el-link :underline="false" type="primary"> {{ scope.row.value }}</el-link>
        </template>
      </el-table-column>
    </el-table>
    <div style="float: right; margin: 10px">
      <el-button type="primary" size="small" @click="handleClick">{{ $t('CloudAccountDetail') }}</el-button>
      <el-button size="small" @click="handleClose">{{ $t('Close') }}</el-button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ResultPanel',
  components: {
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tableData: [
        { key: this.$t('Name'), value: this.object.name },
        { key: this.$t('Platform'), value: this.object.provider.value },
        { key: this.$t('Region'), value: this.object.task.regions.length },
        {
          key: this.$t('Strategy'),
          value: this.object.task.strategy.map((s) => s['name']).join(', ') || this.$t('Empty')
        },
        {
          key: this.$t('IpType'),
          value: this.object.task.sync_ip_type === 1 ? this.$t('PublicIp') : this.$t('PrivateIp')
        },
        { key: this.$t('Timer'), value: this.object.task.is_periodic ? this.$t('Yes') : this.$t('No') }
      ]
    }
  },
  methods: {
    handleClick() {
      this.$router.push({ name: 'CloudAccountDetail', params: { id: this.object.id }})
    },
    handleClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang='scss' scoped>
::v-deep .el-alert__content {
  width: 100%;
}
::v-deep .el-divider__text {
  background-color: transparent;
  font-size: 18px;
  font-weight: 400;
  left: 0;
  padding: 0;
}
.el-card.active {
  color: var(--color-primary);
  border: 1px solid;
}
.value {
  color: var(--color-primary);
  font-weight: bold;
}
</style>
