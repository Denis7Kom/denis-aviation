/** Procedural meshes in metres: x = span, y = up, z = nose to tail. */
export function airframe(a) {
  if (!airframe.specs)
    airframe.specs = {
      B737: {
        narrow: true,
        engine: 1.0,
        engineY: -1.9,
        engineScale: 0.64,
        ex: 4.83,
        ez: -6.455,
        tail: 7.2,
        tip: 2.4,
        axles: 1,
        gearX: 2.86,
        gearZ: -0.125,
        ground: -3.17,
        tire: 0.48,
        noseTire: 0.34,
        noseGearD: 4.09,
        noseLength: 6.5,
        doors: [4.9, 14.8, 26.1],
        ru: 'Короткий фюзеляж · CFM56-7B · Винглеты · Выходы над крылом',
        en: 'Short fuselage · CFM56-7B · Blended winglets · Overwing exits',
      },
      A321: {
        narrow: true,
        engine: 1.055,
        engineY: -2.15,
        engineScale: 0.67,
        ex: 5.755,
        ez: -6.795,
        tail: 6.225,
        tip: 0.8,
        axles: 1,
        gearX: 3.795,
        gearZ: -0.285,
        ground: -3.7,
        tire: 0.52,
        noseTire: 0.36,
        noseGearD: 5.07,
        noseLength: 6.8,
        doors: [5.1, 13.9, 24.7, 36.2],
        ru: 'Удлинённый фюзеляж · CFM56-5B · Четыре пары дверей · Концевые шайбы',
        en: 'Stretched fuselage · CFM56-5B · Four door pairs · Wingtip fences',
      },
      B77W: {
        engine: 2.04,
        ex: 10.6,
        ez: -7.5,
        tail: 10.8,
        tip: 0,
        axles: 3,
        gearX: 5.5,
        gearZ: 4.8,
        ground: -5.65,
        tire: 0.69,
        fin: 11.4,
        noseLength: 9.2,
        doors: [6.1, 17.3, 31.1, 48.2, 63.2],
        ru: 'Стреловидные законцовки · Крупные GE90 · 6 колёс на основной стойке',
        en: 'Raked wingtips · Large GE90 nacelles · 6-wheel main bogies',
      },
      A339: {
        engine: 1.78,
        ex: 10.1,
        ez: -6.7,
        tail: 9.7,
        tip: 3.2,
        axles: 2,
        gearX: 5.3,
        gearZ: 5.8,
        ground: -5.2,
        tire: 0.64,
        fin: 10.1,
        noseLength: 8.8,
        doors: [5.85, 17.74, 35.96, 50.96],
        ru: 'Плавные винглеты · Trent 7000 · 4 колеса на основной стойке',
        en: 'Blended winglets · Trent 7000 · 4-wheel main bogies',
      },
      A333: {
        engine: 1.43,
        ex: 9.7,
        ez: -6.3,
        tail: 9.7,
        tip: 1.6,
        axles: 2,
        gearX: 5.3,
        gearZ: 5.8,
        ground: -5.2,
        tire: 0.64,
        fin: 10.1,
        noseLength: 8.8,
        doors: [5.85, 17.74, 35.96, 50.96],
        ru: 'Угловые винглеты · Узкие гондолы · 4 колеса на основной стойке',
        en: 'Angled winglets · Slender nacelles · 4-wheel main bogies',
      },
      A35K: {
        engine: 1.91,
        ex: 10.5,
        ez: -7.4,
        tail: 10.3,
        tip: 3.7,
        axles: 3,
        gearX: 5.365,
        gearZ: 4.8,
        ground: -5.55,
        tire: 0.69,
        fin: 10.6,
        noseLength: 10.2,
        doors: [6.82, 23.3, 42.38, 59.53],
        ru: 'Изогнутые законцовки · Маска кабины · 6 колёс на основной стойке',
        en: 'Curved wingtips · Cockpit mask · 6-wheel main bogies',
      },
    };
  const s = airframe.specs[a.code];
  if (s.narrow && !s.nose) {
    const b = a.code === 'B737';
    // Independent 737NG and A321ceo silhouettes, traced against the side and
    // plan views in Boeing D6-58325-7 rev C and Airbus A321 ACP Dec 2023.
    // Each station is [distance from nose, half-width, crown, belly] in metres.
    s.bodyVertical = b ? 2.005 / a.r : 2.07 / a.r;
    s.nose = b
      ? [
          [0, 0.025, -0.45, -0.5],
          [0.15, 0.22, -0.22, -0.79],
          [0.3, 0.36, -0.08, -0.97],
          [0.5, 0.49, 0.09, -1.16],
          [0.75, 0.63, 0.31, -1.32],
          [1, 0.76, 0.5, -1.45],
          [1.4, 0.94, 0.77, -1.61],
          [1.8, 1.085, 1.1, -1.75],
          [2.2, 1.23, 1.48, -1.86],
          [2.6, 1.35, 1.68, -1.95],
          [3.2, 1.48, 1.81, -2.005],
          [4, 1.66, 1.91, -2.005],
          [5, 1.8, 1.98, -2.005],
          [6, 1.875, 2.005, -2.005],
          [6.5, 1.88, 2.005, -2.005],
        ]
      : [
          [0, 0.025, -0.58, -0.63],
          [0.15, 0.34, -0.14, -1.08],
          [0.3, 0.49, -0.015, -1.2],
          [0.5, 0.65, 0.11, -1.33],
          [0.75, 0.78, 0.24, -1.43],
          [1, 0.91, 0.36, -1.55],
          [1.5, 1.13, 0.64, -1.71],
          [2, 1.33, 1.14, -1.83],
          [2.5, 1.51, 1.43, -1.93],
          [3, 1.66, 1.62, -2.0],
          [4, 1.86, 1.87, -2.06],
          [5, 1.96, 2.02, -2.07],
          [6, 1.975, 2.07, -2.07],
          [6.8, 1.975, 2.07, -2.07],
        ];
    if (b)
      s.cockpit = [
        [
          [null, 1.96],
          [1.2, 2.25],
          [0.58, 1.74],
          [null, 1.22],
        ],
        [
          [1.22, 2.32],
          [1.23, 2.72],
          [0.4, 2.6],
          [0.58, 1.87],
        ],
        [
          [1.23, 2.8],
          [1.19, 3.36],
          [0.69, 3.34],
          [0.4, 2.69],
        ],
      ];
    s.tailStart = b ? 23.0 : 33.2;
    s.tailEnd = b ? 1.68 : 1.28;
    s.fin = b ? 9.4 : 8.06;
    // The crown stays nearly level as the belly rises into the APU cone.
    // A 737's short, raised cone differs from the longer A321 tail taper.
    s.aft = b
      ? [
          [23, 1.88, 2.005, -2.005],
          [25, 1.78, 2.005, -1.73],
          [27, 1.51, 1.99, -1.18],
          [29, 1.12, 1.97, -0.41],
          [31, 0.65, 1.92, 0.58],
          [32.6, 0.31, 1.88, 1.28],
          [33.63, 0.18, 1.86, 1.5],
        ]
      : [
          [33.2, 1.975, 2.07, -2.07],
          [35.5, 1.78, 2.07, -1.64],
          [38, 1.43, 2.055, -0.98],
          [40.5, 0.95, 2.0, -0.16],
          [42.6, 0.5, 1.79, 0.62],
          [44.51, 0.2, 1.48, 1.08],
        ];
    s.finSections = b
      ? [
          [1.55, 10.6, 9.95, 0.28],
          [1.95, 8.45, 7.8, 0.43],
          [2.35, 6.8, 6.2, 0.44],
          [3.25, 6.2, 5.7, 0.38],
          [7.9, 3.15, 2.65, 0.16],
          [9.25, 2.17, 1.87, 0.075],
          [9.4, 2.0, 1.65, 0.04],
        ]
      : [
          [1.55, 9.7, 9.05, 0.38],
          [2.07, 8.5, 7.85, 0.45],
          [2.65, 7.5, 6.85, 0.42],
          [3.5, 6.85, 6.15, 0.34],
          [6.9, 3.7, 3.03, 0.15],
          [7.94, 2.64, 2.03, 0.07],
          [8.06, 2.49, 1.84, 0.04],
        ];
    s.stabilizer = b
      ? [
          [0.75, 1.44, 7.75, 4.8, 0.38],
          [2.8, 1.7, 6.3, 3.7, 0.29],
          [6.65, 2.15, 2.38, 1.45, 0.1],
          [7.175, 2.2, 2.1, 0.77, 0.028],
        ]
      : [
          [0.8, 1.05, 7.75, 4.7, 0.36],
          [2.8, 1.3, 6.0, 3.55, 0.27],
          [5.75, 1.68, 2.6, 1.5, 0.085],
          [6.225, 1.75, 2.1, 0.8, 0.027],
        ];
  }

  if (!s.nose) {
    const boeing = a.code === 'B77W',
      xwb = a.code === 'A35K';
    // Side and plan silhouettes sampled from the Boeing/Airbus airport
    // planning drawings and A350 photo contours. Units: distance, half-width, top, belly.
    s.nose = boeing
      ? [
          [0, 0.025, -0.5, -0.55],
          [0.25, 0.48, 0.04, -1.17],
          [0.5, 0.68, 0.2, -1.33],
          [1, 1.07, 0.52, -1.57],
          [1.5, 1.31, 1.01, -1.81],
          [2, 1.55, 1.41, -1.97],
          [2.5, 1.71, 1.65, -2.13],
          [3, 1.95, 1.89, -2.29],
          [3.5, 2.11, 2.05, -2.46],
          [4, 2.27, 2.29, -2.54],
          [5, 2.5, 2.54, -2.78],
          [6, 2.74, 2.78, -2.94],
          [7, 2.98, 2.94, -3.007],
          [8, 3.1, 3.007, -3.007],
          [9.2, 3.1, 3.007, -3.007],
        ]
      : xwb
        ? [
            [0, 0.025, -0.78, -0.83],
            [0.25, 0.4, -0.24, -1.15],
            [0.5, 0.63, 0.03, -1.38],
            [1, 1.02, 0.46, -1.72],
            [1.5, 1.3, 0.89, -1.99],
            [2, 1.54, 1.35, -2.2],
            [2.8, 1.91, 1.89, -2.45],
            [3.8, 2.25, 2.27, -2.65],
            [5, 2.6, 2.62, -2.82],
            [6.5, 2.84, 2.82, -2.89],
            [8, 2.96, 2.89, -2.89],
            [10.2, 2.98, 2.8906, -2.8906],
          ]
        : [
            [0, 0.025, -0.32, -0.37],
            [0.25, 0.42, 0.16, -0.88],
            [0.5, 0.65, 0.36, -1.07],
            [1, 0.93, 0.55, -1.33],
            [1.5, 1.16, 1.0, -1.52],
            [2, 1.4, 1.46, -1.72],
            [2.5, 1.58, 1.72, -1.91],
            [3, 1.77, 1.91, -2.04],
            [3.5, 1.91, 2.04, -2.17],
            [4, 2.05, 2.17, -2.3],
            [5, 2.33, 2.43, -2.43],
            [6, 2.51, 2.56, -2.63],
            [7, 2.65, 2.69, -2.69],
            [8, 2.79, 2.7354, -2.7354],
            [8.8, 2.82, 2.7354, -2.7354],
          ];
    s.tailStart = a.len - (boeing ? 18.0 : xwb ? 18.8 : 16.3);
    s.tailEnd = boeing ? 1.32 : xwb ? 1.24 : 1.12;
    s.fin = boeing ? 12.87 : xwb ? 11.5 : 11.5;
    s.finSections = boeing
      ? [
          [2.55, 14.4, 13.3, 0.63],
          [3.05, 12.1, 10.9, 0.62],
          [4.25, 10.2, 8.9, 0.5],
          [8.5, 6.45, 5.4, 0.3],
          [12.55, 2.75, 1.65, 0.095],
          [12.87, 2.35, 1.28, 0.055],
        ]
      : xwb
        ? [
            [2.4, 14.5, 13.3, 0.61],
            [2.95, 12.3, 11, 0.57],
            [4.15, 10.55, 9.2, 0.47],
            [7.9, 6.45, 5.8, 0.27],
            [11.3, 2.65, 2.0, 0.09],
            [11.5, 2.35, 1.72, 0.05],
          ]
        : [
            [2.28, 12.9, 11.9, 0.59],
            [2.8, 11.15, 10.1, 0.54],
            [3.7, 9.95, 8.9, 0.46],
            [7.7, 6.2, 5.65, 0.27],
            [11.32, 2.55, 2.17, 0.09],
            [11.5, 2.35, 1.88, 0.05],
          ];
    s.stabilizer = boeing
      ? [
          [1.2, 1.32, 12.3, 8.2, 0.34],
          [4.1, 1.73, 9.4, 6.05, 0.26],
          [9.7, 2.57, 3.75, 1.8, 0.085],
          [10.76, 2.72, 2.8, 0.8, 0.025],
        ]
      : xwb
        ? [
            [1.1, 1.45, 12.7, 8.1, 0.32],
            [4.1, 1.9, 9.55, 5.8, 0.24],
            [9.45, 2.7, 3.9, 1.7, 0.075],
            [10.0, 2.8, 3.3, 0.92, 0.022],
          ]
        : [
            [1.1, 1.16, 11.0, 7.35, 0.3],
            [3.7, 1.57, 8.55, 5.15, 0.23],
            [8.9, 2.39, 3.25, 1.6, 0.075],
            [9.7, 2.52, 2.75, 0.82, 0.022],
          ];
    // A finite-thickness root and forward maximum thickness keep the tail
    // from reading as a pair of flat cards in front and rear views.
    s.finSections = s.finSections.map((q) => [q[0], q[1], q[2], q[3] * 1.35]);
    s.stabilizer = s.stabilizer.map((q) => [q[0], q[1], q[2], q[3], q[4] * 1.4]);
  }
  return s;
}

export function wingGeometry(a) {
  const spec = airframe(a);
  if (spec.wing) return spec.wing;
  const finish = (stations, nav, tip) =>
    (spec.wing = {
      stations,
      nav,
      tip,
      fractions: [0, 0.004, 0.012, 0.026, 0.047, 0.075, 0.105, 0.13, 0.16, 0.38, 0.56, 0.7, 0.72, 0.86, 0.94, 1],
      point(s, f, sign = 1, side = 1) {
        const thickness =
          2.969 * Math.sqrt(f) -
          1.26 * f -
          3.516 * f * f +
          2.843 * f * f * f -
          1.036 * f * f * f * f;
        const camber = 0.12 * Math.sin(Math.PI * f);
        return [sign * s[0], s[1] + (camber + side * thickness) * s[4], s[2] + f * s[3]];
      },
    });
  if (a.code === 'B737' || a.code === 'A321') {
    const is737 = a.code === 'B737';
    const stations = is737
      ? [
          [a.r * 0.66, -0.66, -5.1, 7.1, 0.35],
          [4.83, -0.39, -3.65, 5.25, 0.27],
          [11.2, 0.15, -0.1, 3.15, 0.15],
          [16.3, 0.86, 3.5, 1.65, 0.07],
          [17.05, 1.07, 4.08, 1.38, 0.045],
          [17.38, 1.45, 4.3, 1.21, 0.037],
          [17.65, 2.25, 4.63, 0.86, 0.026],
          [17.83, 3.18, 4.96, 0.55, 0.018],
          [17.9, 3.5, 5.12, 0.3, 0.012],
        ]
      : [
          [a.r * 0.66, -0.72, -5.5, 7.5, 0.38],
          [5.755, -0.37, -3.45, 5.2, 0.28],
          [11.4, 0.21, -0.18, 2.9, 0.15],
          [15.8, 0.76, 2.82, 1.72, 0.07],
          [16.78, 0.91, 3.47, 1.22, 0.041],
          [17.05, 0.95, 3.64, 0.82, 0.025],
        ];
    return finish(stations, stations[4], stations.at(-1));
  }
  const b = a.span / 2,
    s = airframe(a),
    root = a.code === 'B77W' ? -9.8 : a.code === 'A35K' ? -9 : -8;
  const stations = [
    [a.r * 0.65, -0.85, root, 16, 0.66],
    [b * 0.3, -0.55, -4.6, 10.8, 0.46],
    [b * 0.64, 0.25, 2.7, 6, 0.22],
  ];
  if (a.code === 'B77W')
    stations.push(
      [b * 0.86, 1.25, 8.1, 3.4, 0.12],
      [b * 0.94, 1.7, 11.1, 1.8, 0.06],
      [b, 1.95, 14.2, 0.32, 0.02],
    );
  else if (a.code === 'A333')
    stations.push(
      [b * 0.89, 1.25, 9.1, 2.7, 0.09],
      [b * 0.955, 1.6, 10.9, 2, 0.055],
      [b * 0.98, 2.25, 11.8, 1.45, 0.04],
      [b, 3.25, 12.8, 0.72, 0.025],
    );
  else if (a.code === 'A339')
    stations.push(
      [b * 0.86, 1.3, 8.5, 3, 0.1],
      [b * 0.925, 1.75, 10.5, 2.25, 0.075],
      [b * 0.963, 2.25, 11.6, 1.8, 0.06],
      [b * 0.985, 3.0, 12.5, 1.25, 0.04],
      [b * 0.997, 4.0, 13.2, 0.8, 0.025],
      [b, 4.9, 13.8, 0.38, 0.015],
    );
  else
    stations.push(
      [b * 0.85, 1.5, 8, 3.2, 0.11],
      [b * 0.91, 2.05, 9.7, 2.55, 0.08],
      [b * 0.95, 2.7, 10.8, 2, 0.06],
      [b * 0.977, 3.5, 11.8, 1.45, 0.04],
      [b * 0.993, 4.5, 12.9, 0.9, 0.025],
      [b, 5.25, 13.8, 0.36, 0.015],
    );
  const nav = stations[a.code === 'B77W' ? stations.length - 1 : 4];
  return finish(stations, nav, stations[stations.length - 1]);
}

export function fuselageSection(a, z, theta = null, lift = 0) {
  if (theta !== null) {
    const q = fuselageSection(a, z),
      d = z + a.len / 2,
      v = Math.sin(theta),
      r = q.radius + lift;
    function cheek(d, v) {
      let x = Math.sqrt(Math.max(0, 1 - v * v));
      if (a.code === 'B737' && v > 0 && d > 1.05 && d < 4.6) {
        const section = [
          [0, 1],
          [0.35, 0.925],
          [0.74, 0.64],
          [0.94, 0.28],
          [1, 0],
        ];
        let k = 1;
        while (k < section.length - 1 && v > section[k][0]) k++;
        const p = section[k - 1],
          t = section[k],
          f = (v - p[0]) / (t[0] - p[0]),
          facet = p[1] + (t[1] - p[1]) * f;
        x += (facet - x) * Math.min(1, (d - 1.05) / 0.55, (4.6 - d) / 1.0);
      }
      if (a.code === 'B737' && v < -0.12) {
        // A narrower lower cargo lobe and a shallow floor-level waist give
        // the 737 barrel its own section instead of an Airbus-like oval.
        const axial = Math.max(0, Math.min(1, (d - 4.6) / 2, (27.5 - d) / 3)),
          t = Math.min(1, (-v - 0.12) / 0.88);
        x *= 1 - 0.055 * Math.sin(Math.PI * t) * axial;
      }
      if (a.code === 'B737' && v > -0.74 && v < 0.05 && d > 10.8 && d < 20.8) {
        const f = (d - 10.8) / 10,
          h = (v + 0.74) / 0.79;
        x += 0.052 * Math.sin(Math.PI * f) ** 2 * Math.sin(Math.PI * h) ** 2;
      }
      return x;
    }
    let xx = cheek(d, v) * q.radius;
    if (a.code === 'B737' && v > 0 && d > 1.0 && d < 4.0) {
      const spec = airframe(a);
      // Cut actual flat windshield seats into the skin, rather than laying
      // flat glass across a curved body where its middle would disappear.
      if (!spec.cockpitSeats)
        spec.cockpitSeats = spec.cockpit.map((p) =>
          p.map(([y, dd]) => {
            const zz = -a.len / 2 + dd,
              s = fuselageSection(a, zz),
              vv = y === null ? Math.sin(1.54) : (y - s.center) / (s.radius * s.vertical);
            return [cheek(dd, vv) * s.radius, s.center + vv * s.radius * s.vertical, zz];
          }),
        );
      const yy = q.center + v * q.radius * q.vertical;
      for (const quad of spec.cockpitSeats)
        for (const ids of [
          [0, 1, 2],
          [0, 2, 3],
        ]) {
          const [p, t, u] = ids.map((i) => quad[i]),
            dy = t[1] - p[1],
            dz = t[2] - p[2],
            ey = u[1] - p[1],
            ez = u[2] - p[2],
            den = dy * ez - dz * ey;
          if (Math.abs(den) < 1e-9) continue;
          const b = ((yy - p[1]) * ez - (z - p[2]) * ey) / den,
            c = (dy * (z - p[2]) - dz * (yy - p[1])) / den,
            m = Math.min(1 - b - c, b, c);
          if (m < -0.12) continue;
          const target = p[0] + b * (t[0] - p[0]) + c * (u[0] - p[0]),
            w = Math.min(1, 1 + m / 0.12),
            blend = w * w * (3 - 2 * w);
          if (target > 0) xx = Math.min(xx, xx + (target - xx) * blend);
        }
    }
    return [(Math.sign(Math.cos(theta)) * xx * r) / q.radius, q.center + v * r * q.vertical, z];
  }
  const d = Math.max(0, Math.min(a.len, z + a.len / 2)),
    spec = airframe(a),
    profile = spec.aft && d >= spec.tailStart ? spec.aft : spec.nose;
  if (d < spec.noseLength || (spec.aft && d >= spec.tailStart)) {
    let i = 1;
    while (i < profile.length - 1 && d > profile[i][0]) i++;
    const p = profile[i - 1],
      q = profile[i],
      h = q[0] - p[0],
      u = (d - p[0]) / h,
      t = i === 1 && profile === spec.nose ? Math.sqrt(u) : u;
    // A square-root parameter rounds the tip; cubic interpolation avoids
    // pointed joins and overshoot near
    // the radome or crown; top and belly are shaped independently of width.
    const value = (k) => {
      const slope = (j) => {
        if (j === 0) return (profile[1][k] - profile[0][k]) / (profile[1][0] - profile[0][0]);
        if (j === profile.length - 1) return 0;
        const v = (profile[j][k] - profile[j - 1][k]) / (profile[j][0] - profile[j - 1][0]),
          w = (profile[j + 1][k] - profile[j][k]) / (profile[j + 1][0] - profile[j][0]);
        return v * w <= 0 ? 0 : (2 * v * w) / (v + w);
      };
      return (
        (2 * t * t * t - 3 * t * t + 1) * p[k] +
        (t * t * t - 2 * t * t + t) *
          (i === 1 && profile === spec.nose ? q[k] - p[k] : h * slope(i - 1)) +
        (-2 * t * t * t + 3 * t * t) * q[k] +
        (t * t * t - t * t) * h * slope(i) * (i === 1 && profile === spec.nose ? 2 : 1)
      );
    };
    const radius = Math.max(0.025, value(1)),
      top = value(2),
      bottom = value(3);
    return { radius, center: (top + bottom) / 2, vertical: (top - bottom) / (2 * radius) };
  }
  const t = Math.max(0, (d - spec.tailStart) / (a.len - spec.tailStart)),
    s = t * t,
    tip = a.code === 'B77W' ? 0.32 : 0.28,
    radius = a.r * (1 - s) + tip * s,
    center = spec.tailEnd * t * t * (3 - 2 * t);
  return { radius, center, vertical: (spec.bodyVertical || 0.97) - 0.07 * s };
}

export function aircraftLightLayout(a) {
  const spec = airframe(a);
  if (spec.lights) return spec.lights;
  const half = a.len / 2,
    geo = wingGeometry(a),
    q = geo.nav,
    lamps = [];
  const add = (id, point, normal, color, group, size = 1.35, part = null) =>
    lamps.push({ id, point, normal, color, group, size, part });
  // Locate a lamp on an actual fixed lower-wing triangle. Using the same
  // diagonal as the renderer avoids floating fixtures on the swept wing.
  function wingMount(x, f, side = -1) {
    const stations = geo.stations;
    let k = 1;
    while (k < stations.length - 1 && x > stations[k][0]) k++;
    const p = stations[k - 1],
      q = stations[k],
      w = (x - p[0]) / (q[0] - p[0]),
      j = geo.fractions.findIndex((value) => value >= f),
      lo = geo.fractions[Math.max(0, j - 1)],
      hi = geo.fractions[j],
      u = (f - lo) / (hi - lo),
      at = (s, t) => geo.point(s, t, 1, side),
      corners = [at(p, lo), at(q, lo), at(q, hi), at(p, hi)],
      indices = u <= w ? [0, 1, 2] : [0, 2, 3],
      weights = u <= w ? [1 - w, w - u, u] : [1 - u, w, u - w],
      v = indices.map((i) => corners[i]),
      anchor = [0, 1, 2].map((i) => v.reduce((s, p, k) => s + p[i] * weights[k], 0)),
      a1 = v[1].map((x, i) => x - v[0][i]),
      b1 = v[2].map((x, i) => x - v[0][i]),
      n = [
        a1[1] * b1[2] - a1[2] * b1[1],
        a1[2] * b1[0] - a1[0] * b1[2],
        a1[0] * b1[1] - a1[1] * b1[0],
      ],
      len = Math.hypot(...n),
      normal = n.map((x) => (x / len) * (n[1] * side < 0 ? -1 : 1));
    return { point: anchor.map((x, i) => x + normal[i] * 0.018), normal };
  }

  for (const sign of [-1, 1]) {
    const side = sign < 0 ? 'left' : 'right';
    const tipMount = (f) => {
      const mount = wingMount(q[0] - 0.035, f, 1);
      return {
        point: [sign * mount.point[0], mount.point[1], mount.point[2]],
        normal: [sign * mount.normal[0], mount.normal[1], mount.normal[2]],
      };
    };
    const navMount = tipMount(0.16),
      rearMount = tipMount(0.92),
      strobeMount = tipMount(0.68);
    add(
      'nav-' + side,
      navMount.point,
      [sign * 0.65, 0.12, -0.45],
      sign < 0 ? '#ff4358' : '#57e58a',
      'navigation',
    );
    lamps.at(-1).housingNormal = navMount.normal;
    add(
      'rear-nav-' + side,
      rearMount.point,
      [sign * 0.35, 0.1, 0.8],
      '#e8f4ff',
      'navigation',
      1.05,
    );
    lamps.at(-1).housingNormal = rearMount.normal;
    add('strobe-' + side, strobeMount.point, [sign * 0.55, 0.25, 0], '#e9f6ff', 'strobe', 2.0);
    lamps.at(-1).housingNormal = strobeMount.normal;
    for (const [id, x, f, size, color] of [
      ['landing', spec.gearX + (spec.narrow ? 0.55 : 0.9), 0.11, 2.2, '#f5f2df'],
      ['turnoff', a.r + 0.8, 0.12, 1.45, '#fff0d1'],
    ]) {
      const mount = wingMount(x, f),
        point = [sign * mount.point[0], mount.point[1], mount.point[2]],
        normal = [sign * mount.normal[0], mount.normal[1], mount.normal[2]];
      add(
        id + '-' + side,
        point,
        [id === 'turnoff' ? sign * 0.6 : 0, -0.35, -0.9],
        color,
        'landing',
        size,
      );
      lamps[lamps.length - 1].housingNormal = normal;
    }
    const z = -half + spec.doors[1] - 0.95,
      s = fuselageSection(a, z),
      y = 0.25;
    add(
      'wing-scan-' + side,
      [
        sign *
          Math.sqrt(Math.max(0, s.radius * s.radius - ((y - s.center) / s.vertical) ** 2)) *
          0.999 +
          sign * 0.018,
        y,
        z,
      ],
      [sign * 0.9, -0.1, 0.3],
      '#e3edff',
      'scan',
      0.9,
    );
    const stab = spec.stabilizer[1],
      sf = 0.6,
      foilHeight =
        2.969 * Math.sqrt(sf) - 1.26 * sf - 3.516 * sf * sf + 2.843 * sf ** 3 - 1.036 * sf ** 4;
    add(
      'tail-flood-' + side,
      [sign * stab[0], stab[1] + foilHeight * stab[4] + 0.018, half - stab[2] + stab[3] * sf],
      [-sign * 0.8, 0.65, 0],
      '#dce9ff',
      'scan',
      1.0,
    );
    lamps.at(-1).housingNormal = [0, 1, 0];
  }
  const topZ = -half + a.len * 0.44,
    bottomZ = -half + a.len * 0.53,
    top = fuselageSection(a, topZ),
    bottom = fuselageSection(a, bottomZ);
  add(
    'beacon-upper',
    [0, top.center + top.radius * top.vertical + 0.025, topZ],
    [0, 1, 0],
    '#ff344c',
    'beacon',
    1.65,
  );
  add(
    'beacon-lower',
    [0, bottom.center - bottom.radius * bottom.vertical - 0.025, bottomZ],
    [0, -1, 0],
    '#ff344c',
    'lowerBeacon',
    1.65,
  );
  for (const [id, dz, color, group, size] of [
    ['nav-tail', 0.19, '#e6f1ff', 'navigation', 1.1],
    ['strobe-tail', 0.42, '#edf7ff', 'strobe', 1.65],
  ]) {
    const tail = fuselageSection(a, half - dz);
    add(
      id,
      [0, tail.center + tail.radius * tail.vertical + 0.018, half - dz],
      [0, 0.2, 1],
      color,
      group,
      size,
    );
    lamps.at(-1).housingNormal = [0, 1, 0];
  }
  const z = -half + (spec.noseGearD || 8.6),
    s = fuselageSection(a, z),
    pivot = [0, s.center - s.radius * s.vertical - 0.035, z],
    part = { kind: 'noseGear', pivot };
  add(
    'taxi',
    [0, spec.ground + (spec.narrow ? 0.86 : 1.53), z - 0.2],
    [0, -0.12, -1],
    '#fff2d8',
    'taxi',
    1.8,
    part,
  );
  add(
    'takeoff',
    [0.18, spec.ground + (spec.narrow ? 0.86 : 1.53), z - 0.17],
    [0, -0.16, -1],
    '#f4f3e7',
    'taxi',
    1.55,
    part,
  );
  return (spec.lights = lamps);
}

export function aircraftLightVisible(point, normal, a, eye) {
  if (normal.reduce((n, v, i) => n + v * eye[i], 0) < -0.04) return false;
  // Check the hull along the view ray so a lamp on the far side cannot shine
  // through the nose or tail. This runs for a few lamps, never for mesh faces.
  for (const t of [0.12, 0.4, 0.9, 1.7, 2.8, 4.4, 6.5, 9, 13, 19, 28, 42, 65, 100]) {
    const p = point.map((v, i) => v + eye[i] * t);
    if (Math.abs(p[2]) > a.len / 2 || Math.abs(p[0]) > a.r || Math.abs(p[1]) > a.r + 2) continue;
    const s = fuselageSection(a, p[2]);
    if (Math.hypot(p[0], (p[1] - s.center) / s.vertical) < s.radius - 0.025) return false;
  }
  // Intersect the wing and stabilizer planes as well: their light housings
  // must disappear when those surfaces stand between the lamp and camera.
  const spec = airframe(a),
    occluders =
      spec.lightOccluders ||
      (spec.lightOccluders = [
        wingGeometry(a).stations,
        spec.stabilizer.map((s) => [s[0], s[1], a.len / 2 - s[2], s[3], s[4]]),
      ]);
  for (const stations of occluders)
    for (const sign of [-1, 1])
      for (let k = 1; k < stations.length; k++) {
        const p = stations[k - 1],
          q = stations[k],
          slope = (q[1] - p[1]) / (q[0] - p[0]),
          den = eye[1] - slope * sign * eye[0];
        if (Math.abs(den) < 1e-5) continue;
        const t = (p[1] + slope * (sign * point[0] - p[0]) - point[1]) / den;
        if (t <= 0.08) continue;
        const x = sign * (point[0] + eye[0] * t);
        if (x < p[0] || x > q[0]) continue;
        const u = (x - p[0]) / (q[0] - p[0]),
          z = point[2] + eye[2] * t,
          le = p[2] + u * (q[2] - p[2]),
          chord = p[3] + u * (q[3] - p[3]);
        if (z > le && z < le + chord) return false;
      }
  return true;
}

export function buildPlane(a, wireframe = false) {
  const faces = [],
    half = a.len / 2,
    r = a.r,
    spec = airframe(a),
    N = wireframe ? 24 : 48,
    body = [204, 217, 232],
    wingColor = [150, 171, 194],
    dark = [12, 27, 44];
  let part = null;
  const add = (p, color = body, edge = true, normals = null, material = 0) =>
    faces.push({ p, color, edge, part, normals, material });
  const radius = (z) => fuselageSection(a, z).radius;
  function surface(theta, z, lift = 0) {
    if (a.code === 'B737') return fuselageSection(a, z, theta, lift);
    const s = fuselageSection(a, z);
    return [
      Math.cos(theta) * (s.radius + lift),
      s.center + Math.sin(theta) * (s.radius + lift) * s.vertical,
      z,
    ];
  }
  function surfaceNormal(p) {
    if (a.code === 'B737') {
      const z = p[2],
        q = fuselageSection(a, z),
        v = Math.max(-0.999999, Math.min(0.999999, (p[1] - q.center) / (q.radius * q.vertical))),
        t = p[0] >= 0 ? Math.asin(v) : Math.PI - Math.asin(v),
        e = 0.001;
      const l = surface(t - e, z),
        r = surface(t + e, z),
        b = surface(t, z - e),
        f = surface(t, z + e),
        u = r.map((v, i) => v - l[i]),
        w = f.map((v, i) => v - b[i]);
      const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]],
        len = Math.hypot(...n) || 1;
      return n.map((v) => v / len);
    }
    const z = p[2],
      s = fuselageSection(a, z),
      before = fuselageSection(a, z - 0.01),
      after = fuselageSection(a, z + 0.01),
      ny = (p[1] - s.center) / (s.radius * s.vertical * s.vertical),
      nx = p[0] / s.radius;
    return [
      nx,
      ny,
      -(after.radius - before.radius) / 0.02 -
        (ny * (after.center - before.center)) / 0.02 -
        (((ny * (p[1] - s.center)) / s.vertical) * (after.vertical - before.vertical)) / 0.02,
    ];
  }
  const stations = (wireframe ? [0.1, 0.2] : [0.025, 0.06, 0.12, 0.21]).map((d) => -half + d);
  for (let d = 0; d <= spec.noseLength; d += wireframe ? 0.7 : 0.32) stations.push(-half + d);
  for (let z = -half + spec.noseLength; z < half; z += wireframe ? 2.7 : 1.35) stations.push(z);
  if (a.code === 'B737')
    for (const d of [1.05, 1.4, 1.8, 2.2, 2.6, 3.2, 3.6, 4.6]) stations.push(-half + d);
  if (!wireframe && ['A339', 'A35K'].includes(a.code))
    for (let d = 0.9; d < (a.code === 'A339' ? 3.6 : 4.5); d += 0.1) stations.push(-half + d);
  stations.push(half);
  stations.sort((x, y) => x - y);
  for (let k = 1; k < stations.length; k++)
    for (let j = 0; j < N; j++) {
      const p = [
        surface((j / N) * Math.PI * 2, stations[k - 1]),
        surface((j / N) * Math.PI * 2, stations[k]),
        surface(((j + 1) / N) * Math.PI * 2, stations[k]),
        surface(((j + 1) / N) * Math.PI * 2, stations[k - 1]),
      ];
      add(p, body, true, p.map(surfaceNormal));
    }
  function tube(x, y, sections, color = body, n = wireframe ? 18 : 36, round = false) {
    for (let k = 1; k < sections.length; k++)
      for (let j = 0; j < n; j++) {
        const at = (s, t) => {
            const sn = Math.sin(t),
              flat = !round && a.code === 'B737' && Math.abs(x) === spec.ex && y === spec.engineY,
              yy = flat && sn < -0.52 ? -0.52 + (sn + 0.52) * 0.56 : sn;
            return [
              x + Math.cos(t) * s[1] * (flat && sn < 0 ? 1 - sn * 0.045 : 1),
              y + yy * s[1],
              s[0],
            ];
          },
          p = [
            at(sections[k - 1], (j / n) * 2 * Math.PI),
            at(sections[k], (j / n) * 2 * Math.PI),
            at(sections[k], ((j + 1) / n) * 2 * Math.PI),
            at(sections[k - 1], ((j + 1) / n) * 2 * Math.PI),
          ],
          slope = (sections[k][1] - sections[k - 1][1]) / (sections[k][0] - sections[k - 1][0]);
        add(
          p,
          color,
          true,
          p.map((q) => {
            const rr = Math.hypot(q[0] - x, q[1] - y) || 1;
            return [(q[0] - x) / rr, (q[1] - y) / rr, -slope];
          }),
          0.35,
        );
      }
  }
  function wingFoil(stations, sign, color) {
    const geo = wingGeometry(a),
      fractions = wireframe ? [0, 0.035, 0.075, 0.13, 0.38, 0.72, 0.86, 1] : geo.fractions,
      doubleSlotted = a.code === 'B737' || a.code === 'A321',
      at = (s, f, side = 1) => geo.point(s, f, sign, side),
      interpolate = (s, t, u) => s.map((v, i) => v + (t[i] - v) * u);
    for (let k = 1; k < stations.length; k++) {
      const s = stations[k - 1],
        t = stations[k],
        slat =
          k <= 3
            ? {
                kind: 'slat',
                sign,
                hinge: s,
                end: t,
                chord: 0.13,
                deflection: spec.narrow ? -24 : -28,
                extension: -Math.min(0.78, Math.max(0.2, (s[3] + t[3]) * 0.041)),
              }
            : null,
        flap = k <= 2 ? { kind: 'flap', sign, hinge: s, end: t } : null,
        aft =
          flap && doubleSlotted
            ? { ...flap, component: 'aft-element', chord: 0.86, deflection: 43, extension: 1.12 }
            : null,
        surfacePart = (f) => (f < 0.13 ? slat : f >= 0.86 && aft ? aft : f >= 0.72 ? flap : null);
      for (let j = 1; j < fractions.length; j++) {
        const lo = fractions[j - 1],
          hi = fractions[j];
        part = surfacePart((lo + hi) / 2);
        for (const side of [-1, 1]) {
          const points = [at(s, lo, side), at(t, lo, side), at(t, hi, side), at(s, hi, side)],
            normals = [s, t, t, s].map((station, i) => {
              const f = i < 2 ? lo : hi,
                left = at(station, Math.max(0, f - 0.001), side),
                right = at(station, Math.min(1, f + 0.001), side),
                chord = right.map((v, n) => v - left[n]),
                span = at(t, f, side).map((v, n) => v - at(s, f, side)[n]),
                n = [
                  span[1] * chord[2] - span[2] * chord[1],
                  span[2] * chord[0] - span[0] * chord[2],
                  span[0] * chord[1] - span[1] * chord[0],
                ],
                length = Math.hypot(...n) || 1;
              return n.map((v) => (v / length) * (n[1] * side < 0 ? -1 : 1));
            });
          add(
            points,
            part?.kind === 'slat'
              ? side > 0
                ? [181, 199, 215]
                : [108, 132, 153]
              : color.map((v) => v * (side > 0 ? 1 : 0.65)),
            true,
            normals,
            0.22,
          );
        }
      }
      // Close both sides of every moving element. Their exposed cove is visible
      // during travel rather than showing through an open, paper-thin surface.
      for (const [lo, hi, moving] of [
        [0, 0.13, slat],
        [0.72, aft ? 0.86 : 1, flap],
        ...(aft ? [[0.86, 1, aft]] : []),
      ]) {
        if (!moving) continue;
        part = moving;
        for (const station of [s, t]) {
          const middle = (lo + hi) / 2;
          for (const [f0, f1] of [
            [lo, middle],
            [middle, hi],
          ])
            add(
              [at(station, f0, 1), at(station, f1, 1), at(station, f1, -1), at(station, f0, -1)],
              [112, 133, 153],
            );
        }
        for (const f of [lo, hi])
          add([at(s, f, 1), at(t, f, 1), at(t, f, -1), at(s, f, -1)], [73, 94, 117]);
        part = null;
        const f = lo === 0 ? hi : lo;
        if (f !== 0.86) add([at(s, f, 1), at(t, f, 1), at(t, f, -1), at(s, f, -1)], [37, 54, 72]);
      }
      if (wireframe) continue;
      const strip = (u0, u1, lo, hi, shade, attachment = null, lift = 0.012) => {
        part = attachment || { kind: 'decal', marking: 'wing-panel' };
        for (let j = 1; j < geo.fractions.length; j++) {
          const low = geo.fractions[j - 1],
            high = geo.fractions[j];
          if (lo >= high || hi <= low) continue;
          const bottom = (Math.max(lo, low) - low) / (high - low),
            top = (Math.min(hi, high) - low) / (high - low),
            corners = [at(s, low), at(t, low), at(t, high), at(s, high)],
            rectangle = [
              [u0, bottom],
              [u1, bottom],
              [u1, top],
              [u0, top],
            ];
          // Clip each panel to the exact diagonal used by the wing triangles.
          // Bilinear decals cut through a tapered, triangulated wing mid-panel.
          for (const side of [-1, 1]) {
            const polygon = [];
            for (let n = 0; n < rectangle.length; n++) {
              const p = rectangle[n],
                q = rectangle[(n + 1) % rectangle.length],
                dp = (p[1] - p[0]) * side,
                dq = (q[1] - q[0]) * side;
              if (dp >= 0) polygon.push(p);
              if (dp < 0 !== dq < 0) {
                const f = dp / (dp - dq);
                polygon.push(p.map((v, i) => v + (q[i] - v) * f));
              }
            }
            if (polygon.length < 3) continue;
            add(
              polygon.map(([u, v]) => {
                const weights = side < 0 ? [1 - u, u - v, v, 0] : [1 - v, 0, u, v - u];
                return [0, 1, 2].map(
                  (i) =>
                    corners.reduce((sum, p, n) => sum + p[i] * weights[n], 0) +
                    (i === 1 ? lift : 0),
                );
              }),
              shade,
              false,
            );
          }
        }
        part = null;
      };
      // Slat metallic surfaces are part of the foil: no floating rectangular overlays.
      if (flap) {
        strip(0.012, 0.988, 0.721, 0.727, [68, 91, 115], flap);
        strip(0.012, 0.988, 0.982, 0.994, [190, 204, 217], aft || flap);
        for (const u of [0.02, 0.5, 0.98])
          strip(u, u + 0.004, 0.73, aft ? 0.855 : 0.99, [93, 116, 139], flap);
      } else if (k === 3) {
        strip(0.03, 0.97, 0.724, 0.735, [72, 95, 118]);
        strip(0.03, 0.038, 0.735, 0.985, [72, 95, 118]);
        strip(0.962, 0.97, 0.735, 0.985, [72, 95, 118]);
      }
      // Short exposed rails share their parent surface's articulation. Kept
      // out of wire mode so additional detail never multiplies edge work.
      if (slat)
        for (const u of [0.22, 0.76]) {
          const st = interpolate(s, t, u),
            anchor = at(st, 0.105, -1);
          part = { ...slat, component: 'slat-track' };
          beam(
            [anchor[0], anchor[1] - 0.025, anchor[2] - 0.2],
            [anchor[0], anchor[1] - 0.025, anchor[2] + 0.16],
            spec.narrow ? 0.018 : 0.026,
            [106, 125, 144],
          );
          part = null;
        }
    }
    // Closed wingtip, rather than an exposed cut through the foil.
    const tip = stations.at(-1);
    part = null;
    for (let j = 1; j < fractions.length; j++)
      add(
        [
          at(tip, fractions[j - 1], 1),
          at(tip, fractions[j], 1),
          at(tip, fractions[j], -1),
          at(tip, fractions[j - 1], -1),
        ],
        [133, 157, 182],
      );
  }

  function foil(stations, sign, color, movable = false) {
    if (movable) return wingFoil(stations, sign, color);
    const fractions = [0, 0.055, 0.28, 0.68, 0.695, 1],
      at = (s, f, side) => [
        sign * s[0],
        s[1] +
          side *
            (2.969 * Math.sqrt(f) - 1.26 * f - 3.516 * f * f + 2.843 * f ** 3 - 1.036 * f ** 4) *
            s[4],
        s[2] + f * s[3],
      ];
    for (let k = 1; k < stations.length; k++) {
      const s = stations[k - 1],
        t = stations[k];
      part = null;
      for (let j = 1; j < fractions.length; j++)
        for (const side of [-1, 1]) {
          const shade = j === 4 ? 0.56 : j === 5 ? 0.94 : 1;
          add(
            [
              at(s, fractions[j - 1], side),
              at(t, fractions[j - 1], side),
              at(t, fractions[j], side),
              at(s, fractions[j], side),
            ],
            color.map((v) => v * (side > 0 ? 1 : 0.65) * shade),
          );
        }
      add(
        [
          [sign * s[0], s[1], s[2] + s[3]],
          [sign * t[0], t[1], t[2] + t[3]],
          [sign * t[0], t[1] - 0.08, t[2] + t[3]],
          [sign * s[0], s[1] - 0.08, s[2] + s[3]],
        ],
        [63, 99, 140],
      );
    }
  }

  for (const sign of [-1, 1]) {
    const stations = wingGeometry(a).stations;
    foil(stations, sign, wingColor, true);
    if (a.code === 'A321') {
      const q = stations.at(-1);
      for (const side of [-1, 1])
        add(
          [
            [sign * (q[0] + side * 0.025), q[1] + 0.72, q[2] + 0.06],
            [sign * (q[0] + side * 0.025), q[1] + 0.12, q[2] + q[3]],
            [sign * (q[0] + side * 0.025), q[1] - 0.46, q[2] + 0.4],
            [sign * (q[0] + side * 0.025), q[1], q[2] - 0.03],
          ],
          [142, 170, 201],
        );
    }
    foil(
      spec.stabilizer.map((s) => [s[0], s[1], half - s[2], s[3], s[4]]),
      sign,
      [166, 185, 205],
    );
    const ex = sign * spec.ex,
      ey = spec.engineY || -3.25,
      er = spec.engine,
      z = spec.ez,
      es = spec.engineScale || 1;
    if (spec.narrow) {
      // CFM56-7B has a flattened intake and short asymmetric cowling; CFM56-5B
      // uses a larger round intake and a different fan-cowl / core profile.
      const b = a.code === 'B737',
        contour = b
          ? [
              [0, 0.87],
              [0.1, 0.93],
              [0.32, 0.99],
              [0.72, 1],
              [1.65, 0.97],
              [2.25, 0.86],
              [2.7, 0.7],
            ]
          : [
              [0, 0.91],
              [0.12, 0.98],
              [0.38, 1.025],
              [1.1, 1.02],
              [1.95, 0.97],
              [2.56, 0.85],
              [2.93, 0.72],
            ];
      tube(
        ex,
        ey,
        contour.map((q) => [z + q[0], er * q[1]]),
        [181, 198, 217],
      );
      const fy = ey + (b ? 0.1 : 0),
        outer = er * (b ? 0.87 : 0.91),
        inner = er * (b ? 0.79 : 0.86),
        lipSegments = wireframe ? 18 : 36;
      // The 737 cowling has a flattened bottom, but its raised fan and duct are
      // circular. The closed lip joins those different cross sections.
      for (let j = 0; j < lipSegments; j++) {
        const at = (t, inside) => {
          const sn = Math.sin(t),
            yy = b && sn < -0.52 ? -0.52 + (sn + 0.52) * 0.56 : sn;
          return inside
            ? [ex + Math.cos(t) * inner, fy + sn * inner, z + 0.025]
            : [ex + Math.cos(t) * outer * (b && sn < 0 ? 1 - sn * 0.045 : 1), ey + yy * outer, z];
        };
        add(
          [
            at((j / lipSegments) * Math.PI * 2, false),
            at(((j + 1) / lipSegments) * Math.PI * 2, false),
            at(((j + 1) / lipSegments) * Math.PI * 2, true),
            at((j / lipSegments) * Math.PI * 2, true),
          ],
          [204, 216, 225],
        );
      }
      tube(
        ex,
        fy,
        [
          [z + 0.025, inner],
          [z + 0.47, er * (b ? 0.77 : 0.84)],
        ],
        [56, 77, 97],
        wireframe ? 18 : 36,
        true,
      );
      const fanZ = z + 0.48,
        fanR = er * (b ? 0.76 : 0.82);
      add(
        Array.from({ length: wireframe ? 16 : 32 }, (_, j) => [
          ex + Math.cos((j / (wireframe ? 16 : 32)) * Math.PI * 2) * fanR,
          fy + Math.sin((j / (wireframe ? 16 : 32)) * Math.PI * 2) * fanR,
          fanZ,
        ]),
        dark,
        false,
      );
      part = { kind: 'fan', x: ex, y: fy };
      const bladeCount = b ? 24 : 36,
        bladeStep = (Math.PI * 2) / bladeCount;
      if (!wireframe)
        for (let j = 0; j < bladeCount; j++) {
          const t = j * bladeStep;
          add(
            [
              [ex + Math.cos(t) * er * 0.19, fy + Math.sin(t) * er * 0.19, fanZ - 0.025],
              [
                ex + Math.cos(t + bladeStep * 0.45) * fanR,
                fy + Math.sin(t + bladeStep * 0.45) * fanR,
                fanZ - 0.025,
              ],
              [
                ex + Math.cos(t + bladeStep * 0.88) * fanR * 0.94,
                fy + Math.sin(t + bladeStep * 0.88) * fanR * 0.94,
                fanZ - 0.025,
              ],
            ],
            [83, 109, 129],
            false,
          );
        }
      tube(
        ex,
        fy,
        [
          [z + 0.16, 0.018],
          [fanZ, er * 0.22],
        ],
        [91, 111, 131],
        wireframe ? 12 : 24,
        true,
      );
      part = null;
      tube(
        ex,
        fy,
        [
          [z + 2.45, er * 0.52],
          [z + 3.18, er * 0.39],
          [z + 3.62, er * 0.26],
        ],
        [84, 99, 115],
        wireframe ? 18 : 36,
        true,
      );
      add(
        Array.from({ length: 24 }, (_, j) => [
          ex + Math.cos((j / 12) * Math.PI) * er * 0.25,
          fy + Math.sin((j / 12) * Math.PI) * er * 0.25,
          z + 3.63,
        ]),
        dark,
        false,
      );
      tube(
        ex,
        fy,
        [
          [z + 3.35, er * 0.19],
          [z + 3.95, 0.025],
        ],
        [132, 145, 156],
        wireframe ? 18 : 36,
        true,
      );
      // Thin cowl and thrust-reverser joints follow the actual outer radius.
      for (const k of [2, 4]) {
        const q = contour[k];
        tube(
          ex,
          ey,
          [
            [z + q[0], er * q[1] + 0.007],
            [z + q[0] + 0.018, er * q[1] + 0.007],
          ],
          [118, 135, 151],
        );
      }
      // CFM pylon top and nacelle strakes stay fixed to the engine assembly.
      if (!wireframe)
        for (const side of [-1, 1])
          add(
            [
              [ex + side * er * 0.84, ey + er * 0.48, z + 0.65],
              [ex + side * er * 1.1, ey + er * 0.6, z + 1.28],
              [ex + side * er * 0.87, ey + er * 0.48, z + 1.8],
            ],
            [147, 168, 187],
          );
    } else {
      // Rounded intake lip, recessed fan, tapered exhaust and spinner.
      tube(
        ex,
        ey,
        [
          [z, er * 0.88],
          [z + 0.25, er],
          [z + 1 * es, er * 1.04],
          [z + 3.9 * es, er * 0.94],
          [z + 5.4 * es, er * 0.7],
        ],
        [172, 192, 215],
      );
      tube(
        ex,
        ey,
        [
          [z - 0.015 * es, er * 0.88],
          [z + 0.55, er * 0.76],
        ],
        [74, 100, 128],
      );
      const disc = Array.from({ length: 28 }, (_, j) => [
        ex + Math.cos((j / 28) * 2 * Math.PI) * er * 0.77,
        ey + Math.sin((j / 28) * 2 * Math.PI) * er * 0.77,
        z + 0.6,
      ]);
      add(disc, dark, false);
      part = { kind: 'fan', x: ex, y: ey };
      for (let j = 0; j < 20; j++) {
        const t = (j / 20) * 2 * Math.PI;
        add(
          [
            [ex + Math.cos(t) * er * 0.22, ey + Math.sin(t) * er * 0.22, z + 0.54],
            [ex + Math.cos(t + 0.16) * er * 0.73, ey + Math.sin(t + 0.16) * er * 0.73, z + 0.54],
            [ex + Math.cos(t + 0.27) * er * 0.67, ey + Math.sin(t + 0.27) * er * 0.67, z + 0.54],
          ],
          [79, 109, 139],
          false,
        );
      }
      tube(
        ex,
        ey,
        [
          [z + 0.04, 0.025],
          [z + 0.6, er * 0.24],
        ],
        [63, 81, 103],
        24,
      );
      // The spiral makes slow fan rotation readable without a high-frequency blur.
      for (let j = 0; j < 28; j++) {
        const spiral = (t) => {
            const radius = er * (0.025 + t * 0.17),
              angle = t * Math.PI * 2.5;
            return [
              ex + Math.cos(angle) * radius,
              ey + Math.sin(angle) * radius,
              z + 0.015 + (0.56 * es * radius) / (er * 0.24),
            ];
          },
          a = spiral(j / 28),
          b = spiral((j + 1) / 28),
          offset = 0.025;
        add(
          [
            [a[0] - offset, a[1], a[2]],
            [a[0] + offset, a[1], a[2]],
            [b[0] + offset, b[1], b[2]],
            [b[0] - offset, b[1], b[2]],
          ],
          [220, 234, 244],
          false,
        );
      }
      part = null;
      tube(
        ex,
        ey,
        [
          [z + 4.9 * es, er * 0.57],
          [z + 6.3 * es, er * 0.36],
        ],
        [58, 79, 101],
      );
      add(
        Array.from({ length: 24 }, (_, j) => [
          ex + Math.cos((j / 12) * Math.PI) * er * 0.36,
          ey + Math.sin((j / 12) * Math.PI) * er * 0.36,
          z + 6.31 * es,
        ]),
        dark,
        false,
      );
    }
    // A closed tapered pylon joins the nacelle to the wing's underside.
    let engineWing = stations[0];
    if (spec.narrow) {
      let k = 1;
      while (k < stations.length - 1 && spec.ex > stations[k][0]) k++;
      const p = stations[k - 1],
        q = stations[k],
        t = (spec.ex - p[0]) / (q[0] - p[0]);
      engineWing = p.map((v, i) => v + t * (q[i] - v));
    }
    const pylon = (side) =>
      spec.narrow
        ? [
            [ex + side * 0.16, engineWing[1] - 0.18, engineWing[2] + engineWing[3] * 0.12],
            [ex + side * 0.15, engineWing[1] - 0.18, engineWing[2] + engineWing[3] * 0.55],
            [ex + side * 0.13, ey + 0.6, z + 4.4 * es],
            [ex + side * 0.14, ey + 0.6, z + 1.7 * es],
          ]
        : [
            [ex + side * 0.28, -0.45, z + 3.0 * es],
            [ex + side * 0.25, -0.45, z + 5.8 * es],
            [ex + side * 0.16, -1.85, z + 4.7 * es],
            [ex + side * 0.18, -1.85, z + 1.7 * es],
          ];
    add(pylon(-1), [140, 160, 182]);
    add(pylon(1), [164, 183, 203]);
    const pl = pylon(-1),
      pr = pylon(1);
    for (let i = 0; i < 4; i++)
      add([pl[i], pr[i], pr[(i + 1) % 4], pl[(i + 1) % 4]], [147, 167, 189]);
    // Narrow nacelle panel joints and flap-track fairings remain subtle at full scale.
    if (!spec.narrow)
      for (const dz of [1.05, 3.85])
        tube(
          ex,
          ey,
          [
            [z + dz * es, er * (dz < 2 ? 1.04 : 0.94) + 0.012],
            [z + (dz + 0.025) * es, er * (dz < 2 ? 1.04 : 0.94) + 0.012],
          ],
          [114, 135, 156],
        );
    for (const x of spec.narrow
      ? [a.span * 0.1, a.span * 0.2, a.span * 0.29]
      : [7.8, 13.5, Math.min(19.5, stations[2][0] - 0.65)]) {
      let i = 1;
      while (i < stations.length - 1 && x > stations[i][0]) i++;
      const p = stations[i - 1],
        q = stations[i],
        t = (x - p[0]) / (q[0] - p[0]),
        yy = p[1] + (q[1] - p[1]) * t - 0.3,
        trailing = p[2] + p[3] + (q[2] + q[3] - p[2] - p[3]) * t;
      // The aft fairing shares its flap's swept hinge and Fowler translation.
      part = { kind: 'flap', component: 'fairing', sign, hinge: p, end: q };
      tube(
        sign * x,
        yy,
        [
          [trailing - 2.1, 0.02],
          [trailing - 1.1, 0.16],
          [trailing + 0.5, 0.12],
          [trailing + 1.3, 0.015],
        ],
        [130, 150, 172],
        12,
      );
      part = null;
    }
    // Every marking follows the same loft as the skin. The depth buffer handles
    // occlusion by wings, the nose and the opposite side of the aircraft.
    function skinPoint(y, z, lift = 0.025) {
      const q = fuselageSection(a, z),
        t = Math.asin(Math.max(-0.99, Math.min(0.99, (y - q.center) / (q.radius * q.vertical))));
      return surface(sign > 0 ? t : Math.PI - t, z, lift);
    }
    let marking = 'panel';
    function skinPatch(outline, color, lift = 0.025, material = 0) {
      if (wireframe) return;
      const at = (q) => skinPoint(q[1], q[0], lift),
        center = outline.reduce(
          (p, q) => [p[0] + q[0] / outline.length, p[1] + q[1] / outline.length],
          [0, 0],
        );
      part = { kind: 'decal', marking, sign, normal: surfaceNormal(at(center)) };
      // A large triangle's corners can be outside the skin while its middle is
      // buried inside it. Split the worst curved edge until the entire panel
      // follows the surface within 3 mm, keeping nested door outlines separated.
      function triangle(chart, depth = 0) {
        const pts = chart.map(at);
        let edge = -1,
          error = 0,
          mid = null;
        for (let i = 0; i < 3; i++) {
          const j = (i + 1) % 3,
            q = chart[i].map((v, k) => (v + chart[j][k]) / 2),
            p = at(q),
            deviation = Math.hypot(...p.map((v, k) => v - (pts[i][k] + pts[j][k]) / 2));
          if (deviation > error) {
            error = deviation;
            edge = i;
            mid = q;
          }
        }
        if (error > 0.003 && depth < 9) {
          const j = (edge + 1) % 3,
            k = (edge + 2) % 3;
          triangle([chart[edge], mid, chart[k]], depth + 1);
          triangle([mid, chart[j], chart[k]], depth + 1);
        } else add(pts, color, false, pts.map(surfaceNormal), material);
      }
      for (let i = 0; i < outline.length; i++)
        triangle([center, outline[i], outline[(i + 1) % outline.length]]);
      part = null;
    }
    function skinStroke(points, color, width = 0.025, lift = 0.043) {
      for (let i = 1; i < points.length; i++) {
        const [z, y] = points[i - 1],
          [zz, yy] = points[i],
          len = Math.hypot(zz - z, yy - y) || 1,
          dz = (((yy - y) / len) * width) / 2,
          dy = ((-(zz - z) / len) * width) / 2;
        skinPatch(
          [
            [z + dz, y + dy],
            [zz + dz, yy + dy],
            [zz - dz, yy - dy],
            [z - dz, y - dy],
          ],
          color,
          lift,
        );
      }
    }
    const rounded = (z, y, w, h, round = 0.15) => [
      [z - w / 2 + round, y - h / 2],
      [z + w / 2 - round, y - h / 2],
      [z + w / 2, y - h / 2 + round],
      [z + w / 2, y + h / 2 - round],
      [z + w / 2 - round, y + h / 2],
      [z - w / 2 + round, y + h / 2],
      [z - w / 2, y + h / 2 - round],
      [z - w / 2, y - h / 2 + round],
    ];
    const windowStep = spec.narrow ? 0.65 : a.code === 'A35K' ? 0.9 : 0.94,
      windowWidth = spec.narrow ? 0.28 : a.code === 'A35K' ? 0.42 : 0.36;
    marking = 'window';
    for (
      let wz = -half + spec.doors[0] + 1.6;
      wz < half - (spec.narrow ? (a.code === 'B737' ? 6.0 : 6.1) : 12);
      wz += windowStep
    ) {
      if (spec.doors.some((d) => Math.abs(wz - (-half + d)) < 0.9)) continue;
      skinPatch(rounded(wz, 1.0, windowWidth, 0.48, 0.11), [61, 77, 94], 0.025);
      skinPatch(rounded(wz, 1.0, windowWidth - 0.055, 0.41, 0.095), [9, 29, 43], 0.038, 1);
      skinStroke(
        [
          [wz - windowWidth * 0.2, 1.14],
          [wz + windowWidth * 0.18, 1.14],
        ],
        [80, 123, 147],
        0.023,
        0.052,
      );
    }
    function cockpitPatch(corners, color, lift, material = 1, outline = false) {
      if (wireframe) return;
      const mix = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t),
        flat =
          a.code === 'B737'
            ? corners.map(([t, d]) => surface(sign > 0 ? t : Math.PI - t, -half + d, lift))
            : null,
        physical = ['A339', 'A35K'].includes(a.code)
          ? corners.map(([t, d]) => [surface(t, -half + d)[1], d])
          : null,
        fromHeight = (y, d) => {
          const q = fuselageSection(a, -half + d),
            t = Math.asin(Math.max(-1, Math.min(1, (y - q.center) / (q.radius * q.vertical))));
          return surface(sign > 0 ? t : Math.PI - t, -half + d, lift);
        },
        at = (u, v) => {
          if (outline) return fromHeight(u, v);
          if (physical) {
            let [y, d] = mix(mix(physical[0], physical[1], u), mix(physical[3], physical[2], u), v);
            if (Math.abs(corners[0][0] - 1.54) < 0.001 && Math.abs(corners[3][0] - 1.54) < 0.001) {
              const dd = physical[0][1] * (1 - v) + physical[3][1] * v,
                actual = surface(1.54, -half + dd)[1],
                linear = physical[0][0] * (1 - v) + physical[3][0] * v;
              y += (actual - linear) * (1 - u);
            }
            return fromHeight(y, d);
          }
          if (flat)
            return flat[0].map((x, i) =>
              u >= v
                ? x * (1 - u) + flat[1][i] * (u - v) + flat[2][i] * v
                : x * (1 - v) + flat[2][i] * u + flat[3][i] * (v - u),
            );
          const [t, d] = mix(mix(corners[0], corners[1], u), mix(corners[3], corners[2], u), v);
          return surface(sign > 0 ? t : Math.PI - t, -half + d, lift);
        };
      function triangle(chart, depth = 0) {
        const pts = chart.map((q) => at(...q));
        let error = 0,
          edge = -1,
          mid = null;
        for (let i = 0; i < 3; i++) {
          const j = (i + 1) % 3,
            q = chart[i].map((v, k) => (v + chart[j][k]) / 2),
            p = at(...q),
            e = Math.hypot(...p.map((v, k) => v - (pts[i][k] + pts[j][k]) / 2));
          if (e > error) {
            error = e;
            edge = i;
            mid = q;
          }
        }
        if (physical && depth < 10) {
          const center = chart[0].map((v, i) => (v + chart[1][i] + chart[2][i]) / 3),
            sample = at(...center),
            deviation = Math.hypot(
              ...sample.map((v, i) => v - (pts[0][i] + pts[1][i] + pts[2][i]) / 3),
            );
          if (deviation > 0.002 && deviation > error) {
            for (let i = 0; i < 3; i++) triangle([chart[i], chart[(i + 1) % 3], center], depth + 1);
            return;
          }
        }
        if (error > (physical ? 0.002 : 0.003) && depth < (physical ? 10 : 8)) {
          const j = (edge + 1) % 3,
            k = (edge + 2) % 3;
          triangle([chart[edge], mid, chart[k]], depth + 1);
          triangle([mid, chart[j], chart[k]], depth + 1);
        } else {
          part = outline
            ? { kind: 'glazing', component: 'mask', normal: surfaceNormal(pts[0]) }
            : { kind: 'glazing', normal: surfaceNormal(pts[0]) };
          add(pts, color, false, pts.map(surfaceNormal), material);
        }
      }
      if (outline) {
        const center = corners.reduce(
          (m, p) => [m[0] + p[0] / corners.length, m[1] + p[1] / corners.length],
          [0, 0],
        );
        for (let i = 0; i < corners.length; i++)
          triangle([center, corners[i], corners[(i + 1) % corners.length]]);
        part = null;
        return;
      }
      for (let u = 0; u < 4; u++)
        for (let v = 0; v < 4; v++) {
          const p = [
            [u / 4, v / 4],
            [(u + 1) / 4, v / 4],
            [(u + 1) / 4, (v + 1) / 4],
            [u / 4, (v + 1) / 4],
          ];
          triangle([p[0], p[1], p[2]]);
          triangle([p[0], p[2], p[3]]);
        }
      part = null;
    }
    const boeing = a.code === 'B77W' || a.code === 'B737',
      xwb = a.code === 'A35K',
      stretch = xwb ? 1.08 : boeing ? 1 : 0.9;
    // Six distinct panes. The front windshield is swept back; side panes follow
    // the shoulder without turning into a continuous roof-wide glass band.
    // Define the window belt by its physical height, not by an angle that
    // drops along the widening fuselage. The lateral pane sills stay aligned.
    const paneCharts =
      a.code === 'B737'
        ? spec.cockpit
        : a.code === 'A321'
          ? [
              [
                [null, 2.0],
                [1.13, 2.35],
                [0.62, 1.76],
                [null, 1.32],
              ],
              [
                [1.15, 2.43],
                [1.15, 2.95],
                [0.55, 2.94],
                [0.62, 1.9],
              ],
              [
                [1.15, 3.03],
                [1.05, 3.51],
                [0.56, 3.51],
                [0.55, 3.02],
              ],
            ]
          : boeing
            ? [
                [
                  [null, 2.63],
                  [1.62, 3.06],
                  [0.7, 2.4],
                  [null, 1.64],
                ],
                [
                  [1.64, 3.15],
                  [1.62, 3.56],
                  [0.61, 3.6],
                  [0.71, 2.53],
                ],
                [
                  [1.62, 3.65],
                  [1.57, 4.06],
                  [0.62, 4.05],
                  [0.61, 3.7],
                ],
              ]
            : xwb
              ? [
                  [
                    [null, 2.75],
                    [1.71, 3.95],
                    [0.75, 3.1],
                    [null, 1.35],
                  ],
                  [
                    [1.73, 4.04],
                    [1.8, 4.48],
                    [0.66, 4.45],
                    [0.77, 3.25],
                  ],
                  [
                    [1.8, 4.56],
                    [1.76, 5.23],
                    [0.69, 5.15],
                    [0.64, 4.52],
                  ],
                ]
              : [
                  [
                    [null, a.code === 'A339' ? 1.91 : 2.22],
                    [1.4, 2.71],
                    [0.65, 2.15],
                    [null, a.code === 'A339' ? 1.05 : 1.34],
                  ],
                  [
                    [1.42, 2.8],
                    [1.44, 3.21],
                    [0.63, 3.22],
                    [0.66, 2.27],
                  ],
                  [
                    [1.44, 3.3],
                    [1.42, 3.93],
                    [0.61, 3.91],
                    [0.62, 3.3],
                  ],
                ];
    const cockpitChart = ([y, d]) => {
        const s = fuselageSection(a, -half + d);
        return [
          y === null
            ? 1.54
            : Math.asin(Math.max(-0.99, Math.min(0.99, (y - s.center) / (s.radius * s.vertical)))),
          d,
        ];
      },
      panes = paneCharts.map((p) => p.map(cockpitChart));
    const masked = xwb || a.code === 'A339';
    if (masked) {
      // Follow the entire glazing perimeter. The centreline reaches pi/2 so
      // the two halves form one continuous mask, without a white nose seam.
      const border = xwb
        ? [
            [null, 2.92],
            [1.91, 3.94],
            [1.99, 4.55],
            [1.94, 5.1],
            [1.83, 5.36],
            [1.54, 5.45],
            [0.91, 5.4],
            [0.57, 5.22],
            [0.5, 4.49],
            [0.56, 3.12],
            [null, 1.23],
          ]
        : [
            [null, 2.02],
            [1.55, 2.73],
            [1.6, 3.28],
            [1.58, 3.73],
            [1.49, 4.02],
            [1.21, 4.13],
            [0.8, 4.1],
            [0.48, 3.94],
            [0.46, 3.27],
            [0.5, 2.15],
            [null, 0.95],
          ];
      const mask = border.map(([y, d]) => [y === null ? surface(Math.PI / 2, -half + d)[1] : y, d]);
      for (let d = border.at(-1)[1] + 0.12; d < border[0][1]; d += 0.12)
        mask.push([surface(Math.PI / 2, -half + d)[1], d]);
      cockpitPatch(mask, [17, 24, 31], 0.036, 0, true);
      // A narrow centre mullion closes the joint between the mirrored halves.
      // It follows the actual crown curve at each station, not its end chord.
      for (let d = border.at(-1)[1]; d < border[0][1]; d += 0.08) {
        const end = Math.min(border[0][1], d + 0.08),
          at = (t, z) => surface(sign > 0 ? t : Math.PI - t, -half + z, 0.09),
          p = [
            at(Math.PI / 2 - 0.055, d),
            at(Math.PI / 2, d),
            at(Math.PI / 2, end),
            at(Math.PI / 2 - 0.055, end),
          ];
        for (const ids of [
          [0, 1, 2],
          [0, 2, 3],
        ]) {
          const q = ids.map((i) => p[i]);
          part = { kind: 'glazing', component: 'mask', normal: surfaceNormal(q[0]) };
          add(q, [17, 24, 31], false, q.map(surfaceNormal));
        }
        part = null;
      }
    }
    for (const pane of panes) {
      cockpitPatch(
        pane,
        masked ? [43, 52, 59] : a.code === 'B737' ? [173, 188, 202] : [102, 117, 131],
        masked ? 0.057 : 0.047,
        0,
      );
      const mid = pane.reduce((m, p) => [m[0] + p[0] / 4, m[1] + p[1] / 4], [0, 0]);
      cockpitPatch(
        pane.map((p) => p.map((v, i) => mid[i] + (v - mid[i]) * (a.code === 'B737' ? 0.94 : 0.9))),
        [19, 41, 55],
        masked ? 0.083 : 0.073,
      );
    }
    const front = panes[0],
      mix = (p, q, t) => p.map((v, i) => v + (q[i] - v) * t);
    // Narrow highlights are clipped to each pane. Raised wipers have a short
    // arm and blade below the pilot's direct line of sight.
    for (const pane of panes.slice(0, 2)) {
      const [p, q, r, s] = pane;
      cockpitPatch(
        [mix(p, s, 0.14), mix(q, r, 0.14), mix(q, r, 0.23), mix(p, s, 0.23)],
        [60, 94, 112],
        0.092,
      );
    }
    if (!wireframe) {
      const point = (q) => surface(sign > 0 ? q[0] : Math.PI - q[0], -half + q[1], 0.108),
        p = mix(front[3], front[2], 0.3),
        q = mix(front[3], front[2], 0.72),
        blade = mix(q, front[1], 0.22);
      beam(point(p), point(q), 0.018, [36, 43, 49]);
      beam(point(q), point(blade), 0.025, [26, 32, 39]);
    }
    // Passenger/crew exits: five pairs on the 777-300ER, four on each Airbus.
    marking = 'exit';
    for (const [i, d] of spec.doors.entries()) {
      const z = -half + d,
        small = (a.code === 'B77W' && i === 2) || (a.code === 'B737' && i === 1),
        w = small ? (spec.narrow ? 0.75 : 0.92) : spec.narrow ? 0.86 : 1.06,
        h = small ? (spec.narrow ? 0.92 : 1.65) : spec.narrow ? 1.8 : 1.96,
        cy = small && spec.narrow ? 0.85 : 0.53,
        outline = rounded(z, cy, w, h, 0.16);
      skinPatch(outline, [103, 120, 137], 0.034);
      skinPatch(rounded(z, cy, w - 0.07, h - 0.07, 0.14), [195, 209, 224], 0.052);
      skinPatch(rounded(z, 1.02, 0.23, 0.33, 0.065), [64, 83, 101], 0.071);
      skinPatch(rounded(z, 1.02, 0.17, 0.26, 0.05), [15, 39, 56], 0.085, 1);
      skinPatch(rounded(z + 0.18, 0.37, 0.27, 0.12, 0.04), [88, 104, 119], 0.074);
      skinStroke(
        [
          [z + 0.09, 0.37],
          [z + 0.26, 0.37],
        ],
        [208, 99, 84],
        0.035,
        0.09,
      );
      // Exterior rescue outline and a red locator strip above the exit.
      skinStroke(
        [
          [z - 0.17, cy + h / 2 + 0.13],
          [z + 0.17, cy + h / 2 + 0.13],
        ],
        [160, 67, 62],
        0.055,
        0.063,
      );
      skinStroke(
        [
          [z - w * 0.34, cy - h / 2 + 0.08],
          [z + w * 0.34, cy - h / 2 + 0.08],
        ],
        [121, 139, 155],
        0.023,
        0.073,
      );
    }
    // Cargo door outlines are only on the aircraft's right-hand side.
    marking = 'cargo';
    if (sign > 0)
      for (const d of spec.narrow
        ? a.code === 'B737'
          ? [8.4, 22.5]
          : [9.1, 32]
        : [spec.doors[1] - 4, a.len - 20]) {
        const z = -half + d,
          c = spec.narrow ? 0.66 : 1;
        skinPatch(rounded(z, -1.25 * c, 2.8 * c, 1.55 * c, 0.15), [107, 124, 140], 0.026);
        skinPatch(rounded(z, -1.25 * c, 2.73 * c, 1.48 * c, 0.13), [190, 205, 220], 0.045);
        skinPatch(rounded(z + 0.75 * c, -1.16 * c, 0.28, 0.12, 0.03), [71, 87, 105], 0.065);
      }
    // Pitot probes sit below and behind the radome, clear of the windshield.
    const probe = skinPoint(
      0.05,
      -half + (a.code === 'B737' ? 1.65 : spec.narrow ? 2.6 : 3.6 * stretch),
      0.04,
    );
    beam(probe, [probe[0] + sign * 0.17, probe[1] - 0.04, probe[2] - 0.56], 0.025, [162, 181, 199]);
    {
      const gx = sign * spec.gearX,
        gz = spec.gearZ,
        wy = spec.ground + spec.tire;
      function wingBelly(x, z) {
        let i = 1;
        while (i < stations.length - 1 && x > stations[i][0]) i++;
        const h = stations[i - 1],
          e = stations[i],
          t = (x - h[0]) / (e[0] - h[0]),
          s = h.map((v, k) => v + (e[k] - v) * t),
          f = Math.max(0, Math.min(1, (z - s[2]) / s[3]));
        return s[1] - Math.sin(Math.PI * f) * s[4] - 0.025;
      }
      const mountY = wingBelly(spec.gearX, gz);
      part = { kind: 'mainGear', sign, pivot: [gx, mountY, gz] };
      // All exposed braces terminate at fittings beneath the wing. No endpoint is
      // placed inside the fuselage; internal sections are hidden by depth testing.
      beam([gx, mountY, gz], [gx, wy + 0.98, gz], 0.17, [133, 151, 170]);
      beam([gx, wy + 1.3, gz], [gx, wy + 0.12, gz], 0.095, [216, 226, 235]);
      beam(
        [gx, wy + 1.0, gz],
        [
          sign * (spec.narrow ? spec.gearX + 0.2 : 3.85),
          wingBelly(spec.narrow ? spec.gearX + 0.2 : 3.85, gz - 1.7),
          gz - 1.7,
        ],
        0.075,
        [149, 166, 185],
      );
      beam(
        [gx, wy + 1.5, gz],
        [
          sign * (spec.narrow ? spec.gearX + 0.4 : 4.15),
          wingBelly(spec.narrow ? spec.gearX + 0.4 : 4.15, gz + 1.35),
          gz + 1.35,
        ],
        0.07,
        [144, 161, 180],
      );
      beam(
        [gx + 0.13, wy + 0.65, gz - 0.15],
        [gx + 0.13, wy + 1.5, gz + 0.18],
        0.055,
        [104, 125, 148],
      );
      const spacing = spec.axles === 3 ? 1.36 : 1.4,
        start = gz - ((spec.axles - 1) * spacing) / 2;
      beam(
        [gx, wy, start - 0.26],
        [gx, wy, start + (spec.axles - 1) * spacing + 0.26],
        0.16,
        [98, 119, 142],
      );
      for (let k = 0; k < spec.axles; k++) {
        const z = start + k * spacing;
        beam([gx - 0.84, wy, z], [gx + 0.84, wy, z], 0.095, [168, 185, 202]);
        wheel(gx, wy, z, spec.tire);
      }
      part = null;
    }
  }
  // A swept, closed airfoil fin with a dorsal root fillet and separate rudder.
  // Curved thickness and vertex normals remove the old faceted triangular cap.
  const finSections = spec.finSections.map((q) => [q[0], half - q[1], q[2], q[3]]),
    fractions = wireframe ? [0, 0.12, 0.48, 0.73, 1] : [0, 0.055, 0.2, 0.46, 0.73, 0.744, 0.93, 1];
  const finPoint = (q, f, side) => [
    side *
      q[3] *
      (2.969 * Math.sqrt(f) - 1.26 * f - 3.516 * f * f + 2.843 * f * f * f - 1.036 * f * f * f * f),
    q[0],
    q[1] + q[2] * f,
  ];
  for (let k = 1; k < finSections.length; k++)
    for (const side of [-1, 1])
      for (let j = 1; j < fractions.length; j++) {
        const u = fractions[j - 1],
          v = fractions[j],
          lo = finSections[k - 1],
          hi = finSections[k],
          p = [
            finPoint(lo, u, side),
            finPoint(hi, u, side),
            finPoint(hi, v, side),
            finPoint(lo, v, side),
          ],
          rudder = u >= 0.744,
          groove = u >= 0.73 && v <= 0.744;
        const normals = p.map((point, i) => {
          const f = i < 2 ? u : v,
            q = i === 1 || i === 2 ? hi : lo,
            e = 0.002,
            a1 = finPoint(q, Math.max(0, f - e), side),
            b1 = finPoint(q, Math.min(1, f + e), side),
            chord = b1.map((x, k) => x - a1[k]),
            span = finPoint(hi, f, side).map((x, k) => x - finPoint(lo, f, side)[k]);
          return [
            side * Math.abs(span[1] * chord[2]),
            -side * (span[0] * chord[2] - span[2] * chord[0]),
            -side * span[1] * chord[0],
          ];
        });
        add(
          p,
          groove ? [36, 66, 99] : rudder ? [65, 118, 174] : [75, 132, 193],
          true,
          normals,
          0.12,
        );
      }
  const cap = finSections.at(-1);
  for (let j = 1; j < fractions.length; j++)
    add(
      [
        finPoint(cap, fractions[j - 1], -1),
        finPoint(cap, fractions[j - 1], 1),
        finPoint(cap, fractions[j], 1),
        finPoint(cap, fractions[j], -1),
      ],
      [116, 158, 203],
    );
  // The APU outlet belongs to the raised tail cone, not to the body centreline.
  const aft = fuselageSection(a, half),
    apuPoint = (z, rr, t) => [Math.cos(t) * rr, aft.center + Math.sin(t) * rr * aft.vertical, z],
    apuN = wireframe ? 12 : 24;
  for (let j = 0; j < apuN; j++) {
    const t = (j / apuN) * Math.PI * 2,
      u = ((j + 1) / apuN) * Math.PI * 2;
    add(
      [
        apuPoint(half - 0.18, aft.radius * 1.1, t),
        apuPoint(half + 0.1, aft.radius * 0.94, t),
        apuPoint(half + 0.1, aft.radius * 0.94, u),
        apuPoint(half - 0.18, aft.radius * 1.1, u),
      ],
      [105, 122, 139],
      false,
      null,
      0.5,
    );
  }
  add(
    Array.from({ length: apuN }, (_, j) =>
      apuPoint(half + 0.105, aft.radius * 0.85, (j / apuN) * Math.PI * 2),
    ),
    [14, 22, 30],
    false,
  );
  function beam(a, b, radius, color) {
    const axis = b.map((v, i) => v - a[i]),
      len = Math.hypot(...axis),
      n = axis.map((v) => v / len),
      ref = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0],
      cross = (u, v) => [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ],
      raw = cross(n, ref),
      size = Math.hypot(...raw),
      u = raw.map((v) => v / size),
      v = cross(n, u),
      point = (p, t) => p.map((x, i) => x + radius * (u[i] * Math.cos(t) + v[i] * Math.sin(t)));
    for (let j = 0; j < 8; j++)
      add(
        [
          point(a, (j * Math.PI) / 4),
          point(b, (j * Math.PI) / 4),
          point(b, ((j + 1) * Math.PI) / 4),
          point(a, ((j + 1) * Math.PI) / 4),
        ],
        color,
      );
  }
  function wheel(x, y, z, rad, track = spec.narrow ? 0.46 : 0.65) {
    for (const side of [-1, 1]) {
      const xx = x + side * track,
        N = 24,
        sections = spec.narrow
          ? [
              [-0.19, 0.83],
              [-0.12, 1],
              [0.12, 1],
              [0.19, 0.83],
            ]
          : [
              [-0.27, 0.83],
              [-0.16, 1],
              [0.16, 1],
              [0.27, 0.83],
            ],
        at = (q, t) => [xx + q[0], y + Math.cos(t) * rad * q[1], z + Math.sin(t) * rad * q[1]];
      for (let k = 1; k < sections.length; k++)
        for (let j = 0; j < N; j++)
          add(
            [
              at(sections[k - 1], (j / N) * 2 * Math.PI),
              at(sections[k], (j / N) * 2 * Math.PI),
              at(sections[k], ((j + 1) / N) * 2 * Math.PI),
              at(sections[k - 1], ((j + 1) / N) * 2 * Math.PI),
            ],
            [20, 27, 36],
            false,
          );
      for (const [r, col] of [
        [0.81, [10, 16, 23]],
        [0.48, [151, 174, 196]],
        [0.2, [67, 90, 114]],
      ])
        add(
          Array.from({ length: N }, (_, j) => [
            xx + side * ((spec.narrow ? 0.195 : 0.275) + (1 - r) * 0.015),
            y + Math.cos((j / N) * 2 * Math.PI) * rad * r,
            z + Math.sin((j / N) * 2 * Math.PI) * rad * r,
          ]),
          col,
          false,
        );
    }
  }
  {
    const z = -half + (spec.noseGearD || 8.6),
      section = fuselageSection(a, z),
      rootY = section.center - section.radius * section.vertical - 0.035,
      braceSection = fuselageSection(a, z + 1.55),
      braceY = braceSection.center - braceSection.radius * braceSection.vertical - 0.12,
      wy = spec.ground + (spec.noseTire || 0.47);
    // The visible assembly ends below the actual belly, not at a hard-coded
    // point inside the pressure hull. Use the same fitting as its rotation pivot.
    part = { kind: 'noseGear', pivot: [0, rootY, z] };
    const stroke = spec.narrow ? Math.max(0.18, rootY - wy) * 0.65 : 0.65;
    beam([0, rootY, z], [0, wy + stroke, z], 0.13, [149, 168, 189]);
    beam([0, wy + (spec.narrow ? stroke + 0.12 : 0.87), z], [0, wy, z], 0.075, [224, 233, 242]);
    beam([0, wy + 0.62, z], [0, braceY, z + 1.55], 0.065, [151, 169, 187]);
    beam([-0.46, wy, z], [0.46, wy, z], 0.075, [166, 186, 207]);
    wheel(0, wy, z, spec.noseTire || 0.47, spec.narrow ? 0.24 : 0.35);
    part = null;
  }
  // Radome seam and small dorsal antennas.
  for (const d of [
    spec.narrow
      ? a.code === 'B737'
        ? 1.33
        : 1.05
      : a.code === 'A35K'
        ? 1.75
        : a.code === 'B77W'
          ? 1.35
          : 1.05,
    a.len - 5.8,
  ])
    for (let j = 0; j < N; j++) {
      const t = (j / N) * Math.PI * 2,
        tt = ((j + 1) / N) * Math.PI * 2,
        z = -half + d,
        at = (angle, delta) =>
          surface(
            angle,
            z + delta - (a.code === 'B737' && d === 1.33 ? 0.42 * Math.sin(angle) : 0),
            0.018,
          );
      const p = [at(t, -0.012), at(tt, -0.012), at(tt, 0.012), at(t, 0.012)];
      add(p, [116, 136, 154], false, p.map(surfaceNormal));
    }
  if (a.code === 'B737' && !wireframe) {
    // Short lightning diverter strips on the radome; all vertices sit on
    // the same nose surface, so they cannot float in front of the cowling.
    for (const theta of [0.28, 0.82, 1.34, 1.8, 2.32, 2.86])
      for (let k = 0; k < 5; k++) {
        const d = 0.28 + k * 0.12,
          z = -half + d,
          w = 0.012,
          p = [
            surface(theta - w, z, 0.023),
            surface(theta + w, z, 0.023),
            surface(theta + w, z + 0.105, 0.023),
            surface(theta - w, z + 0.105, 0.023),
          ];
        add(p, [183, 198, 213], false, p.map(surfaceNormal));
      }
  }
  for (const d of [13, a.len * 0.52]) {
    const z = -half + d,
      y =
        fuselageSection(a, z).center +
        fuselageSection(a, z).radius * fuselageSection(a, z).vertical;
    add(
      [
        [-0.055, y, z],
        [0.055, y, z],
        [0.04, y + 0.56, z + 0.5],
        [-0.04, y + 0.56, z + 0.5],
      ],
      [127, 149, 173],
    );
    add(
      [
        [-0.04, y + 0.56, z + 0.5],
        [0.04, y + 0.56, z + 0.5],
        [0.035, y + 0.12, z + 0.9],
        [-0.035, y + 0.12, z + 0.9],
      ],
      [168, 189, 209],
    );
  }

  if (!wireframe) {
    // Low silhouette satcom radome and static dischargers; these are omitted
    // from the lightweight wire mesh.
    const z = -half + a.len * 0.39,
      q = fuselageSection(a, z),
      y = q.center + q.radius * q.vertical - 0.04;
    for (let k = 0; k < 5; k++)
      for (let j = 0; j < 16; j++) {
        const point = (u, t) => {
          const f = ((u / 5) * Math.PI) / 2;
          return [
            Math.cos(t) * (spec.narrow ? 0.4 : 0.64) * Math.cos(f),
            y + (spec.narrow ? 0.23 : 0.4) * Math.sin(f),
            z + Math.sin(t) * (spec.narrow ? 1.1 : 1.65) * Math.cos(f),
          ];
        };
        add(
          [
            point(k, (j / 8) * Math.PI),
            point(k + 1, (j / 8) * Math.PI),
            point(k + 1, ((j + 1) / 8) * Math.PI),
            point(k, ((j + 1) / 8) * Math.PI),
          ],
          [186, 203, 220],
          false,
        );
      }
    for (const sign of [-1, 1])
      for (const st of [
        wingGeometry(a).stations.slice(-3, -1),
        spec.stabilizer.slice(-2).map((q) => [q[0], q[1], half - q[2], q[3], q[4]]),
      ])
        for (const q of st) {
          const p = [sign * (q[0] - 0.2), q[1], q[2] + q[3]];
          beam(p, [p[0], p[1] - 0.025, p[2] + 0.36], 0.014, [71, 84, 97]);
        }
    for (const light of aircraftLightLayout(a)) {
      part = light.part;
      const n = light.housingNormal || light.normal,
        len = Math.hypot(...n),
        axis = n.map((v) => v / len),
        ref = Math.abs(axis[1]) > 0.8 ? [1, 0, 0] : [0, 1, 0],
        u = [
          axis[1] * ref[2] - axis[2] * ref[1],
          axis[2] * ref[0] - axis[0] * ref[2],
          axis[0] * ref[1] - axis[1] * ref[0],
        ],
        un = Math.hypot(...u),
        v = [
          axis[1] * u[2] - axis[2] * u[1],
          axis[2] * u[0] - axis[0] * u[2],
          axis[0] * u[1] - axis[1] * u[0],
        ],
        projector = ['landing', 'taxi'].includes(light.group),
        beacon = light.group === 'beacon' || light.group === 'lowerBeacon',
        radius =
          (projector ? 0.14 : beacon ? 0.105 : light.group === 'strobe' ? 0.065 : 0.075) *
          (spec.narrow ? 0.8 : 1),
        depth = beacon ? 0.11 : projector ? 0.028 : 0.035,
        rgb = light.color.match(/[a-f\d]{2}/gi).map((v) => parseInt(v, 16));
      const disc = (rr, lift) =>
        Array.from({ length: 10 }, (_, j) =>
          light.point.map(
            (x, i) =>
              x +
              axis[i] * lift +
              (rr * (u[i] * Math.cos((j * Math.PI) / 5) + v[i] * Math.sin((j * Math.PI) / 5))) / un,
          ),
        );
      const rings = [
        disc(radius * 1.3, -0.014),
        disc(radius * 1.18, 0),
        disc(radius, 0.008),
        disc(radius * 0.82, depth),
      ];
      for (let k = 1; k < rings.length; k++)
        for (let j = 0; j < 10; j++)
          add(
            [rings[k - 1][j], rings[k - 1][(j + 1) % 10], rings[k][(j + 1) % 10], rings[k][j]],
            k === 1
              ? [65, 78, 93]
              : k === 2
                ? [169, 187, 203]
                : rgb.map((v) => v * (beacon ? 0.58 : 0.78)),
            false,
            null,
            k === 2 ? 0.85 : 0.55,
          );
      add(
        rings.at(-1),
        rgb.map((v) => v * 0.85),
        false,
        null,
        0.8,
      );
      if (projector) {
        const centre = light.point.map((v, i) => v + axis[i] * (depth + 0.002));
        add(disc(radius * 0.34, depth + 0.003), [224, 229, 225], false, null, 0.7);
        beam(
          centre.map((v, i) => v - (u[i] * radius * 0.75) / un),
          centre.map((v, i) => v + (u[i] * radius * 0.75) / un),
          0.007,
          [105, 121, 135],
        );
      }
      part = null;
    }
  }

  return faces;
}

export function smoothStep(t) {
  return t * t * (3 - 2 * t);
}
