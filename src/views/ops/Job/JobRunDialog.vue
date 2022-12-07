<template>
  <Dialog
    v-if="iVisible && ready"
    :title="$tc('ops.RunJob')"
    :visible.sync="iVisible"
    width="50%"
    top="1vh"
    :show-cancel="false"
    :show-confirm="false"
  >
    <el-form ref="form" :model="form" label-width="140px">
      <el-form-item v-for="(i, key, index) in vars" :key="index" :label="i.label">
        <div v-if="i.type === 'select'">
          <el-select v-model="form[key]">
            <el-option
              v-for="option in i.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
        <div v-else>
          <el-input v-model="form[key]" />
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">执行</el-button>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'

export default {
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      ready: false,
      vars: {},
      form: {}
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
    this.vars = JSON.parse(this.item.parameters_define)
    for (const key of Object.keys(this.vars)) {
      this.$set(this.form, key, this.vars[key].default || '')
    }
    this.ready = true
  },
  methods: {
    onSubmit() {
      this.$emit('submit', this.item, JSON.stringify(this.form))
      this.iVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.el-row-divider {
  margin-bottom: 20px;
}

.select-prop-label {
  float: right;
  padding-right: 30px;
}

</style>
