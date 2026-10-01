<script setup lang="ts">
import { computed } from 'vue'
import { useData, type DefaultTheme } from 'vitepress'
import SectionContentsList from './SectionContentsList.vue'

const props = defineProps<{ root: string }>()
const { theme } = useData<DefaultTheme.Config>()

function normalizeLink(link: string): string {
  return link.replace(/\/$/, '')
}

function findSection(items: DefaultTheme.SidebarItem[]): DefaultTheme.SidebarItem | undefined {
  for (const item of items) {
    if (item.link && normalizeLink(item.link) === normalizeLink(props.root)) {
      return item
    }
    const match = item.items && findSection(item.items)
    if (match) return match
  }
}

const items = computed(() => {
  const sidebar = theme.value.sidebar
  if (!Array.isArray(sidebar)) return []
  return findSection(sidebar)?.items ?? []
})
</script>

<template>
  <SectionContentsList v-if="items.length" :items="items" />
</template>
