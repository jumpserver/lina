<template>
  <div v-if="ready">
    <GenericCreateUpdatePage v-bind="$data" />
  </div>
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import CodeEditor from '@/components/FormFields/CodeEditor'
import AssetSelect from '@/components/AssetSelect'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      ready: false,
      instantTask: false,
      jobType: '',
      url: '/api/v1/ops/jobs/',
      fields: [
        [this.$t('common.Basic'), ['name', 'type', 'instant']],
        [this.$t('common.Task'), ['module', 'args', 'playbook']],
        ['资产', ['assets', 'runas', 'runas_policy']],
        [this.$t('common.Plan'), ['runAfterSave']]
      ],
      initial: {
        type: 'adhoc',
        module: 'shell',
        args: '',
        runas_policy: 'skip',
        runAfterSave: false,
        instant: false
      },
      fieldsMeta: {
        name: {
          hidden: (formValue) => {
            return this.instantTask
          }
        },
        type: {},
        module: {
          hidden: (formValue) => {
            return formValue.type !== 'adhoc'
          }
        },
        playbook: {
          hidden: (formValue) => {
            return formValue.type !== 'playbook'
          },
          el: {
            multiple: false,
            value: [],
            ajax: {
              url: '/api/v1/ops/playbooks/',
              transformOption: (item) => {
                return { label: item.name, value: item.id }
              }
            }
          }
        },
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          label: this.$t('perms.Asset'),
          rules: [{
            required: false
          }],
          el: {
            value: []
          }
        },
        args: {
          hidden: (formValue) => {
            return formValue.type !== 'adhoc'
          },
          component: CodeEditor
        },
        instant: {
          hidden: () => {
            return true
          }
        },
        runAfterSave: {
          label: '保存后立即执行',
          type: 'checkbox',
          hidden: (formValue) => {
            return formValue.instant
          }
        }
      }
    }
  },
  mounted() {
    if (this.$route.query && this.$route.query.type && this.$route.query.id) {
      this.initial.type = 'adhoc'
      switch (this.$route.query.type) {
        case 'adhoc':
          this.initial.type = 'adhoc'
          this.$axios.get(`/api/v1/ops/adhocs/${this.$route.query.id}`).then((data) => {
            this.initial.module = data.module
            this.initial.args = data.args
            this.initial.instant = true
            this.initial.runAfterSave = true
            this.instantTask = true
            this.createSuccessNextRoute = { name: 'Adhoc' }
            this.ready = true
          })
          break
        case 'playbook':
          break
      }
    } else {
      this.ready = true
    }
  }
}

</script>

<style scoped>

</style>
