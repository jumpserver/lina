<template>
  <IBox>
    <GenericCreateUpdateForm :object="object" class="form" v-bind="$data" />
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox'
import { GenericCreateUpdateForm } from '@/layout/components'
import { platformFieldsMeta, setAutomations, updateAutomationParams } from '../const'
import { setUrlId } from '@/utils/common'
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

<style lang='scss' scoped>
::v-deep {
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
      width: calc(75% - 50px) !important;
    }

    .el-select {
      width: 100%;
    }

    margin-top: -10px;
  }

  .item-params.el-form-item {
    display: inline-block;
    position: absolute;
    right: 10px;
  }
}

</style>
