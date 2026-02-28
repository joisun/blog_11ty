/**
 * 3D Tag Cloud Engine
 * Renders tag items inside a container as a rotating 3D sphere.
 * Supports mouse drag, mouse-follow, and touch interactions.
 *
 * Usage: initTagCloud(containerElement)
 */
// eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars
function initTagCloud(cloud) {
  const items = Array.from(cloud.querySelectorAll('.tag-item'))
  const n = items.length
  if (n === 0)
    return null

  // Count → font-size mapping
  let minCount = Infinity
  let maxCount = 0
  items.forEach((tag) => {
    const c = Number.parseInt(tag.dataset.count)
    minCount = Math.min(minCount, c)
    maxCount = Math.max(maxCount, c)
  })
  items.forEach((tag) => {
    const c = Number.parseInt(tag.dataset.count)
    const t = maxCount === minCount ? 0.5 : (c - minCount) / (maxCount - minCount)
    tag.style.fontSize = `${0.85 + t * 0.9}rem`
    tag.style.fontWeight = t > 0.6 ? '600' : '400'
  })

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cloud.style.visibility = 'visible'
    return null
  }

  // Fibonacci sphere distribution
  function calcRadius() {
    const factor = cloud.clientWidth < 500 ? 0.46 : 0.48
    return Math.min(cloud.clientWidth, cloud.clientHeight) * factor
  }

  let radius = calcRadius()
  const points = []
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1 || 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = goldenAngle * i
    points.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r })
  }

  // Rotation state (accumulated matrix, avoids Euler angle coupling)
  let rotMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]
  let speedX = 0.0003
  let speedY = 0.0005
  let targetSpeedX = speedX
  let targetSpeedY = speedY
  let animId = null

  // --- Drag interaction ---
  let isDragging = false
  let lastMouseX = 0
  let lastMouseY = 0

  cloud.addEventListener('mousedown', (e) => {
    isDragging = true
    lastMouseX = e.clientX
    lastMouseY = e.clientY
    cloud.style.cursor = 'grabbing'
    e.preventDefault()
  })

  cloud.addEventListener('mouseleave', () => {
    if (!isDragging) {
      targetSpeedX = 0.0003
      targetSpeedY = 0.0005
    }
  })

  // --- Touch support ---
  cloud.addEventListener('touchstart', (e) => {
    isDragging = true
    lastMouseX = e.touches[0].clientX
    lastMouseY = e.touches[0].clientY
  }, { passive: true })

  cloud.addEventListener('touchmove', (e) => {
    if (!isDragging)
      return
    const dx = e.touches[0].clientX - lastMouseX
    const dy = e.touches[0].clientY - lastMouseY
    targetSpeedY = dx * 0.0004
    targetSpeedX = -dy * 0.0004
    lastMouseX = e.touches[0].clientX
    lastMouseY = e.touches[0].clientY
  }, { passive: true })

  cloud.addEventListener('touchend', () => {
    isDragging = false
    setTimeout(() => {
      if (!isDragging) {
        targetSpeedX = 0.0003
        targetSpeedY = 0.0005
      }
    }, 2000)
  })

  // --- Matrix math ---
  function mulMat(a, b) {
    return [
      a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
      a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
      a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
      a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
      a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
      a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
      a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
      a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
      a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
    ]
  }

  function makeRot(ax, ay) {
    const cosX = Math.cos(ax)
    const sinX = Math.sin(ax)
    const cosY = Math.cos(ay)
    const sinY = Math.sin(ay)
    return [cosY, sinX * sinY, cosX * sinY, 0, cosX, -sinX, -sinY, sinX * cosY, cosX * cosY]
  }

  function applyMatrix(p, m) {
    return {
      x: m[0] * p.x + m[1] * p.y + m[2] * p.z,
      y: m[3] * p.x + m[4] * p.y + m[5] * p.z,
      z: m[6] * p.x + m[7] * p.y + m[8] * p.z,
    }
  }

  // --- Render loop ---
  function render() {
    speedX += (targetSpeedX - speedX) * 0.05
    speedY += (targetSpeedY - speedY) * 0.05

    const delta = makeRot(speedX, speedY)
    rotMatrix = mulMat(delta, rotMatrix)

    const cw = cloud.clientWidth / 2
    const ch = cloud.clientHeight / 2

    for (let i = 0; i < n; i++) {
      const p = applyMatrix(points[i], rotMatrix)
      const scale = (p.z + 1.5) / 2.5
      const opacity = 0.15 + scale * 0.85
      const x = cw + p.x * radius
      const y = ch + p.y * radius
      const el = items[i]
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${0.6 + scale * 0.5})`
      el.style.opacity = opacity
      el.style.zIndex = Math.round(scale * 100)
    }

    cloud.style.visibility = 'visible'
    animId = requestAnimationFrame(render)
  }

  render()

  // Pause when tab is hidden
  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(animId)
    }
    else {
      animId = requestAnimationFrame(render)
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  const onMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - lastMouseX
      const dy = e.clientY - lastMouseY
      targetSpeedY = dx * 0.003
      targetSpeedX = -dy * 0.003
      lastMouseX = e.clientX
      lastMouseY = e.clientY
    }
    else {
      const rect = cloud.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)
      const dy = (e.clientY - cy) / (rect.height / 2)
      targetSpeedX = -dy * 0.001
      targetSpeedY = dx * 0.001
    }
  }

  const onMouseUp = () => {
    if (isDragging) {
      isDragging = false
      cloud.style.cursor = ''
    }
  }

  const onResize = () => {
    radius = calcRadius()
  }
  window.addEventListener('resize', onResize)

  // Re-bindable listeners on window (for cleanup)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)

  // Return destroy function
  return function destroy() {
    cancelAnimationFrame(animId)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('resize', onResize)
    items.forEach((el) => {
      el.style.transform = ''
      el.style.opacity = ''
      el.style.zIndex = ''
      el.style.fontSize = ''
      el.style.fontWeight = ''
    })
    cloud.style.visibility = ''
    cloud.style.cursor = ''
  }
}
