<template>
  <Dialog
    :show-cancel="false"
    :title="title"
    :visible.sync="visible"
    :close-on-click-modal="false"
    width="700px"
    @close="onClose"
    @confirm="visible = false"
  >
    <el-alert type="warning" :closable="false">
      {{ warningText }}
      <div class="secret">
        <div class="row">
          <span class="col">ID:</span>
          <span class="value">{{ keyInfo.id }}</span>
          <i class="el-icon-copy-document copy-icon" @click="handleCopy(keyInfo.id)" />
        </div>
        <div class="row">
          <span class="col">Secret:</span>
          <span class="value">{{ keyInfo.secret }}</span>
          <i class="el-icon-copy-document copy-icon" @click="handleCopy(keyInfo.secret)" />
        </div>
      </div>
    </el-alert>
  </Dialog>
</template>

<script>
import i18n from '@/i18n/i18n'
import { copy } from '@/utils/common'
import Dialog from '@/components/Dialog/index'

export default {
  name: 'Secret',
  components: {
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
    }
  },
  data() {
    return {
      keyInfo: { id: '', secret: '' },
      visible: false
    }
  },
  methods: {
    show(data) {
      this.keyInfo = data
      this.visible = true
    },
    onClose() {
      this.$emit('close')
    },
    handleCopy(value) {
      copy(value)
    }
  }
}

</script>

<style lang='scss' scoped>
 .secret {
  color: #2b2f3a;
  margin-top: 20px;
}

.row {
  margin-bottom: 10px;
}

.col {
  width: 100px;
  text-align: left;
  display: inline-block;
}

.copy-icon {
  margin-left: 5px;
  cursor: pointer;
  transition: color 0.2s;
}

.value {
  font-weight: 600;
}
</style>
