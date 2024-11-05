<template>
  <div>
    <AdhocOpenDialog v-if="showOpenAdhocDialog" :visible.sync="showOpenAdhocDialog" @select="onSelectAdhoc" />
    <el-link :underline="false" type="default" @click="onClick()">
      从模板中获取
    </el-link>
  </div>
</template>

<script>
import AdhocOpenDialog from '@/views/ops/Adhoc/AdhocOpenDialog'

export default {
  name: 'LoadTemplateLink',
  components: {
    AdhocOpenDialog
  },
  props: {},
  data() {
    return {
      showOpenAdhocDialog: false
    }
  },
  watch: {},
  methods: {
    onClick() {
      this.showOpenAdhocDialog = true
    },
    onSelectAdhoc(adhoc) {
      adhoc?.variable.map(item => {
        delete item.id
        delete item.job
        delete item.adhoc
        return item
      })
      this.$emit('change', adhoc)
    }
  }
}
</script>

<style>
</style>
