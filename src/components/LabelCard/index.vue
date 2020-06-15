<template>
  <IBox fa="fa-info-circle" :title="title" v-bind="$attrs">
    <div class="quick-actions">
      <p v-if="iTag.length === 0">{{ $t('common.Nothing') }}</p>
      <el-tag v-for="i in iTag" :key="i" type="info">{{ i }}</el-tag>
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
      iTag: []
    }
  },
  mounted() {
    this.$axios.get(`/api/v1/assets/labels/`).then(res => {
      if (this.labels === []) {
        return
      }
      for (const i in res) {
        if (this.labels.indexOf(res[i].id) > -1) {
          this.iTag.push(res[i].name)
        }
      }
    })
  }
}
</script>

<style lang='less' scoped>

</style>
