import { useCallback } from 'react'
import { useDrag } from 'react-dnd'

export interface BoxProps {
	left: number
	bottom: number
	hideSourceOnDrag?: boolean
	children?: React.ReactNode
}

export const DndButton: React.FC<BoxProps> = ({ left, bottom, hideSourceOnDrag, children }) => {
	const [{ isDragging }, drag] = useDrag(
		() => ({
			type: 'box',
			item: { left, bottom },
			collect: (monitor) => ({
				isDragging: monitor.isDragging(),
			}),
		}),
		[left, bottom],
	)

	const dragRef = useCallback(
		(node: HTMLDivElement) => {
			if (node) drag(node)
		},
		[drag],
	)

	if (isDragging && hideSourceOnDrag) {
		return <div ref={dragRef} />
	}

	return (
		<div
			ref={dragRef}
			style={{
				left,
				bottom: bottom,
			}}
			className='fixed z-[9999] rounded-full border-[1px] border-solid border-gray bg-white p-2 shadow-md hover:!pointer-events-auto hover:cursor-pointer hover:shadow-md'
		>
			{children}
		</div>
	)
}
