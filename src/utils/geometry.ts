import { Feature, MultiPolygon, Point, Polygon } from 'geojson'
import { booleanContains, booleanPointInPolygon, polygon } from '@turf/turf'

export const findPolygonsInsideBoundary = (
	polygons: Feature<Polygon | MultiPolygon>[],
	boundingCoordinates: number[][],
): Feature<Polygon | MultiPolygon>[] => {
	const boundingPolygon = polygon([boundingCoordinates])

	return polygons.filter((feature) => {
		if (feature.geometry.type === 'Polygon') {
			return booleanContains(boundingPolygon, feature)
		} else if (feature.geometry.type === 'MultiPolygon') {
			return feature.geometry.coordinates.every((polygonCoords) => {
				const polyFeature = polygon(polygonCoords)
				return booleanContains(boundingPolygon, polyFeature)
			})
		}
		return false
	})
}

export const findPointsInsideBoundary = (
	points: Feature<Point>[],
	boundingCoordinates: number[][],
): Feature<Point>[] => {
	const boundingPolygon = polygon([boundingCoordinates])

	return points.filter((point) => {
		if (point.geometry.type === 'Point') {
			return booleanPointInPolygon(point, boundingPolygon)
		}
		return false
	})
}
