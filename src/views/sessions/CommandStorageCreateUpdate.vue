<template>
  <div v-if="!loading">
    <GenericCreateUpdatePage
      :fields="selectFields"
      :url="url"
      :initial="initial"
      :update-success-next-route="successUrl"
      :create-success-next-route="successUrl"
      :clean-form-value="cleanFormValue"
      :object="formData"
      :fields-meta="fieldsMeta"
    />
  </div>
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { getCommandStorage } from '@/api/sessions'
export default {
  name: 'CommandStorageUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      loading: true,
      formData: {
        type: '',
        name: '',
        comment: ''
      },
      commandStorageData: {},
      successUrl: { name: 'Storage', params: { activeMenu: 'command' }},

      fieldsMeta: {
        name: {
          label: this.$t('sessions.name')
        },
        comment: {
          label: this.$t('sessions.comment')
        },
        type: {
          type: 'select',
          label: this.$t('sessions.type'),
          disabled: true,
          rules: [
            { required: true }
          ]
        },
        hosts: {
          label: this.$t('sessions.hosts'),
          rules: [
            { required: true }
          ]
        },
        index: {
          label: this.$t('sessions.index'),
          rules: [
            { required: true }
          ]
        },
        doc_type: {
          label: this.$t('sessions.docType'),
          rules: [
            { required: true }
          ]
        }
      },
      fieldsMap: {
        es: ['name', 'type', 'hosts', 'index', 'doc_type', 'comment']
      },
      url: '/api/v1/terminal/command-storages/'
    }
  },
  computed: {
    selectFields() {
      return this.fieldsMap[this.currentType]
    },
    initial() {
      return { type: this.currentType }
    },
    currentType() {
      const params = this.$route.params
      const query = this.$route.query
      if (params.id) {
        return this.formData.type
      } else if (query.type) {
        return query.type
      }
      return 'es'
    }
  },
  mounted() {
    const params = this.$route.params
    const query = this.$route.query
    if (params.id) {
      getCommandStorage(this.$route.params.id).then(data => {
        this.commandStorageData = data
        this.formData = this.convertMataToForm(this.commandStorageData)
        this.loading = false
      })
    }
    if (query.type) {
      this.loading = false
    }
  },
  methods: {
    convertMataToForm(commandStorageData) {
      switch (commandStorageData.type.toLowerCase()) {
        case 'es':
          return this.esMetaToForm(commandStorageData)
        default:
          return {}
      }
    },
    esMetaToForm(commandStorageData) {
      const hosts = commandStorageData.meta.HOSTS.join(',')
      return {
        name: commandStorageData.name,
        type: commandStorageData.type,
        comment: commandStorageData.comment,
        hosts: hosts,
        index: commandStorageData.meta.INDEX,
        doc_type: commandStorageData.meta.DOC_TYPE
      }
    },
    cleanFormValue(value) {
      switch (value.type.toLowerCase()) {
        case 'es':
          return this.createEsMeta(value)
      }
      return value
    },
    createEsMeta(value) {
      const host_array = value.hosts.split(',').map(item => (item.trim()))
      return {
        name: value.name,
        type: 'es',
        comment: value.comment,
        meta: {
          es_hosts: host_array,
          es_index: value.index,
          es_doc_type: value.doc_type
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
