<template>
  <div class="binding-list">
    <el-alert :closable="false" :title="$t('CredentialBindingIDHint')" show-icon type="info" />
    <el-table :data="object.account_bindings || []" border>
      <el-table-column :label="$t('Asset')" min-width="180">
        <template #default="{ row }">
          {{ row.asset?.name || '-' }}
          <span v-if="row.asset?.address" class="secondary">({{ row.asset.address }})</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Account')" min-width="180">
        <template #default="{ row }">
          {{ row.account?.name || '-' }}
          <span v-if="row.account?.username" class="secondary">({{ row.account.username }})</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('CredentialBindingID')" min-width="330">
        <template #default="{ row }">
          <span class="binding-id">
            <code>{{ row.id }}</code>
            <el-button link type="primary" @click="copy(row.id)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { copy } from '@/utils/common/index'

export default {
  name: 'IntegrationApplicationAccountList',
  props: {
    object: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  methods: { copy }
}
</script>

<style lang="scss" scoped>
.binding-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.binding-id {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.secondary {
  color: var(--el-text-color-secondary);
}
</style>
