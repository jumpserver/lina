<template>
  <IBox :title="title" fa="fa-info-circle" v-bind="$attrs">
    <div class="quick-actions">
      <p v-if="labels.length === 0">{{ $t('Nothing') }}</p>
      <template v-else>
        <el-tag
          v-for="i in labels"
          :key="i.name + i.value"
          class="tag"
          type="info"
        >
          {{ i.name }}:{{ i.value }}
        </el-tag>
      </template>
    </div>
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox'

export default {
  name: '',
  components: {
    IBox
  },
  props: {
    title: {
      type: String,
      default() {
        return this.$t('Tags')
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
    return {}
  }
}
</script>

<style lang='scss' scoped>
.tag {
  margin-right: 4px;
  margin-bottom: 4px;
}
</style>
