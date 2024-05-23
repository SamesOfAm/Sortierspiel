import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import gsap from 'gsap'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

/**
 * Base
 */
// Debug
const gui = new GUI()
const debugObject = {}
debugObject.color = '#95a7b9'
gui.hide()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

gui.addColor(debugObject, 'color').onChange((color) => {
    fog.color.set(debugObject.color)
})

// Fog
const fog = new THREE.Fog('#95a7b9', 8, 16)
scene.fog = fog


THREE.ColorManagement.enabled = true

// scene.background = new THREE.Color('#231f32')

/**
 * Imported Models
 */
const gltfLoader = new GLTFLoader()

let pines

// Pine Trees
gltfLoader.load(
    '/models/Pine Trees.glb',
    (gltf) => {
        const pines = gltf.scene.children[0]
        for (let i = 0; i < 20; i++) {
            const newPines = pines.clone()
            const angle = Math.random() * Math.PI + (Math.PI * 0.5)
            const radius = 13
            const x = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius
            newPines.scale.x = 7
            newPines.scale.y = 7
            newPines.scale.z = 7
            newPines.position.x = x
            newPines.position.z = z
            newPines.rotation.y = Math.random() * Math.PI
            scene.add(newPines)
        }
    }
)

// House

gltfLoader.load(
    '/models/cabin.glb',
    (gltf) => {
        const house = gltf.scene
        scene.add(house)
        house.scale.x = 2
        house.scale.y = 2
        house.scale.z = 2
        house.position.y = 2.6
        house.position.x = 1
        house.children.forEach(child => {
            child.receiveShadow = true
            child.castShadow = true
        })
    }
)

// Bench

gltfLoader.load(
    '/models/Garden bench.glb',
    (gltf) => {
        const bench = gltf.scene
        scene.add(bench)
        bench.position.set(-2.7, 0.18, 5.04)
        gui.add(bench.position, 'x').min(-15).max(15).step(0.01)
        gui.add(bench.position, 'y').min(-15).max(15).step(0.01)
        gui.add(bench.position, 'z').min(-15).max(15).step(0.01)
        bench.rotation.y = Math.PI - 0.45
    }
)

// Rocks

gltfLoader.load(
    '/models/Rocks.glb',
    (gltf) => {
        const rocks = gltf.scene.children[0]
        scene.add(rocks)
        rocks.position.set(-47, 0, 3)
    }
)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const floorARMTexture = textureLoader.load('/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.jpg')
const floorAlphaTexture = textureLoader.load('/textures/floor/alpha.jpg')
const floorColorTexture = textureLoader.load('/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.jpg')
const floorNormalTexture = textureLoader.load('/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.jpg')
const floorDisplacementTexture = textureLoader.load('/textures/floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.jpg')

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50, 80, 80),
    new THREE.MeshStandardMaterial({
        /* alphaMap: floorAlphaTexture, */
        transparent: true,
        map: floorColorTexture,
        aoMap: floorARMTexture,
        displacementMap: floorDisplacementTexture,
        normalMap: floorNormalTexture,
        roughnessMap: floorARMTexture,
        metalnessMap: floorARMTexture,
        displacementScale: 0.469,
        displacementBias: -0.257
    })
)

gui.add(floor.material, 'displacementScale').min(0).max(1).step(0.001).name('floorDisplacementScale')
gui.add(floor.material, 'displacementBias').min(-1).max(1).step(0.001).name('floorDisplacementBias')

floorColorTexture.colorSpace = THREE.SRGBColorSpace

floorColorTexture.repeat.set(8, 8)
floorARMTexture.repeat.set(8, 8)
floorNormalTexture.repeat.set(8, 8)
floorDisplacementTexture.repeat.set(8, 8)

floorColorTexture.wrapS = THREE.RepeatWrapping
floorColorTexture.wrapT = THREE.RepeatWrapping

floorARMTexture.wrapS = THREE.RepeatWrapping
floorARMTexture.wrapT = THREE.RepeatWrapping

floorNormalTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping

floorDisplacementTexture.wrapS = THREE.RepeatWrapping
floorDisplacementTexture.wrapT = THREE.RepeatWrapping

floor.rotation.x = -Math.PI * 0.5
floor.position.y = 0
floor.name = 'Floor'
scene.add(floor)

// Bushes

const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x89c854 })

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(2.4, 0.2, 2.2)
bush1.name = "Bush 1"

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.9, 0.2, 2.8)
bush2.name = "Bush 2"

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(1.9, 0.1, 2.35)
bush3.name = "Bush 3"

scene.add(bush1, bush2, bush3)

// Bricks

const bricks = new THREE.Group()
scene.add(bricks)

const brickGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.1)

for (let i = 0; i < 10; i++) {
    const brickMaterial = new THREE.MeshStandardMaterial({ color: '#ed6327' })
    const brick = new THREE.Mesh(brickGeometry, brickMaterial)
    bricks.add(brick)
    const radius = 5.5 + Math.random() * 3
    const angle = Math.random() * Math.PI - 1.6
    brick.position.x = Math.sin(angle) * radius
    brick.position.z = Math.cos(angle) * radius
    brick.position.y = 0.01 + Math.random() / 10
    brick.rotation.y = (Math.random() - 0.5) * 0.3
    brick.rotation.x = (Math.random() - 0.5) * 0.2
    brick.rotation.z = (Math.random() - 0.5) * 0.15
    brick.castShadow = true
    brick.name = 'Brick'
}

// Logs

const logs = new THREE.Group()
scene.add(logs)

const logGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 64)

for (let i = 0; i < 10; i++) {
    const logMaterial = new THREE.MeshStandardMaterial({ color: '#cc8d48' })
    logMaterial.colorSpace = THREE.SRGBColorSpace
    const log = new THREE.Mesh(logGeometry, logMaterial)
    logs.add(log)
    const radius = 5.5 + Math.random() * 3
    const angle = Math.random() * Math.PI - 1.6
    log.position.x = Math.sin(angle) * radius
    log.position.z = Math.cos(angle) * radius
    log.position.y = 0.1
    log.rotation.x = Math.PI * 0.5
    log.rotation.z = Math.random() * Math.PI * 2
    log.castShadow = true
    log.name = 'Log'
}

// Gypsum

const gypsum = new THREE.Group()
scene.add(gypsum)

const gypsumGeometry = new THREE.SphereGeometry(0.15, 0.15, 3, 3)

for (let i = 0; i < 10; i++) {
    const gypsumMaterial = new THREE.MeshStandardMaterial({ color: '#fff' })
    gypsumMaterial.colorSpace = THREE.SRGBColorSpace
    const gypsumItem = new THREE.Mesh(gypsumGeometry, gypsumMaterial)
    gypsum.add(gypsumItem)
    const radius = 5.5 + Math.random() * 3
    const angle = Math.random() * Math.PI - 1.6
    gypsumItem.position.x = Math.sin(angle) * radius
    gypsumItem.position.z = Math.cos(angle) * radius
    gypsumItem.position.y = 0.1
    gypsumItem.rotation.x = Math.PI * 0.5
    gypsumItem.rotation.z = Math.random() * Math.PI * 2
    gypsumItem.castShadow = true
    gypsumItem.name = 'Gypsum'
}

/**
 * Piles
 */

// Brick Pile
const brickPile = new THREE.Group()
scene.add(brickPile)

for (let i = 0; i < 20; i++) {
    const brickMaterial = new THREE.MeshStandardMaterial({ color: '#ed6327' })
    brickMaterial.colorSpace = THREE.SRGBColorSpace
    const brick = new THREE.Mesh(brickGeometry, brickMaterial)
    brickPile.add(brick)
    const radius = 0.01 + Math.random() * 0.2
    const angle = Math.random() * Math.PI * 2
    brick.position.x = Math.sin(angle) * radius - 2
    brick.position.z = Math.cos(angle) * radius + 9.5
    brick.position.y = 0.01 + Math.random() / 10
    brick.rotation.y = (Math.random() - 0.5) * 0.3
    brick.rotation.x = (Math.random() - 0.5) * 0.2
    brick.rotation.z = (Math.random() - 0.5) * 0.15
    brick.castShadow = true
    brickPile.name = "Brick Pile"
}

// Log Pile
const logPile = new THREE.Group()
scene.add(logPile)

for (let i = 0; i < 12; i++) {
    const logMaterial = new THREE.MeshStandardMaterial({ color: '#cc8d48' })
    const log = new THREE.Mesh(logGeometry, logMaterial)
    logPile.add(log)
    const radius = 0.07 + Math.random() * 0.5
    const angle = Math.random() * Math.PI * 2
    log.position.x = Math.sin(angle) * radius
    log.position.z = Math.cos(angle) * radius + 9.5
    log.position.y = 0.1
    log.rotation.x = Math.PI * 0.5
    log.rotation.z = Math.random() * Math.PI * 2
    log.castShadow = true
    logPile.name = "Log Pile"
}

// Gypsum Pile
const gypsumPile = new THREE.Group()
scene.add(gypsumPile)

for (let i = 0; i < 42; i++) {
    const gypsumMaterial = new THREE.MeshStandardMaterial({ color: '#fff' })
    gypsumMaterial.colorSpace = THREE.SRGBColorSpace
    const gypsumItem = new THREE.Mesh(gypsumGeometry, gypsumMaterial)
    gypsumPile.add(gypsumItem)
    const radius = 0.04 + Math.random() * 0.4
    const angle = Math.random() * Math.PI * 2
    gypsumItem.position.x = Math.sin(angle) * radius + 2
    gypsumItem.position.z = Math.cos(angle) * radius + 9.5
    gypsumItem.position.y = 0.1
    gypsumItem.rotation.x = Math.PI * 0.5
    gypsumItem.rotation.z = Math.random() * Math.PI * 2
    gypsumItem.castShadow = true
    gypsumPile.name = "Gypsum Pile"
}

/**
 * Fireflies
 */

const fireflies = new THREE.Group()
scene.add(fireflies)

for (let i = 0; i < 2; i++) {
    const firefly = new THREE.PointLight('#00ff00', 0.4, 3)
    firefly.position.y = 0.5
    fireflies.add(firefly)
}

// Trees

/* const trees = new THREE.Group()
scene.add(trees)

const treeTrunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5)
const treeTrunkMaterial = new THREE.MeshStandardMaterial({ color: 'brown' })

const treeLeavesMaterial = new THREE.MeshStandardMaterial({ color: 'green' })

const generateTrees = (amount, distance, dispersion, animationDuration) => {
    for (let i = 0; i <= amount; i++) {
        const partHeight = Math.random() * 0.5 + 0.5;
        const treeLeaves1Geometry = new THREE.ConeGeometry(Math.random() * 0.45 + 1, partHeight + 0.5, 6)
        const treeLeaves11Geometry = new THREE.ConeGeometry(Math.random() * 0.35 + 0.8, partHeight, 6)
        const treeLeaves2Geometry = new THREE.ConeGeometry(Math.random() * 0.25 + 0.55, partHeight * 0.75, 6)
        const treeLeaves3Geometry = new THREE.ConeGeometry(Math.random() * 0.1 + 0.25, partHeight * 0.5, 6)
        const tree = new THREE.Group()
        const treeTrunk = new THREE.Mesh(
            treeTrunkGeometry,
            treeTrunkMaterial
        )
        tree.add(treeTrunk)

        const treeLeaves1 = new THREE.Mesh(
            treeLeaves1Geometry,
            treeLeavesMaterial
        )
        tree.add(treeLeaves1)
        treeLeaves1.position.y = 0.5

        const treeLeaves11 = new THREE.Mesh(
            treeLeaves11Geometry,
            treeLeavesMaterial
        )
        tree.add(treeLeaves11)
        treeLeaves11.position.y = partHeight

        const treeLeaves2 = new THREE.Mesh(
            treeLeaves2Geometry,
            treeLeavesMaterial
        )
        tree.add(treeLeaves2)
        treeLeaves2.position.y = partHeight * 1.75

        const treeLeaves22 = new THREE.Mesh(
            treeLeaves2Geometry,
            treeLeavesMaterial
        )
        tree.add(treeLeaves22)
        treeLeaves22.position.y = partHeight * 2.25


        const treeLeaves3 = new THREE.Mesh(
            treeLeaves3Geometry,
            treeLeavesMaterial
        )
        tree.add(treeLeaves3)
        treeLeaves3.position.y = partHeight * 2.75

        tree.name = 'Tree'
        trees.add(tree)

        const radius = distance + Math.random() * dispersion
        const angle = Math.random() * (Math.PI * 1.5) + Math.PI * 0.25
        tree.position.x = Math.sin(angle) * radius
        tree.position.z = Math.cos(angle) * radius
        tree.position.y = 0.25 + Math.random() / 10
        tree.rotation.y = (Math.random() - 0.5) * 0.3
        tree.rotation.x = (Math.random() - 0.5) * 0.2
        tree.rotation.z = (Math.random() - 0.5) * 0.15
    }
}

generateTrees(75, 7, 8, 8) */

const raycaster = new THREE.Raycaster()



/**
 * Lights
 */

// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 1.5)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 1.5)
moonLight.position.set(4, 5, -2)
scene.add(moonLight)

// Door Light

const doorLight = new THREE.PointLight('#ff7d46', 0, 70)
doorLight.position.set(-0.84, 1.67, 3)
scene.add(doorLight)

gsap.to(doorLight, {
    intensity: 12,
    duration: 275,
    delay: 12,
    ease: 'power3.out'
})
doorLight.castShadow = true
doorLight.shadow.mapSize.width = 2056

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (_event) => {
    mouse.x = _event.clientX / sizes.width * 2 - 1
    mouse.y = -_event.clientY / sizes.height * 2 + 1
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 2
camera.position.z = 12
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI / 2 - 0.1
controls.minPolarAngle = Math.PI / 4
controls.maxDistance = 16
controls.minDistance = 5
controls.enablePan = false

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
    // renderer.setClearColor('#95a7b9')
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
moonLight.castShadow = true

floor.receiveShadow = true

/**
 * Animate
 */

scene.background = new THREE.Color(0x95a7b9)

gsap.from(camera.position, {
    y: 8,
    z: 7,
    duration: 1.3,
    ease: 'power3.out'
})

gsap.to(moonLight, {
    intensity: 0,
    duration: 100
})

gsap.to(ambientLight, {
    intensity: 0,
    duration: 100
})

const darkColor = new THREE.Color().setHex(0x383d47)
gsap.to(scene.background, {
    duration: 100,
    r: darkColor.r,
    g: darkColor.g,
    b: darkColor.b
})

gsap.to(fog.color, {
    duration: 100,
    r: darkColor.r,
    g: darkColor.g,
    b: darkColor.b
})

const clock = new THREE.Clock()

window.addEventListener('click', (_event) => {
    if (hoveredObject.name === 'Log') {
        gsap.to(hoveredObject.position, {
            x: 0,
            z: 9.5,
            duration: 1,
            ease: 'power3.out'
        })
    } else if (hoveredObject.name === 'Gypsum') {
        gsap.to(hoveredObject.position, {
            x: 2,
            z: 9.5,
            duration: 1,
            ease: 'power3.out'
        })
    } else if (hoveredObject.name === 'Brick') {
        gsap.to(hoveredObject.position, {
            x: -2,
            z: 9.5,
            duration: 1,
            ease: 'power3.out'
        })
    }
})

let hoveredObject = {}
let lastHoveredObject

const random1 = Math.random()
const random2 = Math.random()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const timeLeft = Math.round(100 - elapsedTime)

    const timerDisplay = document.querySelector('.time-count')
    if (timeLeft > 0) {
        timerDisplay.innerHTML = timeLeft
    } else {
        timerDisplay.innerHTML = '0'
    }

    let iterator = 1;

    fireflies.traverse((object) => {
        const angle = Math.PI * 0.3
        const radius = 3 * iterator
        const x = radius + angle * Math.cos(elapsedTime * 0.125)
        const y = 0.5
        const z = -radius + angle * Math.sin(elapsedTime * 0.125)
        object.position.set(x, y, z)
        iterator++
    })

    // Raycaster
    raycaster.setFromCamera(mouse, camera)

    hoveredObject = {}

    const intersects = raycaster.intersectObjects([logs, gypsum, bricks])

    if (intersects.length > 0) {
        hoveredObject = intersects[0].object
        if (hoveredObject !== lastHoveredObject) {
            if (lastHoveredObject) {
                lastHoveredObject.material.color.setHex(lastHoveredObject.currentHex)
            }
            lastHoveredObject = hoveredObject
            lastHoveredObject.currentHex = lastHoveredObject.material.color.getHex()
            const hoverColor = new THREE.Color().setHex(0xff0000)
            gsap.to(lastHoveredObject.material.color, {
                r: hoverColor.r,
                g: hoverColor.g,
                b: hoverColor.b,
                duration: 0.25
            })
        }
    } else {
        if (lastHoveredObject) {
            const lastColor = new THREE.Color().setHex(lastHoveredObject.currentHex)
            gsap.to(lastHoveredObject.material.color, {
                r: lastColor.r,
                g: lastColor.g,
                b: lastColor.b,
                duration: 0.25
            })
        }
        lastHoveredObject = null
    }


    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer'
    } else {
        document.body.style.cursor = 'initial'
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()