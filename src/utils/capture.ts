import html2canvas from 'html2canvas'

export const captureMapImage = async (div: HTMLDivElement) => {
	if (!div) return null

	try {
		const canvas = await html2canvas(div, {
			useCORS: true,
			allowTaint: true,
			scale: 2,
		})
		const dataURL = canvas.toDataURL('image/png')
		return dataURL
	} catch (error) {
		console.error('Error capturing div:', error)
		return null
	}
}

export const captureScaleImage = async (scaleElement: HTMLElement) => {
	if (!scaleElement) return null

	// Get device pixel ratio (DPR) for high-resolution capture
	const dpr = window.devicePixelRatio || 1

	try {
		const canvas = await html2canvas(scaleElement, {
			backgroundColor: null, // Transparent background
			logging: false,
			useCORS: true,
			scale: dpr, // High-resolution capture
		})
		const dataURL = canvas.toDataURL('image/png')
		return dataURL
	} catch (error) {
		console.error('Error capturing div:', error)
		return null
	}
}

export const captureMiniMap = async (base64Map: string, width: number, height: number): Promise<string> => {
	return new Promise((resolve): void => {
		// Get device pixel ratio (DPR) for high-resolution capture
		const dpr = window.devicePixelRatio || 1

		const finalCanvas = document.createElement('canvas')
		finalCanvas.width = width * dpr // Adjust based on DPR
		finalCanvas.height = height * dpr
		const ctx = finalCanvas.getContext('2d')
		const img1 = new Image()

		const imgLoad = (): void => {
			if (ctx) {
				ctx.scale(dpr, dpr)
				ctx.drawImage(img1, 0, 0, width, height)
				resolve(ctx.canvas.toDataURL('image/png'))
			}
		}

		img1.onload = imgLoad
		img1.src = base64Map
	})
}

export const captureMapWithScale = async (
	base64Map: string,
	base64Swipe: string,
	width: number,
	height: number,
	margin: number,
): Promise<string> => {
	return new Promise((resolve): void => {
		// Get device pixel ratio (DPR) for high-resolution capture
		const dpr = window.devicePixelRatio || 1

		const finalCanvas = document.createElement('canvas')
		finalCanvas.width = width * dpr // Adjust based on DPR
		finalCanvas.height = height * dpr
		const ctx = finalCanvas.getContext('2d')
		let imgLoadCounter = 0
		const img1 = new Image()
		const img2 = new Image()
		const imgLoad = (): void => {
			imgLoadCounter++
			if (ctx && imgLoadCounter === 2) {
				ctx.scale(dpr, dpr)
				ctx.drawImage(img1, 0, 0, width, height)
				const scaleWidth = img2.width / dpr
				const scaleHeight = img2.height / dpr
				const scaleX = width - scaleWidth - margin * dpr // Right: 10px
				const scaleY = height - scaleHeight - margin * dpr // Bottom: 10px
				ctx.drawImage(img2, scaleX, scaleY, scaleWidth, scaleHeight)
				resolve(ctx.canvas.toDataURL('image/png'))
			}
		}
		img1.onload = imgLoad
		img2.onload = imgLoad
		img1.src = base64Map
		img2.src = base64Swipe
	})
}
