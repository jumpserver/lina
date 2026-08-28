<template>
  <span :class="['assistant-mark', `assistant-mark--${size}`, { 'is-active': active }]">
    <span class="assistant-mark__core">
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path
          d="M14 3.5c.6 5.9 4.6 9.9 10.5 10.5-5.9.6-9.9 4.6-10.5 10.5C13.4 18.6 9.4 14.6 3.5 14 9.4 13.4 13.4 9.4 14 3.5Z"
        />
        <circle cx="21.5" cy="6.5" r="2.2" />
      </svg>
    </span>
  </span>
</template>

<script setup>
defineProps({
  active: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium'
  }
})
</script>

<style lang="scss" scoped>
.assistant-mark {
  --mark-size: 34px;
  --mark-radius: 9px;
  position: relative;
  display: inline-flex;
  width: var(--mark-size);
  height: var(--mark-size);
  flex: 0 0 var(--mark-size);
  align-items: center;
  justify-content: center;

  &--small {
    --mark-size: 26px;
    --mark-radius: 7px;
  }

  &--large {
    --mark-size: 56px;
    --mark-radius: 14px;
  }

  &__core {
    position: relative;
    z-index: 1;
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    border-radius: var(--mark-radius);
    color: #fff;
    background: var(--el-color-primary, #1ab394);
    box-shadow: 0 4px 12px rgb(20 143 118 / 17%);
  }

  svg {
    width: 58%;
    height: 58%;
    fill: currentColor;
  }

  &.is-active {
    .assistant-mark__core {
      animation: mark-pulse 1.6s ease-in-out infinite;
    }
  }
}

@keyframes mark-pulse {
  50% {
    box-shadow: 0 6px 20px rgb(20 143 118 / 30%);
    opacity: 0.72;
    transform: scale(1.03);
  }
}

@media (prefers-reduced-motion: reduce) {
  .assistant-mark * {
    animation: none !important;
  }
}
</style>
