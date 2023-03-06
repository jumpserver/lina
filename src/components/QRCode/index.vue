<template>
  <div ref="qrCodeUrl" class="qrcode" />
</template>

<script>
import QRCode from 'qrcodejs2'

export default {
  name: 'QRCode',
  props: {
    url: {
      type: String,
      default: ''
    },
    height: {
      type: Number,
      default: 180
    },
    width: {
      type: Number,
      default: 180
    },
    colorDark: {
      type: String,
      default: '#000000'
    },
    colorLight: {
      type: String,
      default: '#ffffff'
    }
  },
  data() {
    return {}
  },
  mounted() {
    this.createQRCode()
  },
  methods: {
    createQRCode() {
      new QRCode(this.$refs.qrCodeUrl, {
        text: this.url,
        width: this.width,
        height: this.height,
        colorDark: this.colorDark,
        colorLight: this.colorLight,
        correctLevel: QRCode.CorrectLevel.H
      })
    }
  }
}
</script>

<style scoped>
.qrcode{
  display:inline-block;
}
</style>
