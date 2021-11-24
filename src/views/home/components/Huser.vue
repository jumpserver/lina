<template>
  <Hcard v-bind="cardConfig">
    <div>
      这是公告组件
    </div>
  </Hcard>
</template>

<script>
import Hcard from './Hcard.vue'
export default {
  name: 'Huser',
  components: {
    Hcard
  },
  props: {
    title: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      cardConfig: {
        title: '最新公告',
        btnText: '查看更多',
        btnRouteName: 'UserView'
      }
    }
  }
}
</script>
