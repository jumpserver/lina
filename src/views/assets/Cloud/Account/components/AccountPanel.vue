<template>
  <div style="height: 100%;">
    <el-row :gutter="20" style="height: 6%;">
      <el-col :span="22">
        <div class="line">
          {{ object.provider.label }} | <span style="font-weight: bold;">{{ object.name }}</span>
        </div>
      </el-col>
      <el-col :span="2" style="margin-top: -10px;" @click.native="handleClick($event)">
        <el-dropdown>
          <el-link type="primary" :underline="false"><i class="el-icon-more el-icon--right" /></el-link>
          <el-dropdown-menu default="dropdown">
            <el-dropdown-item v-for="action in actions" :key="action.name" @click.native="action.callback">
              <i v-if="action.icon" :class="action.icon" /> {{ action.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20" style="height: 80%;">
      <el-col :span="8" class="image">
        <Icon icon="computer" />
      </el-col>
      <el-col :span="16">
        <el-link :underline="false" type="primary" class="one">
          <span class="title">{{ $tc('TotalSyncRegion') }}: </span>
          <span class="content">{{ iTask.regions.length }}</span>
        </el-link>
        <el-link :underline="false" type="primary" class="one">
          <span class="title">{{ $tc('TotalSyncAsset') }}: </span>
          <span class="content">{{ iTask.instance_count || 0 }}</span>
        </el-link>
        <el-link :underline="false" type="primary" class="one">
          <span class="title">{{ $tc('TotalSyncStrategy') }}: </span>
          <span class="content">{{ iTask.strategy.length }}</span>
        </el-link>
        <el-link :underline="false" type="primary" class="one">
          <span class="title">{{ $tc('DateJoined') }}: </span>
          <span class="content">{{ toSafeLocalDateStr(object.date_created) }}</span>
        </el-link>
        <el-link :underline="false" type="primary" class="one">
          <span class="title">{{ $tc('DateLastSync') }}: </span>
          <span class="content">{{ toSafeLocalDateStr(iTask.date_last_sync) }}</span>
        </el-link>
      </el-col>
    </el-row>
    <Dialog
      :destroy-on-close="true"
      :title="$tc('CloudAccountUpdate')"
      :visible.sync="updateVisible"
      :show-buttons="false"
      v-on="$listeners"
    >
      <AuthPanel
        :provider="object.provider.value"
        :object="object"
        :visible.sync="updateVisible"
        @submitSuccess="onSubmitSuccess"
      />
    </Dialog>
    <Dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :destroy-on-close="true"
      :title="$tc('SyncOnline')"
      :show-buttons="false"
      :show-close="false"
      :visible.sync="onlineSyncVisible"
      v-on="$listeners"
    >
      <AssetPanel :object="object" :visible.sync="onlineSyncVisible" />
    </Dialog>
  </div>
</template>

<script>
import Icon from '@/components/Widgets/Icon/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import AuthPanel from '@/views/assets/Cloud/Account/components/AuthPanel'
import AssetPanel from '@/views/assets/Cloud/Account/components/AssetPanel'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'AccountPanel',
  components: {
    Dialog,
    Icon,
    AuthPanel,
    AssetPanel
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
          callback: this.handleUpdate
        },
        {
          name: this.$tc('Delete'),
          icon: 'el-icon-delete',
          callback: this.handleDelete
        },
        {
          name: this.$tc('SyncOnline'),
          icon: 'el-icon-thumb',
          callback: this.handleOnlineExecute
        }
      ]
    }
  },
  computed: {
    iTask() {
      return Object.assign(this.object?.task, { strategy: [] })
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

<style scoped>
.el-divider--horizontal {
  margin: 15px 0;
}
.line {
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.image {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  svg {
    width: 40px;
    height: 40px;
  }
}
.one {
  display: block;
  text-align: left;
  margin: 10px 0;
}
.content {
  font-weight: bold;
}
</style>
