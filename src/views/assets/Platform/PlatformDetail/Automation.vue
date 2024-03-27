<template>
  <el-row>
    <el-col :md="24" :sm="24">
      <IBox v-if="!loading">
        <GenericCreateUpdateForm class="form" v-bind="$data" />
      </IBox>
    </el-col>
  </el-row>
</template>

<script>
import IBox from '@/components/IBox'
import { GenericCreateUpdateForm } from '@/layout/components'
import { platformFieldsMeta, setAutomations, updateAutomationParams } from '../const'
import { mapGetters } from 'vuex'

export default {
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      loading: true,
      initial: {
        automation: {
          ansible_enabled: true
        }
      },
      url: `/api/v1/assets/platforms/`,
      disabled: this.object.internal,
      hasReset: false,
      hasDetailInMsg: false,
      submitMethod: () => 'patch',
      fields: [['', ['automation']]],
      fieldsMeta: platformFieldsMeta(this),
      onSubmit: this.submit,
      canSubmit: !this.object.internal,
      defaultOptions: {},
      afterGetFormValue: (obj) => {
        updateAutomationParams(this, obj)
        return obj
      }
    }
  },
  computed: {
    ...mapGetters(['isSystemAdmin'])
  },
  async mounted() {
    try {
      const { category, type } = this.object
      const url = `/api/v1/assets/categories/constraints/?category=${category.value}&type=${type.value}`
      this.defaultOptions = await this.$axios.get(url)
      await setAutomations(this)
    } finally {
      this.loading = false
    }
  },
  methods: {
    submit(validValues) {
      if (!this.$hasPerm('assets.change_platform') || !this.isSystemAdmin) {
        return this.$message.error(this.$tc('NoPermission'))
      }
      this.$axios.patch(`${this.url}${this.object.id}/`, validValues).then(() => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      })
    }
  }
}
</script>

<style lang='scss' scoped>
>>> {
  .el-cascader {
    width: 100%;
  }

  .item-enable.el-form-item {
    //margin-bottom: 1px;
  }

  .item-method.el-form-item {
    display: inline-block;
    width: 100%;;
    .el-form-item__content {
      width: calc(75% - 50px);
    }
    .el-select {
      width: 100%;
    }
    margin-top: -10px;
  }

  .item-params.el-form-item {
    display: inline-block;
    position: absolute;
    right: 18px;
    margin-top: -10px;
  }
}

</style>
