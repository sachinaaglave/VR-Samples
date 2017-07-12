/******/
(function(modules) { // webpackBootstrap
    /******/ // The module cache
    /******/
    var installedModules = {};

    /******/ // The require function
    /******/
    function __webpack_require__(moduleId) {

        /******/ // Check if module is in cache
        /******/
        if (installedModules[moduleId])
        /******/
            return installedModules[moduleId].exports;

        /******/ // Create a new module (and put it into the cache)
        /******/
        var module = installedModules[moduleId] = {
            /******/
            exports: {},
            /******/
            id: moduleId,
            /******/
            loaded: false
                /******/
        };

        /******/ // Execute the module function
        /******/
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        /******/ // Flag the module as loaded
        /******/
        module.loaded = true;

        /******/ // Return the exports of the module
        /******/
        return module.exports;
        /******/
    }


    /******/ // expose the modules object (__webpack_modules__)
    /******/
    __webpack_require__.m = modules;

    /******/ // expose the module cache
    /******/
    __webpack_require__.c = installedModules;

    /******/ // __webpack_public_path__
    /******/
    __webpack_require__.p = "";

    /******/ // Load entry module and return exports
    /******/
    return __webpack_require__(0);
    /******/
})
/************************************************************************/
/******/
([
    /* 0 */
    /***/
    function(module, exports) {

        /* global AFRAME, THREE */
        if (typeof AFRAME === 'undefined') {
            throw new Error('Component attempted to register before AFRAME was available.');
        }

        /**
         * Cubemap component for A-Frame.
         */
        AFRAME.registerComponent('cubemap', {
            schema: {
                isDataUrl: {type: 'boolean', default: false},
                folder: {type: 'string'},
                urls: {type: 'string'},
                edgeLength: {type: 'int', default: 5000},
                opacity: {type: 'number', default: 1},
            },

            update: function(oldData) {
                
                /**
                 * Cubemap image files must follow this naming scheme sequence
                 * from: http://threejs.org/docs/index.html#Reference/Textures/CubeTexture
                 * var urls = [
                 *   'right.jpg', 'left.jpg',
                 *   'top.jpg', 'bottom.jpg',
                 *   'front.jpg', 'back.jpg'
                 * ];
                */
                var self = this;

                this.urls = this.data.urls.split(" ").map(function(url) {
                    if(self.data.isDataUrl)
                        return 'data:image/jpeg;base64,' + url;
                    else
                        return url;
                });
                
                this.loadCubemapUsingMeshBasicMaterial();
               
            },

            remove: function() {
                this.el.removeObject3D('cubemap');
            },

            /**
             *  The cube map is loaded as a single texture that
             *  is applied to the cube as a whole.  This requires that the texture be used
             *  as an OpenGL cubemap texture, and for that a new kind of material is used.
             *  I did't find way to update opacity of the texture
             **/
            loadCubemapUsingShaderMaterial: function() {
                var cubeMesh;

                // Create loader, load cubemap textures
                var cubemapTextureloader = new THREE.CubeTextureLoader();
                cubemapTextureloader.setCrossOrigin("anonymous");

                var cubemapTexture = cubemapTextureloader.load(this.urls);

                cubemapTexture.format = THREE.RGBFormat;

                var shader = THREE.ShaderLib['cube']; // init cube shader from built-in lib

                // Create shader material
                var skyBoxShader = new THREE.ShaderMaterial({
                    fragmentShader: shader.fragmentShader,
                    vertexShader: shader.vertexShader,
                    uniforms: shader.uniforms,
                    depthWrite: false,
                    side: THREE.BackSide
                });

                // Clone ShaderMaterial (necessary for multiple cubemaps)
                var skyBoxMaterial = skyBoxShader.clone();
                skyBoxMaterial.uniforms['tCube'].value = cubemapTexture; // Apply cubemap textures to shader uniforms

                // Set skybox dimensions
                var edgeLength = this.data.edgeLength;
                var skyBoxGeometry = new THREE.CubeGeometry(edgeLength, edgeLength, edgeLength);
                cubeMesh = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);

                // Set entity's object3D
                this.el.setObject3D('cubemap', cubeMesh);
            },

            /**
             *  The same cube map texture is assigned to a cube, but in this
             *  scene, the camera is inside the cube.  The face materials are MeshBasicMaterial, so no
             *  light is needed to see it.  This scene does not use lighting at all. Textures opacity can be updated.
             **/
            loadCubemapUsingMeshBasicMaterial: function() {
                
                function loadTextures(textureURLs, callback) {
                    var loaded = 0;

                    function loadedOne() {
                        loaded++;
                        if (callback && loaded == textureURLs.length) {
                            for (var i = 0; i < textureURLs; i++)
                                textures[i].needsUpdate = true;
                            callback();
                        }
                    }
                    var textures = [];
                    for (var i = 0; i < textureURLs.length; i++) {
                        var tex = THREE.ImageUtils.loadTexture(textureURLs[i], undefined, loadedOne);
                        textures.push(tex);
                    }
                    return textures;
                }

                var cubemapTextureLoaded = function() {
                    console.log("cubemapTextureLoaded");
                }

                var cubeMesh;
                var textures = loadTextures(this.urls, cubemapTextureLoaded);
                var materials = [];
                for (var i = 0; i < 6; i++) {
                    materials.push(new THREE.MeshBasicMaterial({
                        side: THREE.BackSide, // IMPORTANT: To see the inside of the cube, back faces must be rendered!
                        map: textures[i],
                        opacity: this.data.opacity,
                        transparent: true
                    }));
                }

                var edgeLength = this.data.edgeLength;

                cubeMesh = new THREE.Mesh(new THREE.CubeGeometry(edgeLength, edgeLength, edgeLength), new THREE.MeshFaceMaterial(materials));

                // Set entity's object3D
                this.el.setObject3D('cubemap', cubeMesh);
            }
        });


        /***/
    }
    /******/
]);
