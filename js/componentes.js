AFRAME.registerComponent('mostrar-ficha', {
      schema: { ficha: { type: 'selector' } },
      init: function () {
        const ficha = this.data.ficha;
        this.el.addEventListener('click', () => {
          if (ficha) ficha.setAttribute('visible', true);
        });
      }
    });

    AFRAME.registerComponent('cerrar-ficha', {
      schema: { ficha: { type: 'selector' } },
      init: function () {
        const ficha = this.data.ficha;
        this.el.addEventListener('click', () => {
          if (ficha) ficha.setAttribute('visible', false);
        });
      }
    });

    AFRAME.registerComponent('teletransporte', {
      schema: { destino: { type: 'vec3' } },
      init: function () {
        this.el.addEventListener('click', () => {
          const camara = document.querySelector('#camara');
          if (camara) camara.setAttribute('position', this.data.destino);
        });
      }
    });

    AFRAME.registerComponent('centrar-texto-3d', {
      init: function () {
        this.centerText = () => {
          const mesh = this.el.getObject3D('mesh');
          if (!mesh || !mesh.geometry) return;

          mesh.geometry.computeBoundingBox();
          const caja = mesh.geometry.boundingBox;
          if (!caja) return;

          mesh.position.x = -(caja.min.x + caja.max.x) / 2;
        };

        this.el.addEventListener('object3dset', this.centerText);
        this.el.addEventListener('loaded', this.centerText);

        this.el.addEventListener('componentinitialized', (event) => {
          if (event.detail.name === 'text-geometry') {
            this.centerText();
          }
        });

        requestAnimationFrame(() => {
          requestAnimationFrame(this.centerText);
        });
      },

      remove: function () {
        this.el.removeEventListener('object3dset', this.centerText);
        this.el.removeEventListener('loaded', this.centerText);
      }
    });

    AFRAME.registerComponent('techo-curvo', {
      schema: {
        ancho: { type: 'number', default: 8.7 },
        largo: { type: 'number', default: 6.7 },
        base: { type: 'number', default: 3.78 },
        elevacion: { type: 'number', default: 0.85 },
        segmentos: { type: 'int', default: 64 }
      },

      init: function () {
        const d = this.data;
        const vertices = [];
        const indices = [];
        const uvs = [];
        const nx = d.segmentos;
        const nz = 24;
        const mitadAncho = d.ancho / 2;

        for (let j = 0; j <= nz; j++) {
          const z = -d.largo / 2 + (j / nz) * d.largo;

          for (let i = 0; i <= nx; i++) {
            const x = -mitadAncho + (i / nx) * d.ancho;
            const p = x / mitadAncho;
            const y = d.base + d.elevacion * (1 - p * p);

            vertices.push(x, y, z);
            uvs.push(i / nx, j / nz);
          }
        }

        for (let j = 0; j < nz; j++) {
          for (let i = 0; i < nx; i++) {
            const a = j * (nx + 1) + i;
            const b = a + 1;
            const c = a + nx + 1;
            const e = c + 1;
            indices.push(a, c, b, b, c, e);
          }
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geo.setIndex(indices);
        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
          color: '#eee9df',
          roughness: 0.9,
          side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geo, mat);
        this.el.object3D.add(this.mesh);
      },

      remove: function () {
        if (this.mesh) {
          this.mesh.geometry.dispose();
          this.mesh.material.dispose();
          this.el.object3D.remove(this.mesh);
        }
      }
    });

    AFRAME.registerComponent('arco-galeria', {
      schema: {
        ancho: { type: 'number', default: 8.7 },
        base: { type: 'number', default: 3.76 },
        elevacion: { type: 'number', default: 0.85 },
        grosor: { type: 'number', default: 0.085 },
        segmentos: { type: 'int', default: 64 }
      },

      init: function () {
        const d = this.data;
        const puntos = [];
        const mitad = d.ancho / 2;

        for (let i = 0; i <= d.segmentos; i++) {
          const x = -mitad + (i / d.segmentos) * d.ancho;
          const p = x / mitad;
          const y = d.base + d.elevacion * (1 - p * p);
          puntos.push(new THREE.Vector3(x, y, 0));
        }

        const curva = new THREE.CatmullRomCurve3(puntos);
        const geo = new THREE.TubeGeometry(curva, d.segmentos, d.grosor, 10, false);
        const mat = new THREE.MeshStandardMaterial({
          color: '#c5a45b',
          metalness: 0.55,
          roughness: 0.32
        });

        this.mesh = new THREE.Mesh(geo, mat);
        this.el.object3D.add(this.mesh);
      },

      remove: function () {
        if (this.mesh) {
          this.mesh.geometry.dispose();
          this.mesh.material.dispose();
          this.el.object3D.remove(this.mesh);
        }
      }
    });

    AFRAME.registerComponent('arco-longitudinal', {
      schema: {
        longitud: { type: 'number', default: 6.7 },
        altura: { type: 'number', default: 3.78 },
        elevacion: { type: 'number', default: 0.85 },
        grosor: { type: 'number', default: 0.07 }
      },

      init: function () {
        const d = this.data;
        const puntos = [];
        const mitad = d.longitud / 2;
        const segmentos = 48;

        for (let i = 0; i <= segmentos; i++) {
          const z = -mitad + (i / segmentos) * d.longitud;
          const p = z / mitad;
          const y = d.altura + d.elevacion * (1 - p * p);
          puntos.push(new THREE.Vector3(0, y, z));
        }

        const curva = new THREE.CatmullRomCurve3(puntos);
        const geo = new THREE.TubeGeometry(curva, segmentos, d.grosor, 10, false);
        const mat = new THREE.MeshStandardMaterial({
          color: '#c5a45b',
          metalness: 0.55,
          roughness: 0.32
        });

        this.mesh = new THREE.Mesh(geo, mat);
        this.el.object3D.add(this.mesh);
      },

      remove: function () {
        if (this.mesh) {
          this.mesh.geometry.dispose();
          this.mesh.material.dispose();
          this.el.object3D.remove(this.mesh);
        }
      }
    });

    AFRAME.registerComponent('remate-pared-curvo', {
      schema: {
        ancho: { type: 'number', default: 10 },
        z: { type: 'number', default: -3.9 },
        base: { type: 'number', default: 3.99 },
        grosor: { type: 'number', default: 0.2 },
        elevacion: { type: 'number', default: 0.85 }
      },

      init: function () {
        const d = this.data;
        const vertices = [];
        const indices = [];
        const pasos = 64;
        const mitad = d.ancho / 2;

        for (let i = 0; i <= pasos; i++) {
          const x = -mitad + (i / pasos) * d.ancho;
          const p = x / 4.35;
          const techo = 3.78 + d.elevacion * (1 - p * p);
          const arriba = Math.max(d.base, techo);

          vertices.push(
            x, d.base, -d.grosor / 2,
            x, arriba, -d.grosor / 2,
            x, d.base, d.grosor / 2,
            x, arriba, d.grosor / 2
          );
        }

        for (let i = 0; i < pasos; i++) {
          const a = i * 4;
          const b = a + 4;

          indices.push(
            a, b, a + 1,
            a + 1, b, b + 1,
            a + 2, a + 3, b + 2,
            a + 3, b + 3, b + 2,
            a, a + 2, b,
            a + 2, b + 2, b,
            a + 1, b + 1, a + 3,
            a + 3, b + 1, b + 3
          );
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geo.setIndex(indices);
        geo.computeVertexNormals();

        const mat = new THREE.MeshStandardMaterial({
          color: '#eee9df',
          roughness: 0.9,
          side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.z = d.z;
        this.el.object3D.add(this.mesh);
      },

      remove: function () {
        if (this.mesh) {
          this.mesh.geometry.dispose();
          this.mesh.material.dispose();
          this.el.object3D.remove(this.mesh);
        }
      }
    });