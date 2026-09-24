<template>
  <div>
    <BaseTicketList
      :key="url"
      :url="url"
      :extra-ticket-action="tab === 'manual' ? extraTicketAction : { hasCreate: false }"
    >
      <template #tableBefore>
        <div class="ticket-list-filters">
          <el-tabs v-model="tab" class="ticket-list-tabs">
            <el-tab-pane name="manual" :label="$t('TicketManualRequests')" />
            <el-tab-pane name="system" :label="$t('TicketSystemTriggered')" />
            <el-tab-pane name="all" :label="$t('TicketAllRequests')" />
          </el-tabs>
          <el-radio-group v-if="tab !== 'all'" v-model="status" size="small">
            <el-radio-button value="open">{{ $t('TicketInProgress') }}</el-radio-button>
            <el-radio-button value="closed">{{ $t('TicketFinished') }}</el-radio-button>
            <el-radio-button value="all">{{ $t('All') }}</el-radio-button>
          </el-radio-group>
        </div>
      </template>
    </BaseTicketList>
    <TicketTypeDrawer
      v-if="showTicketTypes"
      v-model:visible="showTicketTypes"
      @select-type="selectTicketType"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseTicketList from './BaseTicketList'
import TicketTypeDrawer from './components/TicketTypeDrawer'

const TAB_FILTERS = {
  manual: { origin: 'manual' },
  system: { origin: 'system' },
  all: {}
}

export default {
  name: 'MyTicketList',
  components: {
    BaseTicketList,
    TicketTypeDrawer
  },
  data() {
    return {
      tab: 'manual',
      status: 'open',
      showTicketTypes: false,
      extraTicketAction: {
        onCreate: () => {
          this.showTicketTypes = true
        }
      }
    }
  },
  computed: {
    url() {
      const params = new URLSearchParams({
        applicant: this.currentUser.id,
        ...TAB_FILTERS[this.tab]
      })
      if (this.tab !== 'all' && this.status !== 'all') params.set('status', this.status)
      return `/api/v1/tickets/tickets/?${params.toString()}`
    },
    ...mapGetters(['currentUser'])
  },
  methods: {
    selectTicketType(plugin) {
      this.showTicketTypes = false
      this.$router.push(
        plugin.type === 'apply_asset'
          ? { name: 'RequestAssetPermTicketCreateUpdate' }
          : { name: 'PluginTicketCreate', query: { type: plugin.type } }
      )
    }
  }
}
</script>

<style src="./ticket-list-tabs.css" scoped></style>
