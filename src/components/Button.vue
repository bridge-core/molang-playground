<template>
	<button
		class="
			rounded-lg
			bg-[color:var(--v-primary-base,#3B82F6)]
			text-white
			px-2
			py-1
			shadow-lg
			transform
			transition
			hover:scale-110 hover:shadow-4xl
			active:outline-none
			active:ring-4
			active:ring-blue-600
			active:ring-opacity-50
		"
		@click="emit('click')"
	>
		<slot />
	</button>
</template>

<script setup lang="ts">
const emit = defineEmit(['click'])
</script>
