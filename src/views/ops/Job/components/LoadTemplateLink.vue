<template>
  <div>
    <AdhocOpenDialog
      v-if="showOpenAdhocDialog"
      v-model:visible="showOpenAdhocDialog"
      @select="onSelectAdhoc"
    />
    <el-link underline="never" type="default" @click="onClick()">
      {{ $t('LoadTemplate') }}
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
  data() {
    return {
      showOpenAdhocDialog: false
    }
  },
  methods: {
    onClick() {
      this.showOpenAdhocDialog = true
    },
    onSelectAdhoc(adhoc) {
      adhoc?.variable.map((item) => {
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

<style></style>
