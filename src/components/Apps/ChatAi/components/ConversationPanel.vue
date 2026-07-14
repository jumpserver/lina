<template>
  <aside :class="['conversation-panel', { 'is-open': open }]">
    <div class="conversation-panel__top">
      <div class="conversation-panel__label">
        <span>{{ t('ChatAIConversations') }}</span>
        <button
          class="icon-button mobile-close"
          :aria-label="t('Close')"
          :title="t('Close')"
          type="button"
          @click="emit('close')"
        >
          <el-icon><Close /></el-icon>
        </button>
      </div>

      <button class="new-conversation" type="button" @click="emit('new')">
        <span class="new-conversation__icon"
          ><el-icon><Plus /></el-icon
        ></span>
        <span>{{ t('ChatAINewConversation') }}</span>
        <span class="new-conversation__hint">⌘ K</span>
      </button>

      <label class="conversation-search">
        <el-icon><Search /></el-icon>
        <input v-model="query" :placeholder="t('ChatAISearchConversations')" type="search" />
      </label>
    </div>

    <div class="conversation-panel__scroll">
      <template v-if="loading">
        <div v-for="item in 5" :key="item" class="conversation-skeleton">
          <span />
          <span />
        </div>
      </template>

      <div v-else-if="!filteredConversations.length" class="conversation-empty">
        <span class="conversation-empty__icon"
          ><el-icon><ChatLineRound /></el-icon
        ></span>
        <strong>{{ t('ChatAIEmptyHistory') }}</strong>
        <small>{{ t('ChatAIEmptyHistoryDescription') }}</small>
      </div>

      <template v-else>
        <section v-for="group in groups" :key="group.key" class="conversation-group">
          <div class="conversation-group__title">{{ group.label }}</div>
          <div
            v-for="conversation in group.items"
            :key="conversation.id"
            :class="[
              'conversation-item',
              {
                'is-active': conversation.id === activeId,
                'is-editing': editingId === conversation.id
              }
            ]"
            role="button"
            tabindex="0"
            @click="select(conversation.id)"
            @keydown.enter="select(conversation.id)"
          >
            <span class="conversation-item__body">
              <input
                v-if="editingId === conversation.id"
                :ref="setRenameInput"
                v-model="draftTitle"
                :aria-label="t('Rename')"
                maxlength="80"
                type="text"
                @blur="commitRename(conversation)"
                @click.stop
                @keydown.enter.prevent.stop="commitRename(conversation)"
                @keydown.esc.prevent.stop="cancelRename"
              />
              <strong v-else @dblclick.stop="startRename(conversation)">
                {{ conversation.title || t('ChatAIUntitledConversation') }}
              </strong>
              <small>{{ formatTime(conversation.date_updated) }}</small>
            </span>
            <span v-if="editingId !== conversation.id" class="conversation-item__actions">
              <button
                class="conversation-item__action"
                type="button"
                :aria-label="t('Rename')"
                :title="t('Rename')"
                @click.stop="startRename(conversation)"
              >
                <el-icon><EditPen /></el-icon>
              </button>
              <button
                class="conversation-item__action conversation-item__delete"
                type="button"
                :aria-label="t('Delete')"
                :title="t('Delete')"
                @click.stop="emit('delete', conversation)"
              >
                <el-icon><Delete /></el-icon>
              </button>
            </span>
          </div>
        </section>
      </template>
    </div>

    <div class="conversation-panel__footer">
      <span class="privacy-dot" />
      <span>{{ t('ChatAIPrivateContext') }}</span>
    </div>
  </aside>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { ChatLineRound, Close, Delete, EditPen, Plus, Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  conversations: {
    type: Array,
    default: () => []
  },
  activeId: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'new', 'rename', 'delete', 'close'])
const { t } = useI18n()
const query = ref('')
const editingId = ref('')
const draftTitle = ref('')
let renameInput = null

const filteredConversations = computed(() => {
  const value = query.value.trim().toLowerCase()
  if (!value) return props.conversations
  return props.conversations.filter((item) => (item.title || '').toLowerCase().includes(value))
})

const groups = computed(() => {
  const today = []
  const previous = []
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  for (const item of filteredConversations.value) {
    const timestamp = new Date(item.date_updated).getTime()
    if (Number.isFinite(timestamp) && timestamp >= start) today.push(item)
    else previous.push(item)
  }

  return [
    { key: 'today', label: t('Today'), items: today },
    { key: 'previous', label: t('ChatAIEarlier'), items: previous }
  ].filter((group) => group.items.length)
})

function formatTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  return new Intl.DateTimeFormat(
    undefined,
    isToday
      ? { hour: '2-digit', minute: '2-digit' }
      : {
          month: 'short',
          day: 'numeric'
        }
  ).format(date)
}

function select(id) {
  if (editingId.value) return
  emit('select', id)
  emit('close')
}

function setRenameInput(element) {
  renameInput = element
}

function startRename(conversation) {
  editingId.value = conversation.id
  draftTitle.value = conversation.title || ''
  nextTick(() => {
    renameInput?.focus()
    renameInput?.select()
  })
}

function cancelRename() {
  editingId.value = ''
  draftTitle.value = ''
}

function commitRename(conversation) {
  if (editingId.value !== conversation.id) return
  const title = draftTitle.value.trim().replace(/\s+/g, ' ').slice(0, 80)
  cancelRename()
  if (!title || title === conversation.title) return
  emit('rename', conversation, title)
}
</script>

<style lang="scss" scoped>
.conversation-panel {
  display: flex;
  width: 272px;
  min-width: 272px;
  height: 100%;
  flex-direction: column;
  border-right: 1px solid var(--ai-border, #e9ecef);
  background: #f5f7fa;

  &__top {
    padding: 21px 16px 12px;
  }

  &__label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 4px 14px;
    color: var(--ai-text-secondary, #7c7c7c);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__scroll {
    flex: 1;
    padding: 2px 10px 18px;
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: rgb(79 88 125 / 18%) transparent;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 45px;
    padding: 10px 18px;
    border-top: 1px solid var(--ai-border, #e9ecef);
    color: var(--ai-text-secondary, #7c7c7c);
    font-size: 11px;
  }
}

.icon-button.mobile-close {
  display: none;
}

.icon-button {
  display: inline-grid;
  width: 30px;
  height: 30px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 9px;
  color: #757c94;
  background: transparent;
  cursor: pointer;
}

.new-conversation {
  display: flex;
  width: 100%;
  height: 44px;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  border: 1px solid var(--ai-primary, #1ab394);
  border-color: var(--ai-primary, #1ab394);
  border-radius: 4px;
  color: #fff;
  background: var(--ai-primary, #1ab394);
  cursor: pointer;
  font-size: 13px;
  font-weight: 650;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--ai-primary-dark, #148f76);
    background: var(--ai-primary-dark, #148f76);
  }

  &__icon {
    display: grid;
    width: 26px;
    height: 26px;
    place-items: center;
    border-radius: 4px;
    color: #fff;
    background: rgb(255 255 255 / 16%);
  }

  &__hint {
    margin-left: auto;
    color: rgb(255 255 255 / 70%);
    font-size: 10px;
    font-weight: 500;
  }
}

.conversation-search {
  display: flex;
  height: 36px;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 0 11px;
  border: 1px solid var(--ai-border, #e9ecef);
  border-radius: 4px;
  color: #8f959e;
  background: #fff;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: var(--ai-primary, #1ab394);
    background: #fff;
    box-shadow: 0 0 0 2px var(--ai-primary-light-2, #d1efe8);
  }

  input {
    width: 100%;
    border: 0;
    outline: 0;
    color: var(--ai-text, #292827);
    background: transparent;
    font-size: 12px;

    &::placeholder {
      color: #8f959e;
    }
  }
}

.conversation-group {
  margin-top: 14px;

  &__title {
    padding: 0 10px 6px;
    color: #8f959e;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
}

.conversation-item {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 54px;
  align-items: center;
  padding: 9px 9px 9px 12px;
  border: 0;
  border-radius: 4px;
  color: #606266;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: all 0.18s ease;

  &::before {
    position: absolute;
    top: 12px;
    bottom: 12px;
    left: 0;
    width: 3px;
    border-radius: 4px;
    content: '';
    opacity: 0;
    background: var(--ai-primary, #1ab394);
  }

  &:hover {
    background: #fff;

    .conversation-item__actions {
      opacity: 1;
    }
  }

  &:focus-within .conversation-item__actions {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid var(--ai-primary-light-2, #d1efe8);
    outline-offset: -2px;
  }

  &.is-active {
    color: var(--ai-text, #292827);
    background: var(--ai-primary-light, #e8f7f3);

    &::before {
      opacity: 1;
    }
  }

  &__body {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 5px;

    strong {
      overflow: hidden;
      font-size: 12px;
      font-weight: 650;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      color: #a2a7b8;
      font-size: 10px;
    }

    input {
      width: 100%;
      height: 25px;
      padding: 0 7px;
      border: 1px solid var(--ai-primary, #1ab394);
      border-radius: 4px;
      outline: 0;
      color: var(--ai-text, #292827);
      background: #fff;
      box-shadow: 0 0 0 2px var(--ai-primary-light-2, #d1efe8);
      font: inherit;
      font-size: 12px;
      font-weight: 650;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    opacity: 0;
    transition: all 0.18s ease;
  }

  &__action {
    display: grid;
    width: 25px;
    height: 25px;
    padding: 0;
    place-items: center;
    border: 0;
    border-radius: 4px;
    color: #a0a5b7;
    background: transparent;
    cursor: pointer;

    &:hover {
      color: var(--ai-primary-dark, #148f76);
      background: var(--ai-primary-light-2, #d1efe8);
    }
  }

  &__delete {
    &:hover {
      color: #d95b69;
      background: #fff0f2;
    }
  }
}

@media (hover: none) {
  .conversation-item__actions {
    opacity: 1;
  }
}

.conversation-empty {
  display: flex;
  align-items: center;
  padding: 48px 18px;
  color: #a0a5b7;
  text-align: center;
  flex-direction: column;

  &__icon {
    display: grid;
    width: 42px;
    height: 42px;
    margin-bottom: 12px;
    place-items: center;
    border-radius: 4px;
    color: var(--ai-primary, #1ab394);
    background: var(--ai-primary-light, #e8f7f3);
    font-size: 20px;
  }

  strong {
    color: #6c7184;
    font-size: 12px;
  }

  small {
    margin-top: 5px;
    font-size: 10px;
    line-height: 1.5;
  }
}

.conversation-skeleton {
  padding: 12px;
  border-radius: 12px;

  span {
    display: block;
    height: 8px;
    border-radius: 6px;
    background: linear-gradient(90deg, #e9ebf2, #f6f7fa, #e9ebf2);
    background-size: 220% 100%;
    animation: skeleton 1.5s linear infinite;

    &:first-child {
      width: 78%;
    }

    &:last-child {
      width: 35%;
      margin-top: 8px;
    }
  }
}

.privacy-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ai-primary, #1ab394);
}

@keyframes skeleton {
  to {
    background-position: -220% 0;
  }
}

@media (max-width: 760px) {
  .conversation-panel {
    position: absolute;
    z-index: 30;
    top: 0;
    bottom: 0;
    left: 0;
    width: min(86vw, 300px);
    transform: translateX(-105%);
    box-shadow: 20px 0 50px rgb(29 33 55 / 17%);
    transition: transform 0.25s ease;

    &.is-open {
      transform: translateX(0);
    }
  }

  .icon-button.mobile-close {
    display: inline-grid;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
