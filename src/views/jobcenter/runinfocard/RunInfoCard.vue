<template>
  <IBox :fa="icon" :type="type" :title="title" v-bind="$attrs">
    <table class="run-info">
      <tr>
        <td>{{ content.hostname }}</td>
        <td>{{ content.result }}</td>
      </tr>
    </table>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'

export default {
  name: 'RunInfoCard',
  components: {
    IBox
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    content: {
      type: Object,
      default: () => ({})
    },
    url: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'primary'
    }
  }
}
</script>

<style scoped>
.run-info {
  line-height: 1.43;
  padding: 8px;
  vertical-align: top;
  font-size: 13px;
}
.run-info > tr:first-child > td:first-child {
  width: 150px;
}
</style>
