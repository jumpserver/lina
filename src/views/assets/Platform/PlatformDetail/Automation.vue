<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" :object="object" class="form" />
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox'
import { GenericCreateUpdateForm } from '@/layout/components'
import { platformFieldsMeta, setAutomations, updateAutomationParams } from '../const'
import { setUrlId } from '@/utils/common/index'
import { mapGetters } from 'vuex'

export default {
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const canEdit = !this.object['internal'] && this.$hasPerm('assets.change_platform')
    return {
      loading: true,
      initial: {
        automation: {
          ansible_enabled: true
        }
      },
      url: `/api/v1/assets/platforms/?_meta_cache=0`,
      disabled: !canEdit,
      hasReset: false,
      hasDetailInMsg: false,
      submitMethod: () => 'patch',
      fields: [['', ['automation']]],
      fieldsMeta: platformFieldsMeta(this),
      onSubmit: this.submit,
      canSubmit: canEdit,
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
      await this.setDefaultAutomations()
    } finally {
      this.loading = false
    }
  },
  methods: {
    async setDefaultAutomations() {
      const { category, type } = this.object
      const url = `/api/v1/assets/categories/constraints/?category=${category.value}&type=${type.value}`
      this.defaultOptions = await this.$axios.get(url)
      await setAutomations(this)
    },
    submit(validValues) {
      if (!this.canSubmit || !this.isSystemAdmin) {
        return this.$message.error(this.$tc('NoPermission'))
      }
      const url = setUrlId(this.url, this.object.id)
      this.$axios.patch(url, validValues).then(() => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      })
    }
  }
}
</script>

<style lang="scss" scoped>
:deep() {
  .el-cascader {
    width: 100%;
  }

  // 自动化方法行：method 下拉占满（右侧留出齿轮按钮空间）；params 齿轮按钮通过负 margin
  // 叠加到 method 同一行的最右侧。负 margin = method 行高 30px + FormItem 间距(--form-section-gap)，
  // 既能精确落在 method 行，又不会挤压后续行；绑定 CSS 变量以适配 flex+gap 布局。
  .item-method.el-form-item {
    .el-form-item__content {
      width: calc(100% - 50px) !important;
    }

    .el-select {
      width: 100%;
    }
  }

  .item-params.el-form-item {
    margin-top: calc(-30px - var(--form-section-gap, 20px));

    .el-form-item__label-wrap,
    .el-form-item__label {
      display: none;
    }

    .el-form-item__content {
      width: 100%;
      align-items: flex-end;
      padding-right: 10px;
    }
  }
}
</style>
