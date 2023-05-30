<template>
  <el-row style="min-width: 100px">
    <el-col :span="12">
      <el-input v-model="value" :placeholder="this.$t('auth.Captcha')" @input="handleInput" />
    </el-col>
    <el-col :span="12">
      <el-image
        :src="image_url"
        style="padding: 2% 0 0 4%; height: 38px"
        @click="refresh"
      />
    </el-col>
  </el-row>
</template>

<script>

export default {
  name: 'Captcha',
  components: {
  },
  props: {
    url: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      value: '',
      key: '',
      image_url: ''
    }
  },
  computed: {
  },
  created() {
    this.refresh()
  },
  methods: {
    refresh() {
      this.$axios.get(
        '/core/auth/captcha/refresh/', {
          headers: {
            'x-requested-with': 'XMLHttpRequest'
          }
        }
      ).then(resp => {
        this.image_url = resp?.image_url
        this.key = resp?.key
      })
    },
    handleInput(value) {
      const data = {
        value: value,
        key: this.key
      }
      this.$emit('input', data)
    }
  }
}
</script>

<style scoped>
</style>
