<template>
  <Dialog
    :show-cancel="false"
    :show-confirm="false"
    :title="title"
    :visible.sync="iVisible"
    width="50%"
    top="1vh"
  >
    <p>{{ $t('ops.VariableHelpText') }}</p>
    <el-form>
      <el-form-item v-for="(val,key,index) in variables" :key="index" :label="key+':'">
        <span>{{ val }}</span>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import { Dialog } from '@/components'

export default {
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      title: '内置变量',
      variables: {}
    }
  },
  computed: {
    iVisible: {
      set(val) {
        this.$emit('update:visible', val)
      },
      get() {
        return this.visible
      }
    }
  },
  mounted() {
    this.$axios.get('/api/v1/ops/variables/help').then((data) => {
      this.variables = data
    })
  }
}
</script>

<style scoped>

</style>
