<template>
  <Dialog
    v-model:visible="iVisible"
    :show-cancel="false"
    :title="title"
    :close-on-click-modal="false"
    width="700px"
    @close="onClose"
    @confirm="visible = false"
  >
    <component :is="warningText ? 'el-alert' : 'div'" type="warning" :closable="false">
      {{ warningText }}
      <div class="secret">
        <div class="row">
          <span class="col">ID:</span>
          <span class="value">{{ keyInfo.id }}</span>
          <div class="row-actions">
            <el-tooltip :content="$t('Copy')" placement="top">
              <el-button
                :aria-label="$t('Copy')"
                class="icon-button"
                text
                @click="handleCopy(keyInfo.id)"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
        <div class="row">
          <span class="col">Secret:</span>
          <span class="value">{{ !maskSecret || revealed ? keyInfo.secret : maskedSecret }}</span>
          <div class="row-actions">
            <el-tooltip v-if="maskSecret" :content="$t(revealed ? 'Hide' : 'Show')" placement="top">
              <el-button
                :aria-label="$t(revealed ? 'Hide' : 'Show')"
                class="icon-button"
                text
                @click="revealed = !revealed"
              >
                <el-icon>
                  <Hide v-if="revealed" />
                  <View v-else />
                </el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip :content="$t('Copy')" placement="top">
              <el-button
                :aria-label="$t('Copy')"
                class="icon-button"
                text
                @click="handleCopy(keyInfo.secret)"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
        </div>
      </div>
    </component>
  </Dialog>
</template>

<script>
import { ElAlert } from 'element-plus'
import i18n from '@/i18n/i18n'
import { copy } from '@/utils/common/index'
import Dialog from '@/components/Dialog/index'

export default {
  name: 'Secret',
  components: {
    ElAlert,
    Dialog
  },
  props: {
    title: {
      type: String,
      default: () => i18n.t('CreateAccessKey')
    },
    warningText: {
      type: String,
      default: () => i18n.t('ApiKeyWarning')
    },
    maskSecret: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      keyInfo: { id: '', secret: '' },
      revealed: !this.maskSecret,
      visible: false
    }
  },
  computed: {
    maskedSecret() {
      return '•'.repeat(12)
    },
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.visible = val
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    show(data) {
      this.keyInfo = { id: data.id || '', secret: data.secret || '' }
      this.revealed = !this.maskSecret
      this.visible = true
    },
    onClose() {
      this.keyInfo = { id: '', secret: '' }
      this.revealed = !this.maskSecret
      this.$emit('close')
    },
    handleCopy(value) {
      copy(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.secret {
  color: #2b2f3a;
  margin-top: 20px;
}

.row {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr) 64px;
  min-height: 30px;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.col {
  text-align: left;
}

.value {
  min-width: 0;
  overflow-wrap: anywhere;
  font-weight: 600;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.icon-button {
  width: 30px;
  height: 30px;
  padding: 0;
  color: var(--el-text-color-secondary);

  &:hover,
  &:focus-visible {
    color: var(--el-color-primary);
  }
}
</style>
