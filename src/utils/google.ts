import { StyleSpecification } from 'maplibre-gl'

interface Session {
	[key: string]: string // Dynamically typed session data
}

interface SessionRequest {
	mapType: string
	language?: string // Optional property
	region?: string // Optional property
	scale: string
	highDpi: boolean
	layerTypes?: string[] // Optional property
	overlay?: boolean // Optional property
}

const sessions: { [key: string]: Promise<Session> | Session } = {}

export async function googleProtocol(
	params: { url: string },
	abortController?: AbortController,
): Promise<{ data: ArrayBuffer }> {
	const url = new URL(params.url.replace('google://', 'https://'))
	const sessionKey = `${url.hostname}?${url.searchParams.toString()}` // Use toString() for URLSearchParams
	const key = url.searchParams.get('key')

	let value: Promise<Session> | Session | undefined = sessions[sessionKey]
	if (!value) {
		value = new Promise(async (resolve) => {
			const mapType = url.hostname
			const layerType = url.searchParams.get('layerType')
			const overlay = url.searchParams.get('overlay')

			const sessionRequest: SessionRequest = {
				mapType,
				language: 'en-US', // Default value
				region: 'US', // Default value
				scale: 'scaleFactor2x',
				highDpi: true,
			}
			if (layerType) {
				sessionRequest.layerTypes = [layerType]
			}
			if (overlay) {
				sessionRequest.overlay = overlay === 'true'
			}

			try {
				const response = await fetch(`https://tile.googleapis.com/v1/createSession?key=${key}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(sessionRequest),
					signal: abortController?.signal, // If abortController is provided, include it in the signal
				})

				if (!response.ok) {
					throw new Error(`Failed to create session: ${response.statusText}`)
				}

				const result = await response.json()
				sessions[sessionKey] = result.session
				resolve(result.session)
			} catch (error) {
				console.error('Error creating session:', error)
				// Handle error appropriately (e.g., reject promise, throw exception)
			}
		})
		sessions[sessionKey] = value // Store the promise while it's being fetched
		await value
	} else if (value instanceof Promise) {
		await value
	}

	const session = sessions[sessionKey]
	const tile = await fetch(`https://tile.googleapis.com/v1/2dtiles${url.pathname}?session=${session}&key=${key}`)
	const data = await tile.arrayBuffer()
	return { data }
}

export function createGoogleStyle(id: string, mapType: string, key: string): StyleSpecification {
	const style: StyleSpecification = {
		version: 8,
		sources: {},
		layers: [
			{
				id,
				type: 'raster',
				source: id,
			},
		],
	}
	style.sources[id] = {
		type: 'raster',
		tiles: [`google://${mapType}/{z}/{x}/{y}?key=${key}`],
		tileSize: 256,
		attribution: '&copy; Google Maps',
		maxzoom: 19,
	}
	return style
}
