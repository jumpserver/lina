<template>
  <div v-if="!loading" class="platform-form">
    <GenericCreateUpdatePage
      :after-get-form-value="afterGetFormValue"
      :after-get-remote-meta="handleAfterGetRemoteMeta"
      :clean-form-value="cleanFormValue"
      :clone-name-suffix="1"
      :fields="fields"
      :fields-meta="fieldsMeta"
      :has-detail-in-msg="false"
      :has-reset="false"
      :initial="initial"
      :url="url"
      @submitSuccess="onSubmitSuccess"
    />
  </div>
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { platformFieldsMeta, setAutomations, updateAutomationParams } from './const'

export default {
  name: 'PlatformCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      showDialog: false,
      settingItem: {
        setting: {},
        name: '',
        port: 0
      },
      suMethodLimits: [],
      suMethods: [],
      initial: {
        comment: '',
        charset: 'utf-8',
        category_type: ['host', 'linux'],
        automation: {
          ansible_enabled: true
        }
      },
      fields: [
        [this.$t('Basic'), [
          'name', 'category_type'
        ]],
        [this.$t('Config'), [
          'protocols', 'su_enabled', 'su_method',
          'gateway_enabled', 'ds_enabled',
          'charset'
        ]],
        [this.$t('Automations'), ['automation']],
        [this.$t('Other'), ['comment']]
      ],
      fieldsMeta: platformFieldsMeta(this),
      url: `/api/v1/assets/platforms/`,
      cleanFormValue: (values) => {
        const protocols = values['protocols'] || []
        const automation = values['automation'] || {}
        const category_type = values['category_type']
        const ansibleConfig = automation?.['ansible_config'] || {}
        automation.ansible_config = ansibleConfig instanceof Object ? ansibleConfig : JSON.parse(ansibleConfig)

        if (automation.hasOwnProperty('id')) {
          delete automation['id']
        }
        values['protocols'] = protocols.map(i => {
          if (i.hasOwnProperty('id')) {
            delete i['id']
          }
          return i
        })
        values['category'] = category_type[0]
        values['type'] = category_type[1]
        return values
      },
      afterGetFormValue: (obj) => {
        updateAutomationParams(this, obj)
        if (obj['category'] && obj['type']) {
          obj['category_type'] = [obj['category'].value, obj['type'].value]
        }
        obj.protocols = obj.protocols?.map(i => {
          if (i.name === 'http') {
            i.display_name = 'http(s)'
          }
          return i
        })
        return obj
      },
      defaultOptions: {}
    }
  },
  watch: {},
  async mounted() {
    try {
      await this.setCategories()
      await this.setConstraints()
    } finally {
      this.loading = false
    }
  },
  methods: {
    onSubmitSuccess() {
      this.$store.dispatch('assets/cleanPlatforms')
    },
    updateSuMethodOptions() {
      const options = this.suMethods.filter(i => {
        return this.suMethodLimits.includes(i.value)
      })
      this.fieldsMeta.su_method.options = options
      if (options.length > 0) {
        this.initial.su_method = options[0]?.value
      }
    },
    handleAfterGetRemoteMeta(meta) {
      this.suMethods = meta?.su_method?.choices || []
      this.updateSuMethodOptions()
    },
    async updateSuMethods(constrains) {
      this.suMethodLimits = constrains['su_methods'] || []
      this.updateSuMethodOptions()
      this.initial.su_method = this.suMethodLimits[0]
    },
    async setCategories() {
      const category = this.$route.query.category
      const type = this.$route.query.type
      const state = await this.$store.dispatch('assets/getAssetCategories')
      this.fieldsMeta.category_type.el.options = state.assetCategoriesCascader
      if (category && type) {
        this.initial.category_type = [category, type]
      }
      this.url += `?category=${category}&type=${type}`
      return new Promise((resolve, reject) => resolve(true))
    },
    async setConstraints() {
      const category = this.$route.query.category
      const type = this.$route.query.type
      const url = `/api/v1/assets/categories/constraints/?category=${category}&type=${type}`
      const constraints = await this.$axios.get(url)
      this.defaultOptions = constraints

      let protocols = constraints?.protocols || []
      protocols = protocols?.map(i => {
        if (i.name === 'http') {
          i.display_name = 'http(s)'
        }
        return i
      })
      this.fieldsMeta.protocols.el.choices = protocols

      const fieldsCheck = ['gateway_enabled', 'su_enabled']
      for (const field of fieldsCheck) {
        const disabled = constraints[field] === false
        this.initial[field] = !disabled
        _.set(this.fieldsMeta, `${field}.el.disabled`, disabled)
      }

      const fieldsHidden = ['charset', 'ds_enabled']
      for (const field of fieldsHidden) {
        if (constraints[field] === false) {
          this.fieldsMeta[field].hidden = () => true
        }
      }

      await setAutomations(this)
      await this.updateSuMethods(constraints)
    }
  }
}
</script>

<style lang='scss' scoped>
.platform-form ::v-deep {
  .el-cascader {
    width: 100%;
  }

  .item-enable.el-form-item {
    //margin-bottom: 1px;
  }

  .item-method.el-form-item {
    display: inline-block;
    width: 100%;

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
    right: 10px;
    //margin-top: 22px;
  }
}
</style>

