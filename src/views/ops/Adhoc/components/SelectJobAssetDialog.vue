<template>
  <div class="asset-select">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('selectedAssets') }}({{ selectAssets.length }})</span>
        <el-button
          v-if="selectAssets.length > 0"
          style="float: right; padding: 3px 0"
          type="text"
          @click="handleClick"
        >
          {{ $t('pleaseSelectAssets') }}
        </el-button>
      </div>
      <div
        v-if="selectAssets.length === 0"
        class="empty-assets"
        role="button"
        tabindex="0"
        aria-label="Select assets"
        @click=" handleClick()"
      >
        <i class="icon el-icon-plus" />
        <span class="title">{{ $t('pleaseSelectAssets') }}</span>
        <span class="subtitle">{{ $t('clickToAdd') }}</span>
      </div>
      <div v-else class="asset-list">
        <div
          v-for="group in groupedAssets"
          :key="group.key"
          class="platform-group"
        >
          <div class="platform-group-header">
            <el-checkbox
              :indeterminate="isPlatformIndeterminate(group)"
              :value="isPlatformAllSelected(group)"
              @change="val => togglePlatformAll(group, val)"
            >
              <span class="platform-title">
                <img
                  v-if="group.assets.length"
                  :src="getPlatformLogo(group.assets[0])"
                  class="platform-icon"
                >
                {{ group.platformName }} ({{ group.assets.length }})
              </span>
            </el-checkbox>
          </div>
          <el-checkbox-group
            v-model="selectAssets"
            class="platform-group-assets"
            @change="onCheckboxChange"
          >
            <el-checkbox
              v-for="item in group.assets"
              :key="item.id"
              :label="item.id"
            >
              <span
                :title="item.name"
                class="asset-name"
              >{{ item.name }}</span>
              <i
                class="el-icon-minus asset-remove-icon"
                :title="$tc('Remove')"
                @click.stop="removeAsset(item)"
              />
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </el-card>

    <AssetSelectDialog
      v-if="dialogVisible"
      ref="dialog"
      :base-node-url="baseNodeUrl"
      :base-url="baseUrl"
      :tree-setting="treeSetting"
      :tree-url-query="treeUrlQuery"
      :value="selectAssets"
      :visible.sync="dialogVisible"
      v-bind="$attrs"
      @cancel="handleCancel"
      @confirm="handleConfirm"
      v-on="$listeners"
    />
  </div>
</template>

<script>
import AssetSelectDialog from '@/components/Apps/AssetSelect/dialog.vue'
import { loadPlatformIcon } from '@/utils/jms/index'

export default {
  componentName: 'SelectJobAssetDialog',
  components: { AssetSelectDialog },
  props: {
    baseUrl: {
      type: String,
      default: '/api/v1/perms/users/self/assets/'
    },
    defaultPageSize: {
      type: Number,
      default: 10
    },
    baseNodeUrl: {
      type: String,
      default: '/api/v1/perms/users/self/nodes/'
    },
    treeUrlQuery: {
      type: Object,
      default: () => {
      }
    },
    value: {
      type: Array,
      default: () => []
    },
    treeSetting: {
      type: Object,
      default: () => ({})
    },
    disabled: {
      type: [Boolean, Function],
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      selectAssetRows: [],
      selectAssets: []
    }
  },
  computed: {
    groupedAssets() {
      const map = {}
      this.selectAssetRows.forEach(a => {
        const key = a?.type?.value || 'unknown'
        const name = a?.type?.label || a?.type?.value || 'Unknown'
        if (!map[key]) {
          map[key] = { key, platformName: name, assets: [] }
        }
        map[key].assets.push(a)
      })
      return Object.values(map)
        .map(g => {
          g.assets = g.assets.slice().sort((x, y) => (x.name || '').localeCompare(y.name || ''))
          return g
        })
        .sort((a, b) => a.platformName.localeCompare(b.platformName))
    }
  },
  methods: {
    handleClick() {
      this.dialogVisible = true
    },
    handleConfirm(valueSelected, rowsAdd) {
      if (valueSelected === undefined) {
        return
      }
      this.$emit('change', valueSelected)
      rowsAdd.forEach(item => {
        if (!this.selectAssetRows.find(i => i.id === item.id)) {
          this.selectAssetRows.push(item)
        }
      })
      // 移除已经取消选择的资产
      this.selectAssetRows = this.selectAssetRows.filter(r => valueSelected.includes(r.id))
      this.selectAssets = valueSelected
      this.dialogVisible = false
    },
    handleCancel() {
      this.dialogVisible = false
    },
    getPlatformLogo(platform) {
      return loadPlatformIcon(platform.name, platform.type.value)
    },
    onCheckboxChange(value) {
      this.selectAssets = value
      this.$emit('change', value)
    },
    isPlatformAllSelected(group) {
      return group.assets.length > 0 && group.assets.every(a => this.selectAssets.includes(a.id))
    },
    isPlatformIndeterminate(group) {
      const selected = group.assets.filter(a => this.selectAssets.includes(a.id)).length
      return selected > 0 && selected < group.assets.length
    },
    togglePlatformAll(group, checked) {
      const ids = group.assets.map(a => a.id)
      if (checked) {
        const merged = new Set(this.selectAssets.concat(ids))
        this.selectAssets = Array.from(merged)
      } else {
        this.selectAssets = this.selectAssets.filter(id => !ids.includes(id))
      }
      this.$emit('change', this.selectAssets)
    },
    removeAsset(asset) {
      this.selectAssets = this.selectAssets.filter(id => id !== asset.id)
      this.selectAssetRows = this.selectAssetRows.filter(r => r.id !== asset.id)
      this.$emit('change', this.selectAssets)
    }
  }
}
</script>

<style lang="scss" scoped>
.asset-select {
  display: flex;
  flex-direction: column;
  background: #fff;
  color: var(--color-border);

  ::v-deep {
    .el-card {
      flex: 1;
    }

    .el-card__body {
      height: calc(100vh - 200px);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 10px 16px;
    }

    .el-checkbox {
      width: 100%;
      display: flex;
      padding: 3px 0;
      margin-right: 0;
      align-items: center;

      .asset-remove-icon {
        opacity: 0;
        visibility: hidden;
        cursor: pointer;
        font-weight: normal;
        transition: opacity .15s ease;
        margin-left: auto;
        color: var(--color-danger);
      }

      .el-checkbox__label {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 3px;
        padding-right: 20px;
        padding-left: 3px;
      }

      .el-checkbox__label:hover .asset-remove-icon {
        opacity: 1;
        visibility: visible;
      }
    }
  }

  .asset-list {
    margin: auto;
  }

  .asset-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 180px;
  }

  .platform-group {
    margin-bottom: 8px;
    padding: 6px 8px;
  }

  .platform-group-header {
    padding-bottom: 4px;
    margin-bottom: 4px;
  }

  .platform-title {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #a2aabd;
    font-weight: 800;
    font-size: 12px;
  }

  .platform-icon {
    width: 18px;
    height: 18px;
  }

  .platform-group-assets {
    padding-left: 15px;
    margin-left: 3px;
    border-left: 2px solid var(--color-border);
  }

  .select-asset-button {
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* 让中心点对齐 */
  }

}

.el-select {
  width: 100%;
}

.page ::v-deep .page-heading {
  display: none;
}

.el-dialog__wrapper ::v-deep .el-dialog__body {
  padding: 0 0 0 3px;
}

.empty-assets {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  padding: 56px 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color .2s, background-color .25s, color .2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  height: 100%;
  background: #fff;

  .icon {
    font-size: 42px;
    line-height: 1;
    margin-bottom: 14px;
    color: #c0c4cc;
    transition: color .2s;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .subtitle {
    font-size: 12px;
    opacity: .75;
  }
}

.empty-assets:hover:not(.is-disabled) {
  border-color: var(--color-primary);
  background: #f5f9ff;
  color: var(--color-primary);

  .icon {
    color: var(--color-primary);
  }
}

.empty-assets.is-disabled {
  cursor: not-allowed;
  opacity: .55;
  background: #fafafa;

  .disabled-tip {
    color: #c0c4cc;
  }
}
</style>
