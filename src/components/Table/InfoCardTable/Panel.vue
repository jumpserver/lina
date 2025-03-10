<template>
  <div class="info-panel">
    <div class="panel-header">
      <div class="panel-title">
        <el-avatar :src="imageUrl" />
        <span>{{ object.name }}</span>
      </div>
      <div
        v-if="iActions.length !== 0"
        class="panel-actions"
        @click="handleClick($event)"
      >
        <el-dropdown>
          <el-button size="mini">
            <i class="el-icon-more el-icon--right" />
          </el-button>
          <el-dropdown-menu default="dropdown">
            <el-dropdown-item
              v-for="action in iActions"
              :key="action.name"
              :disabled="action.disabled"
              @click.native="action.callback(object)"
            >
              {{ action.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="panel-content" @click="gotoDetail">
      <InfoPanel :infos="getInfos(object)" />
    </div>
    <el-row class="panel-footer" />
  </div>
</template>

<script>
import InfoPanel from './Info.vue'

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
    },
    onView: {
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
    gotoDetail() {
      this.onView(this.object)
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

.info-panel {
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 5px 10px;
    border-bottom: solid 1px #e7eaec;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    cursor: default;

    .panel-title {
      display: flex;
      align-items: center;
      font-weight: 600;

      ::v-deep {
        .el-avatar {
          background: white;
        }
      }
    }

    .panel-actions {
      display: flex;
      align-items: center;

      ::v-deep {
        button.el-button--mini {
          padding: 5px 7px;

          .el-icon--right {
            margin-left: 0;
          }
        }
      }
    }
  }

  .panel-content {
    display: block;
    padding: 10px 30px;
    cursor: pointer;

    .panel-image {
      margin: auto 5px;
      width: 100px;
    }

    .panel-info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }

  .el-divider--horizontal {
    margin: 5px 0;
  }
}
</style>
