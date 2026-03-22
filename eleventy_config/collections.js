import fs from 'node:fs'
import path from 'node:path'
import { kml } from '@tmcw/togeojson'
import { DOMParser } from '@xmldom/xmldom'

function generateTrackSvg(kmlPath) {
  const xml = fs.readFileSync(kmlPath, 'utf-8')
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const geojson = kml(doc)

  const coords = geojson.features
    .filter(f => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString')
    .flatMap((f) => {
      if (f.geometry.type === 'MultiLineString')
        return f.geometry.coordinates.flat()
      return f.geometry.coordinates
    })

  if (coords.length < 2)
    return null

  const lngs = coords.map(c => c[0])
  const lats = coords.map(c => c[1])
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)

  const padding = 10
  const width = 200 - padding * 2
  const height = 120 - padding * 2
  const rangeX = maxLng - minLng || 1
  const rangeY = maxLat - minLat || 1

  const scale = Math.min(width / rangeX, height / rangeY)
  const offsetX = padding + (width - rangeX * scale) / 2
  const offsetY = padding + (height - rangeY * scale) / 2

  const points = coords
    .map(c => `${(offsetX + (c[0] - minLng) * scale).toFixed(1)},${(offsetY + (maxLat - c[1]) * scale).toFixed(1)}`)
    .join(' ')

  return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/></svg>`
}

export default function (eleventyConfig) {
  // 收集所有标签
  eleventyConfig.addCollection('tagList', (collection) => {
    const tagsSet = new Set()
    collection.getAll().forEach((item) => {
      if (!item.data.tags)
        return
      item.data.tags.filter(tag => !['post', 'posts', 'all'].includes(tag)).forEach(tag => tagsSet.add(tag))
    })
    return [...tagsSet].sort()
  })

  // 徒步记录列表
  eleventyConfig.addCollection('hikeList', collection =>
    collection.getAll()
      .filter(item => item.data.layout === 'map-post.njk')
      .sort((a, b) => b.date - a.date)
      .map((item) => {
        const dir = path.dirname(item.inputPath)
        const md = fs.readFileSync(item.inputPath, 'utf-8')
        const match = md.match(/```map\s*\n(.+?\.kml)\s*\n```/)
        const kmlFile = match?.[1]
        if (kmlFile) {
          const kmlPath = path.join(dir, kmlFile)
          if (fs.existsSync(kmlPath)) {
            item.data.trackSvg = generateTrackSvg(kmlPath)
          }
        }
        return item
      }))
}
