<template>
  <div class="account-panel">
    <el-row :gutter="20">
      <el-col :span="21">
        <div class="title">
          <span>{{ object.name }}</span>
        </div>
      </el-col>
      <el-col :span="3" @click.native="handleClick($event)">
        <el-dropdown>
          <el-link :underline="false" type="primary">
            <i class="el-icon-more el-icon--right" style="color: var(--color-text-primary)" />
          </el-link>
          <el-dropdown-menu default="dropdown">
            <el-dropdown-item
              v-for="action in actions"
              :key="action.name"
              :disabled="action.disabled"
              @click.native="action.callback"
            >
              <i v-if="action.icon" :class="action.icon" /> {{ action.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20" class="panel-content">
      <el-col :span="6" class="panel-image">
        <el-image :src="cloudImage" fit="contain" />
      </el-col>
      <el-col :span="18" class="panel-info">
        <InfoPanel :content="iTask.regions.length" :title="$tc('TotalSyncRegion')" />
        <InfoPanel :content="iTask.instance_count || 0" :title="$tc('TotalSyncAsset')" />
        <InfoPanel :content="toSafeLocalDateStr(iTask.date_last_sync)" :title="$tc('DateLastSync')" />
      </el-col>
    </el-row>
    <Dialog
      v-if="updateVisible"
      :destroy-on-close="true"
      :show-buttons="false"
      :title="$tc('CloudAccountUpdate')"
      :visible.sync="updateVisible"
      v-on="$listeners"
    >
      <AuthPanel
        :object="object"
        :provider="object.provider.value"
        :visible.sync="updateVisible"
        origin="update"
        @submitSuccess="onSubmitSuccess"
      />
    </Dialog>
    <Dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :destroy-on-close="true"
      :show-buttons="false"
      :show-close="false"
      :title="$tc('SyncOnline')"
      :visible.sync="onlineSyncVisible"
      v-on="$listeners"
    >
      <AssetPanel :object="object" :visible.sync="onlineSyncVisible" />
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import AuthPanel from './AuthPanel'
import InfoPanel from './InfoPanel'
import AssetPanel from './AssetPanel'
import { toSafeLocalDateStr } from '@/utils/time'
import { ACCOUNT_PROVIDER_ATTRS_MAP } from '@/views/assets/Cloud/const'

export default {
  name: 'AccountPanel',
  components: {
    Dialog,
    AuthPanel,
    AssetPanel,
    InfoPanel
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      updateVisible: false,
      onlineSyncVisible: false,
      actions: [
        {
          name: this.$tc('Update'),
          icon: 'el-icon-edit',
          callback: this.handleUpdate,
          disabled: !this.$hasPerm('xpack.change_account')
        },
        {
          name: this.$tc('Delete'),
          icon: 'el-icon-delete',
          callback: this.handleDelete,
          disabled: !this.$hasPerm('xpack.delete_account')
        },
        {
          name: this.$tc('SyncOnline'),
          icon: 'el-icon-thumb',
          callback: this.handleOnlineExecute,
          disabled: !this.$hasPerm('xpack.change_syncinstancetask')
        }
      ]
    }
  },
  computed: {
    iTask() {
      return { ...{ strategy: [] }, ...this.object?.task }
    },
    cloudImage() {
      return ACCOUNT_PROVIDER_ATTRS_MAP[`${this.object.provider.value}`].image
    }
  },
  watch: {
    onlineSyncVisible: {
      handler(newValue) {
        if (newValue === false) {
          this.$emit('refresh')
        }
      }
    },
    updateVisible: {
      handler(newValue) {
        if (newValue === false) {
          this.$emit('refresh')
        }
      }
    }
  },
  methods: {
    toSafeLocalDateStr,
    handleDelete() {
      this.$confirm(this.$tc('DeleteConfirmMessage'), this.$tc('Delete'), {
        confirmButtonText: this.$tc('Confirm'),
        cancelButtonText: this.$tc('Cancel'),
        type: 'warning'
      }).then(() => {
        this.$axios.delete(`/api/v1/xpack/cloud/accounts/${this.object.id}/`).then(() => {
          this.$message({
            type: 'success',
            message: this.$tc('DeleteSuccess')
          })
          this.$emit('refresh')
        })
      })
    },
    handleUpdate() {
      this.updateVisible = true
    },
    handleOnlineExecute() {
      this.onlineSyncVisible = true
    },
    onSubmitSuccess() {
      this.$emit('refresh')
      this.updateVisible = false
    },
    handleClick(event) {
      event.stopPropagation()
    }
  }
}
</script>

<style lang="scss" scoped>

.account-panel {
  display: flex;
  flex-direction: column;
  //height: 100%;
  cursor: pointer;

  .title {
    text-align: left;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .panel-content {
    display: flex;
    height: 100px;
    padding: 10px 0;

    .panel-image {
      margin: auto 5px;
    }
  }

  .el-divider--horizontal {
    margin: 5px 0;
  }
}
</style>
