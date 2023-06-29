<template>
  <el-row style="min-width: 100px">
    <el-col :span="16">
      <el-input v-model="value" :placeholder="this.$t('auth.Captcha')" @input="handleInput" />
    </el-col>
    <el-col :span="8">
      <el-button
        type="primary"
        size="small"
        style="width: 90%;margin-left: 10%"
        :disabled="iBtnDisabled"
        @click="btnClick()"
      >
        {{ btnContent }}
      </el-button>
    </el-col>
  </el-row>
</template>

<script>

export default {
  name: 'CaptchaButton',
  components: {
  },
  props: {
    url: {
      type: String,
      required: true
    },
    btnDisabled: {
      type: Function,
      default: () => false
    },
    submitButtonCallback: {
      type: Function,
      default: function() {}
    },
    period: {
      type: Number,
      default: () => 60
    }
  },
  data() {
    return {
      value: '',
      interval: this.period,
      iBtnDisabled: this.btnDisabled(),
      btnContent: this.$t('users.quickUpdate.send')
    }
  },
  computed: {
  },
  created() {
  },
  methods: {
    btnClick() {
      let can = true
      if (typeof this.submitButtonCallback === 'function') {
        can = this.submitButtonCallback()
      }
      if (can) {
        const countdown = setInterval(() => {
          if (this.interval <= 0) {
            clearInterval(countdown)
            this.iBtnDisabled = false
            this.interval = this.period
            this.btnContent = this.$t('users.quickUpdate.send')
          } else {
            this.iBtnDisabled = true
            this.btnContent = this.interval--
          }
        }, 1000)
      }
    },
    handleInput(value) {
      this.$emit('input', value)
    }
  }
}
</script>

<style scoped>
</style>
