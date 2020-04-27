<template>
  <GenericCreateUpdatePage
    :create-success-next-route="createSuccessUrl"
    :clean-form-value="cleanFormValue"
    :fields="selectFields"
    :initial="selectInitial"
    :fields-meta="selectFieldsMeta"
    :url="url"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'

export default {
  name: 'CommandStorageCreate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      createSuccessUrl: { name: 'Storage' },
      es: {
        initial: {
          type: 'es'
        },
        fields: [
          ['', ['name', 'type', 'hosts', 'index', 'doc_type', 'comment']]
        ],
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
        }
      },
      url: '/api/v1/terminal/command-storages/'
    }
  },
  computed: {
    postUrl() {
      return this.url
    },
    selectInitial() {
      return this.renderFieldObject.initial
    },
    selectFields() {
      return this.renderFieldObject.fields
    },
    selectFieldsMeta() {
      return this.renderFieldObject.fieldsMeta
    },
    renderFieldObject() {
      const storageType = this.$route.query.type
      if (typeof storageType !== 'string') {
        return this.es
      }
      switch (storageType.toLowerCase()) {
        case 'es':
          return this.es
        default:
          return this.es
      }
    }
  },
  methods: {
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
