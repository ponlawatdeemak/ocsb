import { captureMapImage } from './capture'
import pdfMake from 'pdfmake/build/pdfmake'

export const exportPdf = async ({ dialogDiv, fileName }: { dialogDiv: HTMLDivElement | null; fileName: string }) => {
	if (!dialogDiv) {
		throw new Error('exportPdf failed.')
	}

	const dataURL = await captureMapImage(dialogDiv)

	const a4Width = 841
	const dialogRatio = dialogDiv.clientWidth / dialogDiv.clientHeight
	const pdfPageMargin = 40
	const dialogImageWidth = a4Width - pdfPageMargin * 2

	const docDefinition: any = {
		pageSize: 'A4',
		pageOrientation: 'landscape',
		content: [
			{
				image: dataURL,
				width: dialogImageWidth,
				height: dialogImageWidth / dialogRatio,
				alignment: 'center',
				margin: [0, pdfPageMargin / dialogRatio, 0, 0],
			},
		],
	}

	pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = fileName + '.pdf'
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	})
}
