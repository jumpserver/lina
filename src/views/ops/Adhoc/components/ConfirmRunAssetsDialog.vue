<template>
  <Dialog
    :title="$t('确认运行资产')"
    :visible.sync="visible"
    :show-buttons="true"
    :show-confirm="true"
    :show-cancel="true"
    width="1000px"
    @confirm="onConfirm"
    @cancel="onCancel"
  >
    <div class="confirm-run-assets-dialog">
      <div class="assets-list">
        <div class="asset-group">
          <div class="group-title">可运行资产：</div>
          <el-checkbox
            v-model="checkAll"
            :indeterminate="isIndeterminate"
            style="margin-left: 10px"
            @change="handleCheckAllChange"
          >
            {{ $t('All') }}
          </el-checkbox>
          <el-checkbox-group v-model="selectedAssets" class="group-assets" @change="handleCheckedAssetChange">
            <el-checkbox
              v-for="asset in runnableAssets"
              :key="asset.id"
              :label="asset.id"
              class="asset-item"
            >
              <div class="asset-item">
                <span>{{ asset.name }}</span>
                <span class="asset-ip">{{ asset.ip }}</span>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="asset-group">
        <div class="group-title">不可运行资产：</div>
        <el-checkbox-group class="group-assets">
          <el-checkbox
            v-for="asset in failedAssets"
            :key="asset.id"
            :label="asset.name"
            class="asset-item"
            disabled
          >
            <div class="asset-item">
              <span>{{ asset.name }}</span>
              <span class="asset-status">{{ asset.error }}</span>
            </div>

          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <div>
      <div class="selected-count">已选 {{ selectedAssets.length }} 个资产</div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'

export default {
  name: 'ConfirmRunAssetsDialog',
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    assets: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      checkAll: false,
      selectedAssets: [],
      isIndeterminate: true
    }
  },
  computed: {
    runnableAssets() {
      return this.assets.runnable
    },
    failedAssets() {
      return this.assets.error
    }
  },
  methods: {
    onCancel() {
      this.$emit('update:visible', false)
    },
    onConfirm() {
      this.$emit('submit', this.selectedAssets, [])
      this.$emit('update:visible', false)
    },
    handleCheckAllChange(value) {
      this.selectedAssets = value ? this.runnableAssets.map((item) => item.id) : []
      this.isIndeterminate = false
    },
    handleCheckedAssetChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.runnableAssets.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.runnableAssets.length
    }
  }
}
</script>

<style scoped lang="scss">
.confirm-run-assets-dialog {

  .assets-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .asset-group {
    margin-bottom: 16px;

    .group-title {
      font-weight: bold;
      margin-bottom: 8px;
    }

    .group-assets {
      ::v-deep .el-checkbox__label {
        display: inline-block;
        padding-left: 10px;
        line-height: 19px;
        font-size: 13px;
        width: 100%;
      }

      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-row-gap: 5px;
      justify-items: start;

      .asset-item {
        display: flex;
        grid-template-columns: 1fr 1fr;
        justify-content: space-between;
        width: 100%;

        .asset-ip {
          padding-right: 10px;
        }

        .asset-status {
          padding-right: 10px;
          color: #ed5565
        }
      }

    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
  }

  .selected-count {
    color: #1ab394;
  }
}
</style>
