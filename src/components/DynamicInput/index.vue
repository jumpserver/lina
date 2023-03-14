<template>
  <el-form v-on="$listeners">
    <el-divider />
    <el-form-item
      v-for="(command, index) in commands"
      :key="index"
      :prop="'commands.' + index + '.value'"
      :error="errorMessage"
    >
      <el-col :span="21">
        <el-input v-model="command.value" size="mini" :required="true">
          <template slot="prepend"> {{ $t('assets.CustomAuthCommand') + ' ' + (index + 1) }}</template>
        </el-input>
      </el-col>
      <el-col :span="3">
        <el-button
          :disabled="cannotDelete()"
          icon="el-icon-minus"
          size="mini"
          style="flex-shrink: 0;"
          type="danger"
          @click="handleDelete(command)"
        />
        <el-button
          v-if="index === commands.length - 1"
          :disabled="commands.length === 0"
          icon="el-icon-plus"
          size="mini"
          style="flex-shrink: 0;"
          type="primary"
          @click="handleAdd()"
        />
      </el-col>
    </el-form-item>
    <el-form-item style="text-align: center">
      <el-button type="primary" size="mini" @click="handleSubmit()"> {{ $t('common.Submit') }} </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'DynamicInput',
  components: {
  },
  props: {
    url: {
      type: String,
      default: () => ''
    },
    handleSubmit: {
      type: Function,
      default: function() {
        this.defaultHandleSubmit()
      }
    },
    submitMethod: {
      type: String,
      default: () => 'put'
    },
    submitSuccess: {
      type: Function,
      default: function() {}
    }
  },
  data() {
    return {
      readonly: false,
      commands: [],
      errorMessage: ''
    }
  },
  created() {
    if (this.url) {
      this.getData()
    }
  },
  methods: {
    getData() {
      this.$axios.get(this.url).then(resp => {
        resp.commands.map(v => {
          this.commands.push({ value: v })
        })
        if (this.commands.length < 1) {
          this.commands.push({ value: '' })
        }
      })
    },
    defaultHandleSubmit() {
      if (this.url) {
        const commands = this.commands.map(v => { return v.value })
        this.$axios[this.submitMethod](
          this.url, { commands: commands }
        ).catch(
          error => this.setFieldError(error)
        )
      }
      this.$emit('input', this.commands)
      this.submitSuccess()
    },
    handleDelete(command) {
      const index = this.commands.indexOf(command)
      if (index !== -1) {
        this.commands.splice(index, 1)
      }
    },
    handleAdd() {
      this.commands.push({ value: '' })
    },
    cannotDelete() {
      return this.commands.length <= 1
    },
    removeCommand(item) {
      const index = this.commands.indexOf(item)
      if (index !== -1) {
        this.commands.splice(index, 1)
      }
    },
    setFieldError(error) {
      const data = error.response.data
      this.errorMessage = data.commands.join(',')
    }
  }
}
</script>

<style scoped>
</style>
