<template>
  <div class="account-panel">
    <el-row :gutter="20">
      <el-col :span="21">
        <div class="title">
          <span>{{ object.name }}</span>
        </div>
      </el-col>
      <el-col v-if="iActions.length !== 0" :span="3" @click.native="handleClick($event)">
        <el-dropdown>
          <el-link :underline="false" type="primary">
            <i class="el-icon-more el-icon--right" style="color: var(--color-text-primary)" />
          </el-link>
          <el-dropdown-menu default="dropdown">
            <el-dropdown-item
              v-for="action in iActions"
              :key="action.name"
              :disabled="action.disabled"
              @click.native="action.callback(object)"
            >
              <i v-if="action.icon" :class="action.icon" /> {{ action.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="panel-content">
      <el-col :span="6" class="panel-image">
        <el-image :src="imageUrl" fit="contain" />
      </el-col>
      <el-col :span="18" class="panel-info">
        <InfoPanel
          v-for="(obj, index) in getInfos(object)"
          :key="index"
          :content="obj.content"
          :title="obj.title"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import InfoPanel from './InfoPanel'

export default {
  name: 'CardPanel',
  components: {
    InfoPanel
  },
  props: {
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    object: {
      type: Object,
      required: true
    },
    actions: {
      type: Array,
      default: () => []
    },
    infos: {
      type: Array,
      default: () => []
    },
    getImage: {
      type: Function,
      default: (obj) => ''
    },
    getInfos: {
      type: Function,
      default: (obj) => []
    },
    handleUpdate: {
      type: Function,
      default: () => {
      }
    }
  },
  data() {
    return {
      defaultActions: [
        {
          id: 'update',
          name: this.$tc('Update'),
          icon: 'el-icon-edit',
          callback: this.handleUpdate,
          disabled: this.isDisabled('change')
        },
        {
          id: 'delete',
          name: this.$tc('Delete'),
          icon: 'el-icon-delete',
          callback: this.handleDelete,
          disabled: this.isDisabled('delete')
        }
      ]
    }
  },
  computed: {
    imageUrl() {
      return this.getImage(this.object)
    },
    iActions() {
      const mergedActions = new Map()
      this.defaultActions.forEach(a => {
        mergedActions.set(a.id, { ...a })
      })
      this.actions.forEach(a => {
        mergedActions.set(a.id, { ...a })
      })
      return Array.from(mergedActions.values())
    }
  },
  methods: {
    isDisabled(action) {
      const app = this.tableConfig.permissions?.app
      const resource = this.tableConfig.permissions?.resource
      return !this.$hasPerm(`${app}.${action}_${resource}`)
    },
    handleClick(event) {
      event.stopPropagation()
    },
    handleDelete() {
      const url = this.tableConfig.url
      this.$confirm(this.$tc('DeleteConfirmMessage'), this.$tc('Delete'), {
        confirmButtonText: this.$tc('Confirm'),
        cancelButtonText: this.$tc('Cancel'),
        type: 'warning'
      }).then(() => {
        this.$axios.delete(`${url}${this.object.id}/`).then(() => {
          this.$message({
            type: 'success',
            message: this.$tc('DeleteSuccess')
          })
          this.$emit('refresh')
        })
      })
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
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 1.1em;
    color: #555555;
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
