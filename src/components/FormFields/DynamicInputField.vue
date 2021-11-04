<template>
  <IBox fa="fa-info-circle">
    <el-form :model="dynamicValidateForm" v-on="$listeners">
      <el-form-item
        v-for="(command, index) in dynamicValidateForm.commands"
        :key="command.key"
        :label="$t('xpack.CustomCommand') + '' + (index + 1)"
        :prop="'commands.' + index + '.value'"
        size="mini"
        :error="errorMessage"
      >
        <el-input v-model="command.value" @blur="sendCommand" />
        <el-button @click.prevent="removeCommand(command)">{{ $t('common.Delete') }}</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="addCommand">{{ $t('common.Add') }}</el-button>
      </el-form-item>
    </el-form>
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'
export default {
  name: 'DynamicInputField',
  components: {
    IBox
  },
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dynamicValidateForm: {
        commands: [{
          value: ''
        }]
      },
      errorMessage: ''
    }
  },
  methods: {
    addCommand() {
      this.dynamicValidateForm.commands.push({
        value: '',
        key: Date.now()
      })
    },
    removeCommand(item) {
      const index = this.dynamicValidateForm.commands.indexOf(item)
      if (index !== -1) {
        this.dynamicValidateForm.commands.splice(index, 1)
      }
    },
    sendCommand() {
      this.$emit('')
    }
  }
}
</script>

<style scoped>
</style>
