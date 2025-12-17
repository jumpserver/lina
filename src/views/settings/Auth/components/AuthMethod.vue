<template>
  <el-col :lg="8" :md="8" :sm="12" :span="8" :xl="8" :xs="24" class="auth-item-col">
    <el-card ref="card" class="auth-card" shadow="never">
      <div slot="header" class="auth-item-header">
        <div class="auth-item-header-left">
          <img :src="logo" alt="auth-logo" class="auth-logo">
          <div :title="title" class="auth-item-header-title">
            <div>
              <span>
                {{ title }}
              </span>
              <!-- <el-tag v-if="type" type="success" class="auth-item-type" size="mini">
                {{ type }}
              </el-tag> -->
            </div>
            <!-- <div v-if="description" class="auth-item-header-description">
              {{ description || '' }}
            </div> -->
          </div>
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

<script lang="jsx">
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
    },
    type: {
      type: String,
      default: 'enterprise'
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
  margin: 5px 0;
  padding: 0 10px;

  .auth-card {
    transition: all 0.3s;
    border-radius: 4px;
    overflow: hidden;

    .auth-item-header {
      display: flex;
      align-items: left;
      justify-content: space-between;
      padding: 5px;

      .auth-item-header-left {
        display: flex;
        align-items: left;
        gap: 8px;
        width: calc(100% - 42px);

        .auth-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .auth-item-header-title {
          max-width: calc(100% - 62px);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500;
          min-height: 17px; /* 确保标题区域有固定高度 */
          line-height: 32px;
        }

        .auth-item-type {
          margin-left: 8px;
        }

        .auth-item-header-description {
          font-size: 12px;
          color: #999;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          word-break: keep-all;
          white-space: normal;
          line-height: 1.4;
          height: 20px; /* 最大高度：2行 * 1.4行高 * 12px字体 ≈ 34px */
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
