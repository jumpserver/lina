<template>
  <div class="update-token">
    <el-button v-show="!isShow" icon="el-icon-edit" type="text" @click="isShow=true">
      {{ text }}
    </el-button>
    <el-input
      v-show="isShow"
      v-model.trim="curValue"
      :disabled="disabled"
      :placeholder="placeholder"
      :type="type"
      class="password-input"
      show-password
      @change="onChange"
    />
    <el-button :disabled="disabled" size="small" type="text" @click="randomPassword">
      <i class="fa fa-refresh" />
    </el-button>
  </div>
</template>

<script>
import { randomString } from '@/utils/string'

export default {
  props: {
    value: {
      type: String,
      default: () => ''
    },
    type: {
      type: String,
      default: () => 'input'
    },
    text: {
      type: String,
      default() {
        return this.$t('Update')
      }
    },
    showInput: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: () => ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShow: this.showInput,
      curValue: this.value
    }
  },
  created() {
    if (this.$route.path.indexOf('/update') !== -1) {
      this.isShow = false
    }
  },
  methods: {
    onChange(e) {
      this.$emit('input', this.curValue)
    },
    randomPassword() {
      this.curValue = randomString(24, true)
      this.$emit('input', this.curValue)
    }
  }
}
</script>
<style lang='scss' scoped>
.password-input {
  width: calc(100% - 50px);
}

.update-token {
  i {
    color: var(--color-text-secondary);
    font-size: 14px;
  }
}

</style>
