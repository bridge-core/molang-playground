import {
	compressToEncodedURIComponent,
	decompressFromEncodedURIComponent,
} from 'lz-string'

export function loadFromUrl() {
	const urlParams = new URLSearchParams(window.location.search)
	const input = urlParams.get('molang')
	if (!input) return

	return decompressFromEncodedURIComponent(input)
}

export function shareMoLang(code: string) {
	const baseUrl = 'https://bridge-core.github.io/molang-playground/?molang='
	const encoded = compressToEncodedURIComponent(code)

	return baseUrl + encoded
}
