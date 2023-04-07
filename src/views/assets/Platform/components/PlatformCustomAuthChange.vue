<template>
  <div>
    <el-alert type="success">
      <span v-html="$tc('assets.CustomAuthCommandHelpMessage')" />
    </el-alert>
    <DynamicInputForm
      ref="dynamicFormRef"
      :url="url"
      :input-title="$t('assets.CustomAuthCommand')"
    />
    <div style="text-align: center">
      <el-button type="primary" size="mini" @click="onSubmit"> {{ $t('common.Submit') }} </el-button>
    </div>
  </div>
</template>

<script>
import { DynamicInputForm } from '@/components'

export default {
  components: {
    DynamicInputForm
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      url: `/api/v1/assets/platforms/${this.config.objectId}/automation-commands/?method=${this.config.value}`
    }
  },
  computed: {},
  created() {},
  methods: {
    onSubmit() {
      const commands = this.$refs.dynamicFormRef.getInput()
      this.$axios.put(
        this.url, { commands: commands }
      ).then(() => {
        this.$message.success(this.$tc('common.updateSuccessMsg'))
        this.$emit('close-dialog')
      }).catch(err => {
        const error = err.response.data?.commands.join(',')
        this.$message.error(error)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
