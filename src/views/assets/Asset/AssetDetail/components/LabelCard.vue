<template>
  <IBox fa="fa-info-circle" :title="title" v-bind="$attrs">
    <div class="quick-actions">
      <p v-if="iLabels.length === 0">{{ $t('common.Nothing') }}</p>
      <el-tag v-for="i in iLabels" :key="i.name + i.value" type="info">{{ i.name }}:{{ i.value }}</el-tag>
    </div>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'
export default {
  name: '',
  components: {
    IBox
  },
  props: {
    title: {
      type: String,
      default() {
        return this.$t('assets.Label')
      }
    },
    labels: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      iLabels: []
    }
  },
  mounted() {
    this.$axios.get(`/api/v1/assets/labels/`).then(res => {
      for (const i in res) {
        if (this.labels.indexOf(res[i].id) > -1) {
          this.iLabels.push(res[i])
        }
      }
    })
  }
}
</script>

<style lang='less' scoped>

</style>
