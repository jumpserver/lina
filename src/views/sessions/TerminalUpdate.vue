<template>
  <GenericCreateUpdatePage :fields="fields" :url="url" :fields-meta="fieldsMeta" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getAllCommandStorage, getAllReplayStorage } from '@/api/sessions'

export default {
  name: 'TerminalUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      url: '/api/v1/terminal/terminals/',
      fields: [
        [this.$t('sessions.info'), ['name', 'remote_addr', 'command_storage', 'replay_storage']],
        [this.$tco('Other'), ['comment']]
      ],
      fieldsMeta: {
        command_storage: {
          type: 'select',
          options: []
        },
        replay_storage: {
          type: 'select',
          options: []
        }
      }
    }
  },
  computed: {
    title() {
      return this.$t('sessions.terminalUpdate')
    },
    cardTitle() {
      return this.terminalData.name
    }
  },
  mounted() {
    this.initialSelect()
  },
  methods: {
    async initialSelect() {
      const commandOptions = await getAllCommandStorage()
      commandOptions.forEach(item => {
        this.fieldsMeta.command_storage.options.push({ label: item.name, value: item.name })
      })
      const replayOptions = await getAllReplayStorage()
      replayOptions.forEach(item => {
        this.fieldsMeta.replay_storage.options.push({ label: item.name, value: item.name })
      })
    }
  }
}
</script>

<style scoped>

</style>
