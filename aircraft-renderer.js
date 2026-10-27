/* Lightweight aircraft renderer. Geometry is local; no model downloads or libraries. */
(() => {
  'use strict';
  // Wire view needs edges, not filled polygons, shading or depth sorting.
  // Build and deduplicate the topology once, then project each vertex once.
  window.createAircraftWireframe = function () {
    const cache = new WeakMap(),
      moving = new Set([
        'mainGear',
        'noseGear',
        'gearDoor',
        'flap',
        'slat',
        'spoiler',
        'aileron',
        'elevator',
      ]);
    const omitted = new Set(['decal', 'window', 'glazing', 'fan']);
    function compile(faces) {
      const vertices = [],
        edges = [],
        points = new Map(),
        seen = new Set(),
        parts = new Map();
      for (const f of faces) {
        const kind = f.part?.kind;
        if (omitted.has(kind)) continue;
        const dynamic = moving.has(kind),
          gear = kind === 'mainGear' || kind === 'noseGear';
        if (dynamic && !parts.has(f.part)) parts.set(f.part, parts.size + 1);
        const group = dynamic ? parts.get(f.part) : 0;
        const ids = f.p.map((p) => {
          const key =
            Math.round(p[0] * 1e5) +
            ',' +
            Math.round(p[1] * 1e5) +
            ',' +
            Math.round(p[2] * 1e5) +
            ':' +
            group;
          if (!points.has(key)) {
            points.set(key, vertices.length);
            vertices.push({ p, part: f.part, dynamic, gear });
          }
          return points.get(key);
        });
        for (let i = 0; i < ids.length; i++) {
          const a = ids[i],
            b = ids[(i + 1) % ids.length];
          if (a === b) continue;
          const key = a < b ? a + ':' + b : b + ':' + a;
          if (seen.has(key)) continue;
          seen.add(key);
          edges.push([a, b, gear]);
        }
      }
      return { vertices, edges, projected: new Float64Array(vertices.length * 2) };
    }
    return {
      mode: 'wire-edges',
      stats: null,
      draw(context, faces, o) {
        let mesh = cache.get(faces);
        if (!mesh) {
          mesh = compile(faces);
          cache.set(faces, mesh);
        }
        const ca = Math.cos(o.angle),
          sa = Math.sin(o.angle),
          cp = Math.cos(o.pitch),
          sp = Math.sin(o.pitch),
          q = mesh.projected;
        for (let i = 0; i < mesh.vertices.length; i++) {
          const v = mesh.vertices[i];
          if (v.gear && o.gear <= 0.005) continue;
          const p = v.dynamic ? o.transform(v.p, v.part) : v.p,
            x = p[0] - o.focus[0],
            y = p[1] - o.focus[1],
            z = p[2] - o.focus[2],
            xx = x * ca + z * sa,
            zz = -x * sa + z * ca,
            perspective = 155 / (155 + zz * cp - y * sp);
          q[i * 2] = o.width / 2 + xx * o.scale * perspective;
          q[i * 2 + 1] = o.height * 0.48 + (-y * cp - zz * sp) * o.scale * perspective;
        }
        context.beginPath();
        for (const [a, b, gear] of mesh.edges) {
          if (gear && o.gear <= 0.005) continue;
          context.moveTo(q[a * 2], q[a * 2 + 1]);
          context.lineTo(q[b * 2], q[b * 2 + 1]);
        }
        context.strokeStyle = '#85bde066';
        context.lineWidth = 0.6;
        context.stroke();
        this.stats = { vertices: mesh.vertices.length, edges: mesh.edges.length };
        return true;
      },
    };
  };
  // A depth-buffered fallback is also needed on devices with WebGL disabled.
  // Sorting whole faces by their average depth cannot correctly hide a strut
  // partly behind a curved fuselage, regardless of the sorting order.
  function softwareRenderer() {
    const canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');
    let source = null,
      triangles = [],
      vertices = [],
      projected = null,
      pixels = null,
      depth = null;
    const moving = new Set([
      'mainGear',
      'noseGear',
      'gearDoor',
      'flap',
      'slat',
      'spoiler',
      'aileron',
      'elevator',
      'fan',
    ]);
    const normalize = (v) => {
      const n = Math.hypot(...v) || 1;
      return v.map((x) => x / n);
    };
    function normal(p) {
      const u = p[1].map((v, i) => v - p[0][i]),
        v = p[2].map((v, i) => v - p[0][i]);
      return normalize([
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ]);
    }
    return {
      mode: 'software-depth',
      draw(context, faces, o) {
        const width = Math.max(1, Math.min(1100, Math.round(o.width * o.dpr))),
          height = Math.max(1, Math.round((o.height * width) / o.width)),
          ratio = width / o.width;
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          pixels = ctx.createImageData(width, height);
          depth = new Float32Array(width * height);
        }
        if (!pixels) {
          pixels = ctx.createImageData(width, height);
          depth = new Float32Array(width * height);
        }
        pixels.data.fill(0);
        depth.fill(0);
        if (source !== faces) {
          source = faces;
          triangles = [];
          vertices = [];
          const shared = new Map(),
            parts = new Map();
          for (const f of faces) {
            const flat = normal(f.p),
              dynamic = moving.has(f.part?.kind),
              gear = ['mainGear', 'noseGear'].includes(f.part?.kind);
            if (dynamic && !parts.has(f.part)) parts.set(f.part, parts.size + 1);
            const ids = f.p.map((p, i) => {
              const n = f.normals ? f.normals[i] : flat,
                key = [...p, ...n, ...f.color, dynamic ? parts.get(f.part) : 0].join(',');
              if (!shared.has(key)) {
                shared.set(key, vertices.length);
                vertices.push({ p, n, color: f.color, part: f.part, dynamic, gear });
              }
              return shared.get(key);
            });
            for (let k = 1; k < ids.length - 1; k++)
              triangles.push({ indices: [ids[0], ids[k], ids[k + 1]], gear });
          }
          projected = new Float64Array(vertices.length * 6);
        }
        const ca = Math.cos(o.angle),
          sa = Math.sin(o.angle),
          cp = Math.cos(o.pitch),
          sp = Math.sin(o.pitch),
          eye = [sa * cp, sp, -ca * cp];
        for (let i = 0; i < vertices.length; i++) {
          const f = vertices[i];
          if (f.gear && o.gear <= 0.005) continue;
          const p = f.dynamic ? o.transform(f.p, f.part) : f.p,
            v = p.map((x, i) => x - o.focus[i]),
            x = v[0] * ca + v[2] * sa,
            z = -v[0] * sa + v[2] * ca,
            d = 155 + z * cp - v[1] * sp,
            inv = 1 / d;
          let n = f.n;
          if (f.dynamic) {
            const np = o.transform(
              f.p.map((x, i) => x + n[i] * 0.01),
              f.part,
            );
            n = np.map((x, i) => x - p[i]);
          }
          n = normalize(n);
          if (n.reduce((s, x, i) => s + x * eye[i], 0) < 0) n = n.map((x) => -x);
          const key = Math.max(0, (-0.4 * n[0] + 0.85 * n[1] - 0.5 * n[2]) / 1.064),
            fill = Math.max(0, (0.75 * n[0] + 0.25 * n[1] + 0.4 * n[2]) / 0.887),
            light = 0.34 + 0.48 * key + 0.13 * fill + 0.1 * (0.5 + 0.5 * n[1]);
          projected.set(
            [
              width / 2 + x * o.scale * 155 * inv * ratio,
              height * 0.48 - (v[1] * cp + z * sp) * o.scale * 155 * inv * ratio,
              inv,
              ...f.color.map((c) => Math.min(255, c * light) * inv),
            ],
            i * 6,
          );
        }
        for (const { indices, gear } of triangles) {
          if (gear && o.gear <= 0.005) continue;
          const [a, b, c] = indices.map((i) => projected.subarray(i * 6, i * 6 + 6)),
            den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
          if (Math.abs(den) < 0.00001) continue;
          const x0 = Math.max(0, Math.ceil(Math.min(a[0], b[0], c[0]) - 0.5)),
            x1 = Math.min(width - 1, Math.floor(Math.max(a[0], b[0], c[0]) - 0.5)),
            y0 = Math.max(0, Math.ceil(Math.min(a[1], b[1], c[1]) - 0.5)),
            y1 = Math.min(height - 1, Math.floor(Math.max(a[1], b[1], c[1]) - 0.5));
          const ax = (b[1] - c[1]) / den,
            ay = (c[0] - b[0]) / den,
            bx = (c[1] - a[1]) / den,
            by = (a[0] - c[0]) / den;
          for (let y = y0; y <= y1; y++) {
            let u = ((b[1] - c[1]) * (x0 + 0.5 - c[0]) + (c[0] - b[0]) * (y + 0.5 - c[1])) / den,
              v = ((c[1] - a[1]) * (x0 + 0.5 - c[0]) + (a[0] - c[0]) * (y + 0.5 - c[1])) / den;
            for (let x = x0; x <= x1; x++, u += ax, v += bx) {
              const w = 1 - u - v;
              if (u < -0.00001 || v < -0.00001 || w < -0.00001) continue;
              const z = u * a[2] + v * b[2] + w * c[2],
                index = y * width + x;
              if (z <= depth[index]) continue;
              depth[index] = z;
              const k = index * 4;
              pixels.data[k] = (u * a[3] + v * b[3] + w * c[3]) / z;
              pixels.data[k + 1] = (u * a[4] + v * b[4] + w * c[4]) / z;
              pixels.data[k + 2] = (u * a[5] + v * b[5] + w * c[5]) / z;
              pixels.data[k + 3] = 255;
            }
          }
        }
        ctx.putImageData(pixels, 0, 0);
        context.drawImage(canvas, 0, 0, o.width, o.height);
        return true;
      },
    };
  }
  window.createAircraftRenderer = function () {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });
    if (!gl) return softwareRenderer();
    let lost = false,
      mesh = null,
      source = null;
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      lost = true;
    });

    const vertexSource = `
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec3 color;
      attribute float material;
      uniform vec3 focus;
      uniform vec2 viewport;
      uniform vec2 rotation;
      uniform vec2 elevation;
      uniform float scale;
      varying vec3 vNormal;
      varying vec3 vColor;
      varying vec3 vView;
      varying float vMaterial;
      void main() {
        vec3 p = position - focus;
        float x = p.x * rotation.x + p.z * rotation.y;
        float z = -p.x * rotation.y + p.z * rotation.x;
        float y = p.y * elevation.x + z * elevation.y;
        float depth = z * elevation.x - p.y * elevation.y;
        float w = 155.0 + depth;
        gl_Position = vec4(x * scale * 310.0 / viewport.x,
          y * scale * 310.0 / viewport.y + .04 * w,
          (320.0 + 20.0) / (320.0 - 20.0) * w - 2.0 * 320.0 * 20.0 / (320.0 - 20.0), w);
        vNormal = normal;
        vColor = color;
        vMaterial = material;
        vec3 eye = focus + vec3(rotation.y * elevation.x,
          elevation.y, -rotation.x * elevation.x) * 155.0;
        vView = eye - position;
      }`;
    const fragmentSource = `
      precision mediump float;
      varying vec3 vNormal;
      varying vec3 vColor;
      varying vec3 vView;
      varying float vMaterial;
      void main() {
        vec3 n = normalize(vNormal);
        if (!gl_FrontFacing) n = -n;
        vec3 view = normalize(vView);
        vec3 key = normalize(vec3(-.4, .85, -.5));
        vec3 fill = normalize(vec3(.75, .25, .4));
        float diffuse = max(0.0, dot(n, key));
        float bounce = max(0.0, dot(n, fill));
        float sky = .5 + .5 * n.y;
        float glass = step(.8, vMaterial);
        float metal = step(.2, vMaterial) * (1.0 - glass);
        float shine = mix(38.0, 110.0, glass);
        float highlight = pow(max(0.0, dot(n, normalize(key + view))), shine);
        float fresnel = pow(1.0 - max(0.0, dot(n, view)), 4.0);
        vec3 lit = vColor * (.34 + .48 * diffuse + .13 * bounce + .1 * sky);
        lit += vec3(.86, .92, 1.0) * highlight * (.14 + metal * .25 + glass * .35);
        lit += vec3(.1, .22, .32) * fresnel * glass * .45;
        gl_FragColor = vec4(lit, 1.0);
      }`;
    function shader(type, text) {
      const s = gl.createShader(type);
      gl.shaderSource(s, text);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    let program;
    try {
      program = gl.createProgram();
      const vs = shader(gl.VERTEX_SHADER, vertexSource),
        fs = shader(gl.FRAGMENT_SHADER, fragmentSource);
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return softwareRenderer();
    } catch (_) {
      return softwareRenderer();
    }
    const attrs = ['position', 'normal', 'color', 'material'].map((name) =>
      gl.getAttribLocation(program, name),
    );
    const uniforms = Object.fromEntries(
      ['focus', 'viewport', 'rotation', 'elevation', 'scale'].map((name) => [
        name,
        gl.getUniformLocation(program, name),
      ]),
    );
    const moving = new Set([
      'mainGear',
      'noseGear',
      'gearDoor',
      'flap',
      'slat',
      'spoiler',
      'aileron',
      'elevator',
      'fan',
    ]);
    const cross = (a, b) => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
    const minus = (a, b) => a.map((v, i) => v - b[i]);
    function faceNormal(p) {
      const n = cross(minus(p[1], p[0]), minus(p[2], p[0]));
      const length = Math.hypot(...n) || 1;
      return n.map((v) => v / length);
    }
    function group(faces, dynamic) {
      const triangles = [];
      for (const f of faces) {
        for (let k = 1; k < f.p.length - 1; k++) {
          const indices = [0, k, k + 1];
          if (f.normals) {
            const n = faceNormal(indices.map((i) => f.p[i]));
            if (n.reduce((sum, v, i) => sum + v * f.normals[0][i], 0) < 0) indices.reverse();
          }
          triangles.push({ face: f, indices });
        }
      }
      return {
        triangles,
        dynamic,
        data: new Float32Array(triangles.length * 30),
        buffer: gl.createBuffer(),
        uploaded: false,
      };
    }
    function pack(group, transform) {
      let offset = 0;
      for (const { face: f, indices } of group.triangles) {
        const points = indices.map((i) => (group.dynamic ? transform(f.p[i], f.part) : f.p[i]));
        const normal = faceNormal(points);
        for (let j = 0; j < 3; j++) {
          const i = indices[j],
            p = points[j];
          let n = f.normals ? f.normals[i] : normal;
          if (group.dynamic && f.normals) {
            // Transform a local normal as a direction, without translation.
            const q = transform(
              f.p[i].map((v, k) => v + n[k] * 0.01),
              f.part,
            );
            n = q.map((v, k) => (v - p[k]) * 100);
          }
          const length = Math.hypot(...n) || 1;
          group.data.set(
            [...p, ...n.map((v) => v / length), ...f.color.map((v) => v / 255), f.material || 0],
            offset,
          );
          offset += 10;
        }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, group.buffer);
      if (group.uploaded) gl.bufferSubData(gl.ARRAY_BUFFER, 0, group.data);
      else
        gl.bufferData(
          gl.ARRAY_BUFFER,
          group.data,
          group.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW,
        );
      group.uploaded = true;
    }
    function drawGroup(group) {
      if (!group) return;
      gl.bindBuffer(gl.ARRAY_BUFFER, group.buffer);
      let offset = 0;
      [3, 3, 3, 1].forEach((size, i) => {
        gl.enableVertexAttribArray(attrs[i]);
        gl.vertexAttribPointer(attrs[i], size, gl.FLOAT, false, 40, offset * 4);
        offset += size;
      });
      gl.drawArrays(gl.TRIANGLES, 0, group.triangles.length * 3);
    }
    const fallback = softwareRenderer();
    return {
      mode: 'webgl',
      draw(context, faces, options) {
        if (lost || gl.isContextLost()) {
          this.mode = 'software-depth';
          return fallback.draw(context, faces, options);
        }
        const { width, height, dpr, angle, pitch, scale, focus, transform, gear } = options;
        const w = Math.max(1, Math.round(width * dpr)),
          h = Math.max(1, Math.round(height * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        gl.viewport(0, 0, w, h);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        // The viewer looks along positive Z; outward front faces are clockwise.
        gl.frontFace(gl.CW);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);
        gl.uniform3fv(uniforms.focus, focus);
        gl.uniform2f(uniforms.viewport, width, height);
        gl.uniform2f(uniforms.rotation, Math.cos(angle), Math.sin(angle));
        gl.uniform2f(uniforms.elevation, Math.cos(pitch), Math.sin(pitch));
        gl.uniform1f(uniforms.scale, scale);
        if (source !== faces) {
          if (mesh) Object.values(mesh).forEach((g) => gl.deleteBuffer(g.buffer));
          source = faces;
          mesh = {
            skin: group(
              faces.filter((f) => !moving.has(f.part?.kind)),
              false,
            ),
            systems: group(
              faces.filter(
                (f) => moving.has(f.part?.kind) && !['mainGear', 'noseGear'].includes(f.part.kind),
              ),
              true,
            ),
            gear: group(
              faces.filter((f) => ['mainGear', 'noseGear'].includes(f.part?.kind)),
              true,
            ),
          };
          pack(mesh.skin, transform);
        }
        drawGroup(mesh.skin);
        pack(mesh.systems, transform);
        drawGroup(mesh.systems);
        if (gear > 0.005) {
          pack(mesh.gear, transform);
          drawGroup(mesh.gear);
        }
        context.drawImage(canvas, 0, 0, width, height);
        return true;
      },
    };
  };
})();
