<template>
  <aside
    :aria-label="t('ChatAIConversations')"
    :class="['conversation-panel', { 'is-open': open }]"
  >
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

      <button
        class="new-conversation"
        :disabled="navigationLocked"
        :title="navigationLocked ? t('ChatAIFinishCurrentTask') : t('ChatAINewConversation')"
        type="button"
        @click="emit('new')"
      >
        <span class="new-conversation__icon"
          ><el-icon><Plus /></el-icon
        ></span>
        <span>{{ t('ChatAINewConversation') }}</span>
        <span class="new-conversation__hint">{{ shortcutHint }}</span>
      </button>

      <div class="conversation-search">
        <el-icon><Search /></el-icon>
        <input
          ref="searchInput"
          v-model="query"
          :aria-label="t('ChatAISearchConversations')"
          :placeholder="t('ChatAISearchConversations')"
          type="search"
          @keydown.esc="handleSearchEscape"
        />
        <button
          v-if="query"
          :aria-label="t('Clear')"
          :title="t('Clear')"
          type="button"
          @click="query = ''"
        >
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </div>

    <div class="conversation-panel__scroll">
      <template v-if="loading && !conversations.length">
        <div v-for="item in 5" :key="item" class="conversation-skeleton">
          <span />
          <span />
        </div>
      </template>

      <div v-else-if="!filteredConversations.length" class="conversation-empty">
        <span class="conversation-empty__icon"
          ><el-icon><ChatLineRound /></el-icon
        ></span>
        <strong>{{ query ? t('ChatAINoSearchResults') : t('ChatAIEmptyHistory') }}</strong>
        <small>
          {{ query ? t('ChatAINoSearchResultsDescription') : t('ChatAIEmptyHistoryDescription') }}
        </small>
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
          >
            <span v-if="editingId === conversation.id" class="conversation-item__body is-editing">
              <input
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
              <small>{{ formatTime(conversation.date_updated) }}</small>
            </span>
            <button
              v-else
              class="conversation-item__select"
              :disabled="navigationLocked"
              :title="navigationLocked ? t('ChatAIFinishCurrentTask') : undefined"
              type="button"
              :aria-current="conversation.id === activeId ? 'page' : undefined"
              @click="select(conversation.id)"
            >
              <span class="conversation-item__body">
                <strong>
                  {{ conversation.title || t('ChatAIUntitledConversation') }}
                </strong>
                <small>{{ formatTime(conversation.date_updated) }}</small>
              </span>
            </button>
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
import { computed, nextTick, ref, watch } from 'vue'
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
  },
  navigationLocked: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'new', 'rename', 'delete', 'close'])
const { t } = useI18n()
const query = ref('')
const searchInput = ref(null)
const editingId = ref('')
const draftTitle = ref('')
let renameInput = null
const shortcutHint = computed(() => {
  if (typeof navigator === 'undefined') return 'Ctrl K'
  const platform = navigator.userAgentData?.platform || navigator.platform || ''
  return /mac|iphone|ipad|ipod/i.test(platform) ? '⌘ K' : 'Ctrl K'
})

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
  if (editingId.value || props.navigationLocked) return
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

function focusSearch() {
  window.setTimeout(() => searchInput.value?.focus(), 80)
}

function handleSearchEscape(event) {
  event.preventDefault()
  event.stopPropagation()
  if (query.value) {
    query.value = ''
    return
  }
  emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (open) nextTick(focusSearch)
  }
)

defineExpose({ focusSearch })
</script>

<style lang="scss" scoped>
.conversation-panel {
  display: flex;
  width: 248px;
  min-width: 248px;
  height: 100%;
  flex-direction: column;
  border-right: 1px solid var(--ai-border, #e9ecef);
  background: var(--ai-surface-muted, #f7f9f8);

  &__top {
    padding: 14px 12px 10px;
  }

  &__label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 4px 10px;
    color: var(--ai-text-secondary, #7c7c7c);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  &__scroll {
    flex: 1;
    padding: 2px 8px 14px;
    overflow: auto;
    scrollbar-width: thin;
    scrollbar-color: rgb(79 88 125 / 18%) transparent;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 40px;
    padding: 8px 14px;
    border-top: 1px solid var(--ai-border, #e9ecef);
    color: var(--ai-text-secondary, #7c7c7c);
    font-size: 10px;
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
  height: 36px;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  border: 1px solid #d5e5e0;
  border-radius: var(--ai-radius-sm, 8px);
  color: var(--ai-primary-dark, #148f76);
  background: #fff;
  cursor: pointer;
  font-size: 11px;
  font-weight: 650;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--ai-primary, #1ab394);
    background: var(--ai-primary-light, #e8f7f3);
  }

  &:disabled {
    border-color: #e1e8e6;
    color: #96aaa5;
    background: #f6f8f7;
    box-shadow: none;
    cursor: not-allowed;
  }

  &__icon {
    display: grid;
    width: 24px;
    height: 24px;
    place-items: center;
    border-radius: 7px;
    color: var(--ai-primary-dark, #148f76);
    background: var(--ai-primary-light, #e8f7f3);
  }

  &__hint {
    margin-left: auto;
    color: #9aa5a2;
    font-size: 9px;
    font-weight: 500;
  }
}

.conversation-search {
  display: flex;
  height: 34px;
  align-items: center;
  gap: 8px;
  margin-top: 9px;
  padding: 0 9px;
  border: 1px solid var(--ai-border, #e9ecef);
  border-radius: var(--ai-radius-sm, 8px);
  color: #8f959e;
  background: #fff;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: var(--ai-primary, #1ab394);
    background: #fff;
    box-shadow: var(--ai-focus-ring, 0 0 0 3px rgb(26 179 148 / 16%));
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

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  button {
    display: grid;
    width: 24px;
    height: 24px;
    flex: 0 0 24px;
    padding: 0;
    place-items: center;
    border: 0;
    border-radius: 6px;
    color: #969ca9;
    background: transparent;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      color: var(--ai-primary-dark, #148f76);
      background: var(--ai-primary-light, #e8f7f3);
      outline: none;
    }
  }
}

.conversation-group {
  margin-top: 12px;

  &__title {
    padding: 0 8px 5px;
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
  min-height: 48px;
  align-items: center;
  padding: 0 5px 0 0;
  border: 0;
  border-radius: var(--ai-radius-sm, 8px);
  color: #606266;
  background: transparent;
  text-align: left;
  transition: all 0.18s ease;

  &::before {
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: 0;
    width: 3px;
    border-radius: 4px;
    content: '';
    opacity: 0;
    background: var(--ai-primary, #1ab394);
  }

  &:hover {
    background: rgb(255 255 255 / 82%);

    .conversation-item__actions {
      opacity: 1;
    }
  }

  &:focus-within .conversation-item__actions {
    opacity: 1;
  }

  &.is-active {
    color: var(--ai-text, #292827);
    background: var(--ai-primary-light, #e8f7f3);
    box-shadow: 0 0 0 1px rgb(26 179 148 / 8%) inset;

    &::before {
      opacity: 1;
    }
  }

  &__body {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 3px;

    &.is-editing {
      padding: 7px 4px 7px 10px;
    }

    strong {
      overflow: hidden;
      font-size: 11px;
      font-weight: 650;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      color: #a2a7b8;
      font-size: 9px;
    }

    input {
      width: 100%;
      height: 25px;
      padding: 0 7px;
      border: 1px solid var(--ai-primary, #1ab394);
      border-radius: 6px;
      outline: 0;
      color: var(--ai-text, #292827);
      background: #fff;
      box-shadow: var(--ai-focus-ring, 0 0 0 3px rgb(26 179 148 / 16%));
      font: inherit;
      font-size: 12px;
      font-weight: 650;
    }
  }

  &__select {
    display: flex;
    min-width: 0;
    min-height: 48px;
    flex: 1;
    align-items: center;
    padding: 7px 4px 7px 10px;
    border: 0;
    border-radius: inherit;
    color: inherit;
    background: transparent;
    cursor: pointer;
    font: inherit;
    text-align: left;

    &:focus-visible {
      outline: 2px solid var(--ai-primary-light-2, #d1efe8);
      outline-offset: -2px;
    }

    &:disabled {
      color: #9299a6;
      cursor: not-allowed;
      opacity: 0.68;
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
    width: 26px;
    height: 26px;
    padding: 0;
    place-items: center;
    border: 0;
    border-radius: 7px;
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
    border-radius: 10px;
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
    visibility: hidden;
    box-shadow: 20px 0 50px rgb(29 33 55 / 17%);
    transition:
      transform 0.25s ease,
      visibility 0s linear 0.25s;

    &.is-open {
      transform: translateX(0);
      visibility: visible;
      transition-delay: 0s;
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
