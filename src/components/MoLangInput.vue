<template>
	<Editor v-model="code" />

	<div
		class="absolute p-2 pt-0 top-0 right-0 w-1/3 h-screen overflow-y-scroll"
	>
		<div
			class="
				py-2
				mb-4
				sticky
				top-0
				flex flex-wrap
				gap-2
				bg-[color:var(--v-background-base,#171717)]
			"
		>
			<Button @click="toggleShouldLoop">
				Execution: {{ executionMode }}
			</Button>
			<Button v-if="executionMode === 'Manual'" @click="execute">
				<Play />
			</Button>
			<Button v-if="!embedded" @click="copyCode">
				<Copy />
			</Button>
			<Button v-if="!embedded" @click="share">
				<Share />
			</Button>
			<Button v-if="!embedded" @click="clearCode">
				<Clear />
			</Button>
			<Button @click="resetTime">
				<Time />
			</Button>

			<Button @click="clearConsole">Clear Console</Button>
		</div>

		<div class="tile mb-4">
			<h1 class="text-2xl">Output:</h1>
			<p :style="{ color: isOutputError ? '#d62828' : 'unset' }">
				{{ output }}
			</p>
		</div>

		<div class="tile mb-4">
			<h1 class="text-2xl">query.anim_time:</h1>
			{{ currentAnimTime }}
		</div>

		<div class="tile">
			<h1 class="text-2xl">Console:</h1>
			<p v-if="consoleOutput.length === 0">[EMPTY]</p>
			<ul v-else>
				<li v-for="(text, i) in consoleOutput" :key="i">
					{{ text }}
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useNow } from '@vueuse/core'
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { MoLang } from 'molang'
import { loadFromUrl, shareMoLang } from '../composables/shareMoLang'
import Editor from './Editor.vue'
import Button from './Button.vue'
import Time from './Icons/Time.vue'
import Clear from './Icons/Clear.vue'
import Share from './Icons/Share.vue'
import Copy from './Icons/Copy.vue'
import Play from './Icons/Play.vue'
const props = defineProps<{ embedded: boolean }>()

let molang: MoLang
let startTimestamp = Date.now()
let lastFrameTimestamp = Date.now()
const code = ref(
	loadFromUrl() ||
		localStorage.getItem('molang-code') ||
		'math.pow(math.round(query.anim_time), 2)'
)
const output = ref(0)
const isOutputError = ref(false)
const consoleOutput = ref([])
const shouldStopRefresh = ref(false)
const executionMode = ref(
	localStorage.getItem('molang-execution-mode') || 'Manual'
)

const now = useNow()
const currentAnimTime = ref<number>(0)

onMounted(() => {
	const currentTime = () => (Date.now() - startTimestamp) / 1000
	const log = (logVal) => {
		consoleOutput.value.push(logVal)
		return logVal
	}
	molang = new MoLang({
		'query.anim_time': currentTime,
		'query.delta_time': () => Date.now() - lastFrameTimestamp,
		'query.life_time': currentTime,
		'query.log': log,
		'query.debug_output': log,
	})

	onChange()
	const refresh = () => {
		if (shouldStopRefresh.value) return

		currentAnimTime.value = currentTime()

		if (executionMode.value === 'Loop') execute()
		requestAnimationFrame(refresh)
	}

	refresh()
})
onUnmounted(() => {
	shouldStopRefresh.value = true
})

function onChange() {
	localStorage.setItem('molang-code', code.value)

	if (executionMode.value === 'On Change') execute()
}
function execute() {
	try {
		output.value = molang.execute(code.value)
		isOutputError.value = false
	} catch (err) {
		output.value = err.message
		isOutputError.value = true
	}

	lastFrameTimestamp = Date.now()
}

function resetTime() {
	startTimestamp = Date.now()
	lastFrameTimestamp = Date.now()
}
function copyCode() {
	navigator.clipboard.writeText(code.value)
}
function share() {
	navigator.clipboard.writeText(shareMoLang(code.value))
}
function clearCode() {
	if (
		window.confirm('Are you sure that you want to clear the MoLang code?')
	) {
		resetTime()
		code.value = ''
	}
}
function clearConsole() {
	consoleOutput.value = []
}
function toggleShouldLoop() {
	if (executionMode.value === 'Loop') executionMode.value = 'On Change'
	else if (executionMode.value === 'On Change') executionMode.value = 'Manual'
	else if (executionMode.value === 'Manual') executionMode.value = 'Loop'

	localStorage.setItem('molang-execution-mode', executionMode.value)
}

watch(code, () => onChange())
</script>
