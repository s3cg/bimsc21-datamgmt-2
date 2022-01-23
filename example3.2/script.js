// Import libraries
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124.0/build/three.module.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/controls/OrbitControls.js'
import { Rhino3dmLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/3DMLoader.js'
import {GUI} from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/libs/dat.gui.module.js'

//import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.124.0/examples/jsm/loaders/GLTFLoader.js';




//console.log(GUI)


const gui = new GUI({ closed: true, width: 400})





let camera, scene, raycaster, renderer, selectedMaterial, selectedMaterial_b
const mouse = new THREE.Vector2()
window.addEventListener( 'click', onClick, false);

init()
animate()

function init() {

    THREE.Object3D.DefaultUp = new THREE.Vector3( 0, 0, 1 )

    // create a scene and a camera
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0,0,0)
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.5, 3000 )
    camera.position.y = -1000
    camera.position.z = 800

    // create the renderer and add it to the html
    renderer = new THREE.WebGLRenderer( { antialias: true } )
    renderer.setSize( window.innerWidth, window.innerHeight )
    document.body.appendChild( renderer.domElement )

    const controls = new OrbitControls( camera, renderer.domElement )
    controls.enableDamping = true

    




    const directionalLight = new THREE.DirectionalLight( 0xffffff )
    directionalLight.position.set( 20, 0, 100 )
    directionalLight.castShadow = true
    directionalLight.intensity = 0.75
    scene.add( directionalLight )
    



    const hemisphereLight = new THREE.HemisphereLight(0x000000, 0xBF9000, 0.35)
    scene.add(hemisphereLight)


    

    selectedMaterial = new THREE.MeshStandardMaterial( {color: 'black', roughness: 1.00, opacity: 0.35 } )
    
    selectedMaterial_b = new THREE.MeshStandardMaterial( {color: 'white',roughness: 0.35 ,transparent: true, opacity: 0.88 } )



    raycaster = new THREE.Raycaster()

    const loader = new Rhino3dmLoader()
    loader.setLibraryPath( 'https://cdn.jsdelivr.net/npm/rhino3dm@0.13.0/' )



    loader.load( 'sphere.3dm', function ( object ) {

        document.getElementById('loader').remove()
        // store material information
        object.traverse( (child) => {
            if (child.userData.hasOwnProperty('objectType')) {
                if (child.userData.objectType === 'Brep') {
                    child.traverse( (c) => {
                        if (c === child) return
                        c.userData.material = c.material
                        console.log(c.userData)
                    })
                } else {
                    child.userData.material = child.material
                    console.log(child.userData)
                }
                
            }
        
        })

        const gui = new GUI()
        const objectFolder = gui.addFolder('Object')
        objectFolder.add(object.rotation, 'z', 0, Math.PI * 2)

        scene.add( object )
        console.log( object )
        console.log( scene )


    } )

    

}

function onClick( event ) {

    console.log( `click! (${event.clientX}, ${event.clientY})`)

	// calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
    
    raycaster.setFromCamera( mouse, camera )

	// calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children, true )

    let container = document.getElementById( 'container' )
    if (container) container.remove()

    // reset object colours
    scene.traverse((child, i) => {
        if (child.userData.hasOwnProperty( 'material' )) {
            child.material = child.userData.material
            child.material = selectedMaterial_b
        }
    })

    if (intersects.length > 0) {

        // get closest object
        const object = intersects[0].object
        console.log(object) // debug

        object.traverse( (child) => {
            if (child.parent.userData.objectType === 'Brep') {
                child.parent.traverse( (c) => {
                    if (c.userData.hasOwnProperty( 'material' )) {
                        c.material = selectedMaterial
                    }
                })
            } else {
                if (child.userData.hasOwnProperty( 'material' )) {
                    child.material = selectedMaterial
                }
            
            
            }
        })

        // get user strings
        let data, count
        if (object.userData.attributes !== undefined) {
            data = object.userData.attributes.userStrings
        } else {
            // breps store user strings differently...
            data = object.parent.userData.attributes.userStrings
        }

        // do nothing if no user strings
        if ( data === undefined ) return

        console.log( data )
        
        // create container div with table inside
        container = document.createElement( 'div' )
        container.id = 'container'
        
        const table = document.createElement( 'table' )
        container.appendChild( table )

        for ( let i = 0; i < data.length; i ++ ) {

            const row = document.createElement( 'tr' )
            row.innerHTML = `<td>${data[ i ][ 0 ]}</td><td>${data[ i ][ 1 ]}</td>`
            table.appendChild( row )
        }

        document.body.appendChild( container )
    }


}

function animate() {

    requestAnimationFrame( animate )

    renderer.render( scene, camera )

}

animate()
