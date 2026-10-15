<template>
  <Dialog
    :visible="true"
    :title="$t('AddAssetByCIDR')"
    width="900px"
    :close-on-click-modal="false"
    @update:visible="close"
    @cancel="close"
  >
    <el-form label-position="top" @submit.prevent="filterAssets">
      <el-form-item :label="$t('CIDRRanges')">
        <div class="cidr-filter-row">
          <el-input
            v-model="cidrText"
            :placeholder="$t('ZoneCIDRFilterPlaceholder')"
            :disabled="submitting"
            @input="clearResults"
          />
          <el-button type="primary" native-type="submit" :disabled="!cidrText.trim() || submitting">
            {{ $t('Filter') }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>
    <p class="help-text">{{ $t('ZoneCIDRManualHelp') }}</p>
    <ListTable
      v-if="filteredCIDRs"
      :key="filterVersion"
      :table-config="tableConfig"
      :header-actions="headerActions"
      @selection-change="selectedRows = $event"
    />
    <template #footer>
      <el-button :disabled="submitting" @click="close">{{ $t('Cancel') }}</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="!selectedRows.length"
        @click="addAssets"
      >
        {{ $t('AddSelectedToZone') }} ({{ selectedRows.length }})
      </el-button>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import ListTable from '@/components/Table/ListTable'

export default {
  components: { Dialog, ListTable },
  props: {
    object: { type: Object, required: true }
  },
  emits: ['close', 'added'],
  data() {
    return {
      cidrText: (this.object.cidrs || []).join(', '),
      filteredCIDRs: '',
      filterVersion: 0,
      selectedRows: [],
      submitting: false,
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false
      }
    }
  },
  computed: {
    assetUrl() {
      const query = new URLSearchParams({
        cidrs: this.filteredCIDRs,
        is_gateway: '0',
        exclude_zone: this.object.id
      })
      return `/api/v1/assets/assets/?${query}`
    },
    tableConfig() {
      return {
        url: this.assetUrl,
        columns: ['name', 'address', 'platform', 'zone'],
        columnsMeta: {
          name: { formatter: (row) => row.name },
          actions: { has: false }
        }
      }
    }
  },
  methods: {
    clearResults() {
      this.filteredCIDRs = ''
      this.selectedRows = []
    },
    filterAssets() {
      if (this.submitting || !this.cidrText.trim()) return
      this.selectedRows = []
      this.filterVersion += 1
      this.filteredCIDRs = this.cidrText
        .trim()
        .split(/[\s,;]+/)
        .filter(Boolean)
        .join(',')
    },
    async addAssets() {
      if (this.submitting || !this.selectedRows.length) return
      this.submitting = true
      try {
        const data = this.selectedRows.map(({ id }) => ({ id, zone: this.object.id }))
        await this.$axios.patch(this.assetUrl, data)
        this.$message.success(this.$t('AddSuccessMsg'))
        this.$emit('added')
        this.$emit('close')
      } finally {
        this.submitting = false
      }
    },
    close() {
      if (!this.submitting) this.$emit('close')
    }
  }
}
</script>

<style scoped lang="scss">
.cidr-filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  .el-input {
    flex: 1;
    min-width: 0;
  }

  .el-button {
    flex-shrink: 0;
    align-self: stretch;
    min-width: 96px;
    height: auto;
    padding: 0 24px;
    font-size: 14px;
  }
}

.help-text {
  margin: 12px 0;
  color: var(--el-text-color-secondary);
}
</style>
