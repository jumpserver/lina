<template>
  <el-col :lg="6" :md="8" :sm="12" :span="8" :xl="4" :xs="24" class="auth-item-col">
    <el-card ref="card" class="auth-card" shadow="hover">
      <div slot="header" class="auth-item-header">
        <div class="auth-item-header-left">
          <img :src="logo" alt="auth-logo" class="auth-logo">
          <div :title="title" class="auth-item-header-title">{{ title }}</div>
        </div>
        <div class="auth-item-actions">
          <el-switch
            v-model="isEnabled"
            active-color="#148f76"
            inactive-color="#e5e6e7"
            @change="onChangeStatus"
          />
        </div>
      </div>
    </el-card>
  </el-col>
</template>

<script>
export default {
  props: {
    logo: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    authKey: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cardBody: null,
      isEnabled: this.enabled
    }
  },
  watch: {
    enabled(newVal) {
      this.isEnabled = newVal
    }
  },
  methods: {
    onChangeStatus(value) {
      this.$store.dispatch('settings/updateAuthItemStatus', [this.authKey, value])
    }
  }
}
</script>

<style lang="scss" scoped>
.auth-item-col {
  margin: 10px 0;
  padding: 0 10px;

  .auth-card {
    transition: all 0.3s;
    border-radius: 4px;
    overflow: hidden;

    .auth-item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px;

      .auth-item-header-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .auth-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .auth-item-header-title {
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500;
        }
      }

      .auth-item-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    ::v-deep .el-card__body {
      display: none;
    }
  }
}
</style>
