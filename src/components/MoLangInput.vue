<template>
	<PrismEditor
		class="molang-editor"
		v-model="code"
		:highlight="highlight"
		line-numbers
	/>
	<div class="options">
		<button @click="toggleShouldLoop">
			Execution: {{ executionMode }}
		</button>
		<button v-if="executionMode === 'Manual'" @click="execute">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24"
				viewBox="0 0 24 24"
				width="24"
			>
				<path d="M0 0h24v24H0z" fill="none" />
				<path fill="white" d="M8 5v14l11-7z" />
			</svg>
		</button>
		<button @click="copyCode">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="black"
				width="18px"
				height="18px"
			>
				<path d="M0 0h24v24H0z" fill="none" />
				<path
					fill="white"
					d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
				/>
			</svg>
		</button>
		<button @click="share">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="black"
				width="18px"
				height="18px"
			>
				<path d="M0 0h24v24H0z" fill="none" />
				<path
					stroke="white"
					fill="white"
					d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"
				/>
			</svg>
		</button>
		<button @click="clearCode">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24"
				viewBox="0 0 24 24"
				width="24"
			>
				<path d="M0 0h24v24H0z" fill="none" />
				<path
					fill="white"
					stroke="white"
					d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
				/>
			</svg>
		</button>
		<button @click="resetTime">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24"
				viewBox="0 0 24 24"
				width="24"
			>
				<path
					d="M0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0z"
					fill="none"
				/>
				<path
					fill="white"
					d="M19.04 4.55l-1.42 1.42C16.07 4.74 14.12 4 12 4c-1.83 0-3.53.55-4.95 1.48l1.46 1.46C9.53 6.35 10.73 6 12 6c3.87 0 7 3.13 7 7 0 1.27-.35 2.47-.94 3.49l1.45 1.45C20.45 16.53 21 14.83 21 13c0-2.12-.74-4.07-1.97-5.61l1.42-1.42-1.41-1.42zM15 1H9v2h6V1zm-4 8.44l2 2V8h-2v1.44zM3.02 4L1.75 5.27 4.5 8.03C3.55 9.45 3 11.16 3 13c0 4.97 4.02 9 9 9 1.84 0 3.55-.55 4.98-1.5l2.5 2.5 1.27-1.27-7.71-7.71L3.02 4zM12 20c-3.87 0-7-3.13-7-7 0-1.28.35-2.48.95-3.52l9.56 9.56c-1.03.61-2.23.96-3.51.96z"
				/>
			</svg>
		</button>

		<button @click="clearConsole">Clear Console</button>
	</div>
	<div class="output-row" style="display: flex">
		<div class="molang-output">
			<h1>Output:</h1>
			<p :style="{ color: isOutputError ? '#d62828' : 'unset' }">
				{{ output }}
			</p>
		</div>
		<div class="console-output">
			<h1>Console:</h1>
			<p v-if="consoleOutput.length === 0">[EMPTY]</p>
			<ul v-else>
				<li v-for="(text, i) in consoleOutput" :key="i">{{ text }}</li>
			</ul>
		</div>
	</div>
</template>

<script>
import { MoLang } from 'molang'
import { loadFromUrl, shareMoLang } from '../composables/shareMoLang'

import 'vue-prism-editor/dist/prismeditor.min.css'
import prism from 'prismjs'
import { PrismEditor } from 'vue-prism-editor'

import 'prismjs/themes/prism-tomorrow.css'

/**
 * Taken from JannisX11's MolangJS (https://github.com/JannisX11/MolangJS)
 * Modified to fit our needs
 */
prism.languages.molang = {
	string: /(')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
	'function-name': /\b(?!\d)(math|query|q)\.\w+/i,
	selector: /\b(?!\d)(variable|temp|context|v|t|c)\.\w+/i,
	boolean: /\b(?:true|false)\b/i,
	number: /(?:\b\d+(?:\.\d+)?(?:[ed][+-]\d+)?|&h[a-f\d]+)\b[%&!#]?/i,
	operator: /&&|\|\||[-+*/!<>]=?|[:?=]/i,
	keyword: /\b(return|loop|for_each|continue|break)\b/i,
	punctuation: /[.,;()[\]{}]/,
}

let molang

export default {
	data: () => ({
		startTimestamp: Date.now(),
		lastFrameTimestamp: Date.now(),
		code:
			loadFromUrl() ||
			localStorage.getItem('molang-code') ||
			'math.pow(math.round(query.anim_time), 2)',
		output: 0,
		isOutputError: false,
		consoleOutput: [],
		shouldStopRefresh: false,
		executionMode:
			localStorage.getItem('molang-execution-mode') || 'Manual',
	}),
	mounted() {
		const currentTime = () => (Date.now() - this.startTimestamp) / 1000
		const log = (logVal) => {
			this.consoleOutput.push(logVal)
			return logVal
		}
		molang = new MoLang({
			'query.anim_time': currentTime,
			'query.delta_time': () => Date.now() - this.lastFrameTimestamp,
			'query.life_time': currentTime,
			'query.log': log,
			'query.debug_output': log,
		})

		this.onChange()
		const refresh = () => {
			if (this.shouldStopRefresh) return

			if (this.executionMode === 'Loop') this.execute()
			requestAnimationFrame(refresh)
		}

		refresh()
	},
	unmounted() {
		this.shouldStopRefresh = true
	},
	components: {
		PrismEditor,
	},
	methods: {
		onChange() {
			localStorage.setItem('molang-code', this.code)

			if (this.executionMode === 'On Change') this.execute()
		},
		execute() {
			try {
				this.output = molang.execute(this.code)
				this.isOutputError = false
			} catch (err) {
				this.output = err.message
				this.isOutputError = true
			}

			this.lastFrameTimestamp = Date.now()
		},
		highlight() {
			return prism.highlight(this.code, prism.languages.molang)
		},
		resetTime() {
			this.startTimestamp = Date.now()
			this.lastFrameTimestamp = Date.now()
		},
		copyCode() {
			navigator.clipboard.writeText(this.code)
			window.alert('Successfully copied MoLang code!')
		},
		share() {
			navigator.clipboard.writeText(shareMoLang(this.code))
			window.alert('Successfully copied playground URL!')
		},
		clearCode() {
			if (
				window.confirm(
					'Are you sure that you want to clear the MoLang code?'
				)
			) {
				this.resetTime()
				this.code = ''
			}
		},
		clearConsole() {
			this.consoleOutput = []
		},
		toggleShouldLoop() {
			if (this.executionMode === 'Loop') this.executionMode = 'On Change'
			else if (this.executionMode === 'On Change')
				this.executionMode = 'Manual'
			else if (this.executionMode === 'Manual')
				this.executionMode = 'Loop'

			localStorage.setItem('molang-execution-mode', this.executionMode)
		},
	},
	watch: {
		code() {
			this.onChange()
		},
	},
}
</script>
