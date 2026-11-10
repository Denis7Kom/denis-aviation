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
        tip: 0.75,
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
      fractions: [0, 0.012, 0.035, 0.075, 0.16, 0.38, 0.56, 0.7, 0.72, 0.86, 0.94, 1],
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
      ['landing', spec.gearX + (spec.narrow ? 0.55 : 0.9), 0.18, 2.2, '#f5f2df'],
      ['turnoff', a.r + 0.8, 0.19, 1.45, '#fff0d1'],
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
  // Higher-resolution glyph masks keep contours smooth when the aircraft is enlarged.
  const liveryGlyphs = {
    AEROFLOT: {
      width: 269,
      height: 36,
      rects: [
        [121, 0, 128, 1],
        [217, 0, 224, 1],
        [116, 1, 132, 2],
        [44, 1, 69, 2],
        [18, 1, 27, 2],
        [148, 1, 171, 2],
        [242, 1, 269, 2],
        [177, 1, 184, 2],
        [76, 1, 97, 2],
        [212, 1, 228, 2],
        [176, 2, 184, 3],
        [75, 2, 98, 3],
        [115, 2, 132, 3],
        [211, 2, 229, 3],
        [17, 2, 27, 3],
        [75, 3, 99, 4],
        [17, 3, 28, 4],
        [113, 3, 134, 4],
        [209, 3, 230, 4],
        [16, 4, 28, 5],
        [112, 4, 135, 5],
        [75, 4, 100, 5],
        [241, 2, 268, 5],
        [147, 2, 171, 5],
        [208, 4, 232, 5],
        [75, 5, 101, 6],
        [147, 5, 170, 6],
        [176, 3, 183, 6],
        [207, 5, 232, 6],
        [111, 5, 135, 6],
        [240, 5, 268, 7],
        [15, 5, 28, 7],
        [110, 6, 121, 7],
        [74, 6, 101, 7],
        [146, 6, 170, 7],
        [126, 6, 136, 7],
        [207, 6, 218, 7],
        [43, 2, 68, 7],
        [223, 6, 232, 7],
        [15, 7, 29, 8],
        [206, 7, 214, 8],
        [225, 7, 233, 8],
        [110, 7, 118, 8],
        [94, 7, 101, 9],
        [74, 7, 81, 9],
        [176, 6, 182, 9],
        [43, 7, 49, 9],
        [109, 8, 117, 9],
        [129, 7, 137, 9],
        [205, 8, 213, 9],
        [146, 7, 153, 10],
        [250, 7, 257, 10],
        [226, 8, 234, 10],
        [73, 9, 81, 10],
        [108, 9, 116, 10],
        [130, 9, 137, 10],
        [14, 8, 21, 10],
        [249, 10, 257, 11],
        [131, 10, 137, 11],
        [13, 10, 21, 11],
        [204, 9, 212, 11],
        [175, 9, 182, 12],
        [95, 9, 101, 12],
        [107, 10, 115, 12],
        [227, 10, 234, 12],
        [146, 10, 152, 12],
        [42, 9, 49, 12],
        [131, 11, 138, 12],
        [204, 11, 211, 12],
        [12, 11, 20, 12],
        [94, 12, 101, 13],
        [41, 12, 49, 13],
        [203, 12, 210, 13],
        [22, 8, 29, 13],
        [73, 10, 80, 13],
        [145, 12, 152, 13],
        [107, 12, 114, 13],
        [174, 12, 182, 13],
        [249, 11, 256, 14],
        [41, 13, 48, 14],
        [12, 12, 19, 14],
        [203, 13, 209, 15],
        [145, 13, 151, 15],
        [41, 14, 66, 15],
        [93, 13, 101, 15],
        [11, 14, 18, 15],
        [107, 13, 113, 15],
        [145, 15, 168, 16],
        [10, 15, 18, 16],
        [174, 13, 181, 16],
        [41, 15, 65, 16],
        [90, 15, 100, 16],
        [73, 13, 79, 16],
        [173, 16, 181, 17],
        [72, 16, 99, 18],
        [10, 16, 17, 18],
        [23, 13, 29, 18],
        [202, 15, 209, 18],
        [248, 14, 255, 18],
        [228, 12, 234, 18],
        [106, 15, 112, 18],
        [132, 12, 138, 18],
        [72, 18, 97, 19],
        [9, 18, 16, 19],
        [144, 16, 168, 19],
        [131, 18, 138, 19],
        [40, 16, 65, 20],
        [72, 19, 96, 20],
        [144, 19, 167, 20],
        [173, 17, 180, 20],
        [131, 19, 137, 21],
        [248, 18, 254, 21],
        [71, 20, 93, 21],
        [40, 20, 47, 21],
        [8, 19, 15, 21],
        [143, 20, 167, 21],
        [227, 18, 234, 21],
        [226, 21, 234, 22],
        [7, 21, 15, 22],
        [24, 18, 30, 22],
        [173, 20, 179, 23],
        [85, 21, 93, 23],
        [40, 21, 46, 23],
        [130, 21, 137, 23],
        [7, 22, 30, 23],
        [201, 18, 208, 24],
        [247, 21, 254, 24],
        [226, 22, 233, 24],
        [7, 23, 31, 24],
        [143, 21, 150, 24],
        [86, 23, 93, 24],
        [71, 21, 78, 24],
        [129, 23, 137, 24],
        [246, 24, 254, 25],
        [6, 24, 31, 25],
        [225, 24, 232, 25],
        [87, 24, 94, 25],
        [105, 18, 112, 25],
        [129, 24, 136, 25],
        [201, 24, 209, 25],
        [128, 25, 136, 26],
        [5, 25, 31, 26],
        [172, 23, 179, 26],
        [224, 25, 232, 26],
        [39, 23, 46, 26],
        [106, 25, 112, 26],
        [71, 24, 77, 26],
        [143, 24, 149, 26],
        [87, 25, 95, 26],
        [246, 25, 253, 27],
        [70, 26, 77, 27],
        [142, 26, 149, 27],
        [202, 25, 209, 27],
        [88, 26, 96, 27],
        [106, 26, 113, 27],
        [127, 26, 134, 27],
        [38, 26, 46, 27],
        [4, 26, 31, 27],
        [171, 26, 179, 27],
        [126, 27, 134, 28],
        [106, 27, 114, 28],
        [245, 27, 253, 28],
        [223, 26, 231, 28],
        [4, 27, 32, 28],
        [202, 27, 210, 28],
        [203, 28, 211, 29],
        [89, 27, 96, 29],
        [38, 27, 45, 29],
        [107, 28, 115, 29],
        [125, 28, 134, 29],
        [171, 27, 178, 29],
        [4, 28, 11, 29],
        [221, 28, 230, 29],
        [218, 29, 229, 30],
        [70, 27, 76, 30],
        [204, 29, 213, 30],
        [38, 29, 65, 30],
        [107, 29, 117, 30],
        [142, 27, 148, 30],
        [122, 29, 133, 30],
        [3, 29, 10, 30],
        [204, 30, 229, 31],
        [90, 29, 97, 31],
        [107, 30, 132, 31],
        [37, 30, 65, 31],
        [90, 31, 98, 32],
        [204, 31, 228, 32],
        [108, 31, 132, 32],
        [2, 30, 10, 32],
        [245, 28, 252, 32],
        [25, 28, 32, 33],
        [206, 32, 226, 33],
        [1, 32, 9, 33],
        [110, 32, 129, 34],
        [171, 29, 196, 34],
        [37, 31, 64, 34],
        [207, 33, 225, 34],
        [141, 30, 148, 34],
        [69, 30, 76, 34],
        [245, 32, 251, 35],
        [140, 34, 147, 35],
        [112, 34, 127, 35],
        [26, 33, 32, 35],
        [170, 34, 195, 35],
        [1, 33, 8, 35],
        [37, 34, 63, 35],
        [91, 32, 98, 35],
        [68, 34, 75, 35],
        [208, 34, 223, 35],
        [212, 35, 219, 36],
        [115, 35, 123, 36],
      ],
    },
    American: {
      width: 203,
      height: 36,
      rects: [
        [13, 0, 19, 3],
        [120, 0, 124, 4],
        [12, 3, 20, 5],
        [11, 5, 21, 6],
        [11, 6, 15, 7],
        [17, 6, 21, 7],
        [83, 9, 90, 10],
        [192, 9, 197, 10],
        [44, 9, 50, 10],
        [10, 7, 14, 10],
        [162, 9, 170, 10],
        [138, 9, 145, 10],
        [111, 9, 115, 10],
        [59, 9, 64, 10],
        [18, 7, 22, 10],
        [109, 10, 118, 11],
        [42, 10, 52, 11],
        [158, 10, 173, 11],
        [56, 10, 67, 11],
        [189, 10, 200, 11],
        [80, 10, 93, 11],
        [135, 10, 148, 11],
        [41, 11, 53, 12],
        [188, 11, 202, 12],
        [182, 10, 187, 12],
        [35, 10, 40, 12],
        [133, 11, 148, 12],
        [103, 10, 107, 12],
        [157, 11, 174, 12],
        [108, 11, 117, 12],
        [55, 11, 68, 12],
        [79, 11, 94, 12],
        [35, 12, 53, 13],
        [133, 12, 149, 13],
        [19, 10, 23, 13],
        [9, 10, 13, 13],
        [182, 12, 202, 13],
        [55, 12, 69, 13],
        [157, 12, 175, 13],
        [79, 12, 95, 13],
        [103, 12, 117, 13],
        [77, 13, 82, 14],
        [91, 13, 96, 14],
        [132, 13, 137, 14],
        [182, 13, 190, 14],
        [197, 13, 202, 14],
        [115, 13, 116, 14],
        [103, 13, 110, 14],
        [35, 13, 42, 14],
        [156, 13, 161, 14],
        [169, 13, 175, 14],
        [49, 13, 57, 14],
        [64, 13, 69, 14],
        [8, 13, 13, 14],
        [145, 13, 150, 14],
        [19, 13, 24, 14],
        [49, 14, 56, 15],
        [198, 14, 202, 15],
        [91, 14, 97, 15],
        [145, 14, 151, 15],
        [76, 14, 82, 15],
        [170, 14, 175, 15],
        [156, 14, 160, 15],
        [198, 15, 203, 16],
        [92, 15, 97, 16],
        [146, 15, 151, 16],
        [76, 15, 81, 16],
        [182, 14, 188, 16],
        [131, 14, 136, 16],
        [35, 14, 41, 16],
        [49, 15, 55, 16],
        [20, 14, 25, 16],
        [64, 14, 70, 16],
        [7, 14, 12, 16],
        [155, 15, 160, 16],
        [93, 16, 97, 17],
        [147, 16, 151, 17],
        [103, 14, 109, 17],
        [76, 16, 80, 17],
        [157, 16, 160, 17],
        [147, 17, 149, 18],
        [7, 16, 11, 18],
        [94, 17, 97, 18],
        [21, 16, 25, 18],
        [171, 15, 175, 19],
        [76, 17, 79, 19],
        [130, 16, 135, 19],
        [94, 18, 98, 19],
        [166, 19, 175, 20],
        [6, 18, 10, 20],
        [22, 18, 26, 20],
        [162, 20, 175, 21],
        [5, 20, 27, 22],
        [159, 21, 175, 22],
        [75, 19, 98, 23],
        [157, 22, 170, 23],
        [4, 22, 28, 24],
        [156, 23, 167, 24],
        [155, 24, 163, 25],
        [130, 19, 134, 26],
        [75, 23, 79, 26],
        [4, 24, 8, 26],
        [24, 24, 28, 26],
        [155, 25, 160, 26],
        [154, 26, 160, 27],
        [148, 26, 150, 27],
        [75, 26, 80, 27],
        [3, 26, 7, 28],
        [171, 22, 175, 28],
        [25, 26, 29, 28],
        [130, 26, 135, 28],
        [76, 27, 80, 28],
        [148, 27, 152, 28],
        [130, 28, 136, 29],
        [170, 28, 175, 29],
        [147, 28, 151, 29],
        [76, 28, 81, 29],
        [93, 28, 98, 29],
        [93, 29, 97, 30],
        [25, 28, 30, 30],
        [154, 27, 159, 30],
        [2, 28, 7, 30],
        [92, 30, 97, 31],
        [146, 29, 151, 31],
        [76, 29, 82, 31],
        [154, 30, 160, 31],
        [169, 29, 175, 31],
        [131, 29, 136, 31],
        [26, 30, 31, 32],
        [133, 31, 139, 32],
        [155, 31, 161, 32],
        [89, 31, 97, 32],
        [78, 31, 85, 32],
        [144, 31, 150, 32],
        [166, 31, 175, 32],
        [1, 30, 6, 32],
        [155, 32, 176, 33],
        [133, 32, 150, 33],
        [78, 32, 96, 33],
        [27, 32, 31, 34],
        [1, 32, 5, 34],
        [156, 33, 169, 34],
        [79, 33, 95, 34],
        [171, 33, 176, 34],
        [133, 33, 149, 34],
        [172, 34, 177, 35],
        [157, 34, 168, 35],
        [103, 17, 108, 35],
        [136, 34, 147, 35],
        [182, 16, 187, 35],
        [35, 16, 40, 35],
        [65, 16, 70, 35],
        [82, 34, 93, 35],
        [199, 16, 203, 35],
        [0, 34, 4, 35],
        [120, 10, 124, 35],
        [28, 34, 32, 35],
        [50, 16, 55, 35],
        [160, 35, 166, 36],
        [138, 35, 145, 36],
        [84, 35, 91, 36],
      ],
    },
    S7: {
      width: 54,
      height: 36,
      rects: [
        [9, 0, 17, 1],
        [6, 1, 21, 2],
        [4, 2, 22, 3],
        [4, 3, 23, 4],
        [3, 4, 24, 5],
        [2, 5, 24, 6],
        [2, 6, 11, 7],
        [16, 6, 25, 7],
        [32, 1, 54, 7],
        [1, 7, 9, 8],
        [18, 7, 25, 8],
        [32, 7, 53, 8],
        [46, 8, 53, 9],
        [18, 8, 26, 10],
        [45, 9, 52, 10],
        [19, 10, 26, 11],
        [45, 10, 50, 11],
        [1, 8, 8, 11],
        [44, 11, 50, 12],
        [1, 11, 9, 12],
        [43, 12, 49, 13],
        [2, 12, 12, 13],
        [2, 13, 14, 14],
        [42, 13, 49, 14],
        [42, 14, 48, 15],
        [3, 14, 17, 15],
        [4, 15, 21, 16],
        [41, 15, 47, 17],
        [4, 16, 23, 17],
        [5, 17, 23, 18],
        [40, 17, 47, 18],
        [7, 18, 25, 19],
        [39, 18, 46, 20],
        [9, 19, 26, 20],
        [12, 20, 26, 21],
        [17, 21, 26, 22],
        [39, 20, 45, 22],
        [19, 22, 27, 23],
        [38, 22, 45, 24],
        [0, 24, 7, 26],
        [37, 24, 44, 26],
        [1, 26, 7, 27],
        [37, 26, 43, 27],
        [20, 23, 27, 28],
        [1, 27, 8, 28],
        [1, 28, 9, 29],
        [19, 28, 26, 29],
        [36, 27, 43, 30],
        [17, 29, 26, 30],
        [1, 29, 11, 30],
        [2, 30, 26, 32],
        [4, 32, 24, 33],
        [4, 33, 23, 34],
        [6, 34, 22, 35],
        [36, 30, 42, 35],
        [9, 35, 18, 36],
      ],
    },
    spirit: {
      width: 95,
      height: 36,
      rects: [
        [88, 1, 90, 2],
        [87, 2, 90, 3],
        [48, 0, 54, 5],
        [74, 0, 79, 5],
        [6, 7, 13, 8],
        [67, 7, 70, 8],
        [34, 7, 38, 8],
        [85, 3, 90, 8],
        [31, 8, 40, 9],
        [3, 8, 16, 9],
        [66, 8, 72, 9],
        [65, 9, 72, 10],
        [2, 9, 16, 10],
        [31, 9, 41, 10],
        [24, 8, 29, 10],
        [59, 8, 64, 10],
        [24, 10, 42, 11],
        [59, 10, 71, 11],
        [1, 10, 17, 11],
        [82, 8, 94, 12],
        [1, 11, 7, 12],
        [11, 11, 18, 12],
        [35, 11, 43, 12],
        [24, 11, 32, 12],
        [59, 11, 70, 13],
        [13, 12, 19, 13],
        [1, 12, 6, 14],
        [59, 13, 66, 14],
        [24, 12, 31, 14],
        [37, 12, 43, 14],
        [13, 13, 16, 14],
        [1, 14, 8, 15],
        [24, 14, 30, 15],
        [59, 14, 65, 16],
        [1, 15, 11, 16],
        [1, 16, 15, 17],
        [2, 17, 17, 18],
        [4, 18, 18, 19],
        [7, 19, 19, 20],
        [24, 15, 29, 20],
        [38, 14, 44, 21],
        [11, 20, 19, 21],
        [13, 21, 19, 22],
        [24, 20, 30, 22],
        [14, 22, 19, 23],
        [24, 22, 31, 23],
        [38, 21, 43, 23],
        [0, 22, 6, 23],
        [13, 23, 19, 24],
        [85, 12, 90, 24],
        [37, 23, 43, 24],
        [1, 23, 7, 24],
        [85, 24, 91, 25],
        [1, 24, 8, 25],
        [94, 24, 95, 25],
        [12, 24, 19, 25],
        [35, 24, 43, 25],
        [24, 23, 32, 25],
        [2, 25, 18, 26],
        [24, 25, 41, 26],
        [30, 26, 41, 27],
        [85, 25, 95, 27],
        [3, 26, 17, 27],
        [31, 27, 40, 28],
        [4, 27, 16, 28],
        [74, 8, 79, 28],
        [48, 8, 54, 28],
        [59, 16, 64, 28],
        [86, 27, 95, 28],
        [33, 28, 37, 29],
        [88, 28, 93, 29],
        [7, 28, 13, 29],
        [24, 26, 29, 36],
      ],
    },
  };
  const aeroflotMarks = {
    AEROFLOT: {
      width: 269,
      height: 36,
      rects: [
        [121, 0, 128, 1],
        [217, 0, 224, 1],
        [116, 1, 132, 2],
        [44, 1, 69, 2],
        [18, 1, 27, 2],
        [148, 1, 171, 2],
        [242, 1, 269, 2],
        [177, 1, 184, 2],
        [76, 1, 97, 2],
        [212, 1, 228, 2],
        [176, 2, 184, 3],
        [75, 2, 98, 3],
        [115, 2, 132, 3],
        [211, 2, 229, 3],
        [17, 2, 27, 3],
        [75, 3, 99, 4],
        [17, 3, 28, 4],
        [113, 3, 134, 4],
        [209, 3, 230, 4],
        [16, 4, 28, 5],
        [112, 4, 135, 5],
        [75, 4, 100, 5],
        [241, 2, 268, 5],
        [147, 2, 171, 5],
        [208, 4, 232, 5],
        [75, 5, 101, 6],
        [147, 5, 170, 6],
        [176, 3, 183, 6],
        [207, 5, 232, 6],
        [111, 5, 135, 6],
        [240, 5, 268, 7],
        [15, 5, 28, 7],
        [110, 6, 121, 7],
        [74, 6, 101, 7],
        [146, 6, 170, 7],
        [126, 6, 136, 7],
        [207, 6, 218, 7],
        [43, 2, 68, 7],
        [223, 6, 232, 7],
        [15, 7, 29, 8],
        [206, 7, 214, 8],
        [225, 7, 233, 8],
        [110, 7, 118, 8],
        [94, 7, 101, 9],
        [74, 7, 81, 9],
        [176, 6, 182, 9],
        [43, 7, 49, 9],
        [109, 8, 117, 9],
        [129, 7, 137, 9],
        [205, 8, 213, 9],
        [146, 7, 153, 10],
        [250, 7, 257, 10],
        [226, 8, 234, 10],
        [73, 9, 81, 10],
        [108, 9, 116, 10],
        [130, 9, 137, 10],
        [14, 8, 21, 10],
        [249, 10, 257, 11],
        [131, 10, 137, 11],
        [13, 10, 21, 11],
        [204, 9, 212, 11],
        [175, 9, 182, 12],
        [95, 9, 101, 12],
        [107, 10, 115, 12],
        [227, 10, 234, 12],
        [146, 10, 152, 12],
        [42, 9, 49, 12],
        [131, 11, 138, 12],
        [204, 11, 211, 12],
        [12, 11, 20, 12],
        [94, 12, 101, 13],
        [41, 12, 49, 13],
        [203, 12, 210, 13],
        [22, 8, 29, 13],
        [73, 10, 80, 13],
        [145, 12, 152, 13],
        [107, 12, 114, 13],
        [174, 12, 182, 13],
        [249, 11, 256, 14],
        [41, 13, 48, 14],
        [12, 12, 19, 14],
        [203, 13, 209, 15],
        [145, 13, 151, 15],
        [41, 14, 66, 15],
        [93, 13, 101, 15],
        [11, 14, 18, 15],
        [107, 13, 113, 15],
        [145, 15, 168, 16],
        [10, 15, 18, 16],
        [174, 13, 181, 16],
        [41, 15, 65, 16],
        [90, 15, 100, 16],
        [73, 13, 79, 16],
        [173, 16, 181, 17],
        [72, 16, 99, 18],
        [10, 16, 17, 18],
        [23, 13, 29, 18],
        [202, 15, 209, 18],
        [248, 14, 255, 18],
        [228, 12, 234, 18],
        [106, 15, 112, 18],
        [132, 12, 138, 18],
        [72, 18, 97, 19],
        [9, 18, 16, 19],
        [144, 16, 168, 19],
        [131, 18, 138, 19],
        [40, 16, 65, 20],
        [72, 19, 96, 20],
        [144, 19, 167, 20],
        [173, 17, 180, 20],
        [131, 19, 137, 21],
        [248, 18, 254, 21],
        [71, 20, 93, 21],
        [40, 20, 47, 21],
        [8, 19, 15, 21],
        [143, 20, 167, 21],
        [227, 18, 234, 21],
        [226, 21, 234, 22],
        [7, 21, 15, 22],
        [24, 18, 30, 22],
        [173, 20, 179, 23],
        [85, 21, 93, 23],
        [40, 21, 46, 23],
        [130, 21, 137, 23],
        [7, 22, 30, 23],
        [201, 18, 208, 24],
        [247, 21, 254, 24],
        [226, 22, 233, 24],
        [7, 23, 31, 24],
        [143, 21, 150, 24],
        [86, 23, 93, 24],
        [71, 21, 78, 24],
        [129, 23, 137, 24],
        [246, 24, 254, 25],
        [6, 24, 31, 25],
        [225, 24, 232, 25],
        [87, 24, 94, 25],
        [105, 18, 112, 25],
        [129, 24, 136, 25],
        [201, 24, 209, 25],
        [128, 25, 136, 26],
        [5, 25, 31, 26],
        [172, 23, 179, 26],
        [224, 25, 232, 26],
        [39, 23, 46, 26],
        [106, 25, 112, 26],
        [71, 24, 77, 26],
        [143, 24, 149, 26],
        [87, 25, 95, 26],
        [246, 25, 253, 27],
        [70, 26, 77, 27],
        [142, 26, 149, 27],
        [202, 25, 209, 27],
        [88, 26, 96, 27],
        [106, 26, 113, 27],
        [127, 26, 134, 27],
        [38, 26, 46, 27],
        [4, 26, 31, 27],
        [171, 26, 179, 27],
        [126, 27, 134, 28],
        [106, 27, 114, 28],
        [245, 27, 253, 28],
        [223, 26, 231, 28],
        [4, 27, 32, 28],
        [202, 27, 210, 28],
        [203, 28, 211, 29],
        [89, 27, 96, 29],
        [38, 27, 45, 29],
        [107, 28, 115, 29],
        [125, 28, 134, 29],
        [171, 27, 178, 29],
        [4, 28, 11, 29],
        [221, 28, 230, 29],
        [218, 29, 229, 30],
        [70, 27, 76, 30],
        [204, 29, 213, 30],
        [38, 29, 65, 30],
        [107, 29, 117, 30],
        [142, 27, 148, 30],
        [122, 29, 133, 30],
        [3, 29, 10, 30],
        [204, 30, 229, 31],
        [90, 29, 97, 31],
        [107, 30, 132, 31],
        [37, 30, 65, 31],
        [90, 31, 98, 32],
        [204, 31, 228, 32],
        [108, 31, 132, 32],
        [2, 30, 10, 32],
        [245, 28, 252, 32],
        [25, 28, 32, 33],
        [206, 32, 226, 33],
        [1, 32, 9, 33],
        [110, 32, 129, 34],
        [171, 29, 196, 34],
        [37, 31, 64, 34],
        [207, 33, 225, 34],
        [141, 30, 148, 34],
        [69, 30, 76, 34],
        [245, 32, 251, 35],
        [140, 34, 147, 35],
        [112, 34, 127, 35],
        [26, 33, 32, 35],
        [170, 34, 195, 35],
        [1, 33, 8, 35],
        [37, 34, 63, 35],
        [91, 32, 98, 35],
        [68, 34, 75, 35],
        [208, 34, 223, 35],
        [212, 35, 219, 36],
        [115, 35, 123, 36],
      ],
    },
    АЭРОФЛОТ: {
      width: 281,
      height: 36,
      rects: [
        [121, 0, 128, 1],
        [229, 0, 236, 1],
        [51, 0, 59, 1],
        [224, 1, 240, 2],
        [116, 1, 132, 2],
        [18, 1, 27, 2],
        [254, 1, 281, 2],
        [188, 1, 210, 2],
        [159, 1, 166, 2],
        [79, 1, 99, 2],
        [47, 1, 63, 2],
        [78, 2, 100, 3],
        [115, 2, 132, 3],
        [46, 2, 64, 3],
        [223, 2, 241, 3],
        [17, 2, 27, 3],
        [158, 2, 166, 3],
        [78, 3, 101, 4],
        [17, 3, 28, 4],
        [113, 3, 134, 4],
        [221, 3, 242, 4],
        [45, 3, 65, 4],
        [158, 3, 165, 5],
        [16, 4, 28, 5],
        [112, 4, 135, 5],
        [220, 4, 243, 5],
        [43, 4, 66, 5],
        [253, 2, 280, 5],
        [155, 5, 168, 6],
        [219, 5, 243, 6],
        [43, 5, 67, 6],
        [111, 5, 135, 6],
        [78, 4, 102, 6],
        [187, 2, 210, 6],
        [153, 6, 170, 7],
        [15, 5, 28, 7],
        [127, 6, 136, 7],
        [186, 6, 210, 7],
        [110, 6, 121, 7],
        [77, 6, 102, 7],
        [235, 6, 244, 7],
        [218, 6, 230, 7],
        [57, 6, 67, 7],
        [252, 5, 280, 7],
        [42, 6, 52, 7],
        [15, 7, 29, 8],
        [129, 7, 137, 8],
        [218, 7, 226, 8],
        [110, 7, 118, 8],
        [237, 7, 245, 8],
        [149, 7, 173, 8],
        [217, 8, 225, 9],
        [149, 8, 174, 9],
        [129, 8, 138, 9],
        [60, 7, 68, 9],
        [109, 8, 117, 9],
        [41, 7, 49, 9],
        [14, 8, 21, 10],
        [262, 7, 268, 10],
        [61, 9, 68, 10],
        [40, 9, 49, 10],
        [238, 8, 246, 10],
        [147, 9, 174, 10],
        [202, 7, 209, 10],
        [186, 7, 193, 10],
        [77, 7, 84, 10],
        [108, 9, 116, 10],
        [130, 9, 138, 10],
        [216, 9, 224, 11],
        [13, 10, 21, 11],
        [42, 10, 48, 11],
        [62, 10, 68, 11],
        [146, 10, 175, 11],
        [216, 11, 223, 12],
        [157, 11, 163, 12],
        [107, 10, 115, 12],
        [62, 11, 69, 12],
        [146, 11, 155, 12],
        [239, 10, 246, 12],
        [96, 7, 103, 12],
        [131, 10, 138, 12],
        [202, 10, 208, 12],
        [46, 11, 47, 12],
        [166, 11, 175, 12],
        [77, 10, 83, 12],
        [13, 11, 20, 12],
        [215, 12, 222, 13],
        [96, 12, 102, 13],
        [76, 12, 83, 13],
        [22, 8, 29, 13],
        [185, 10, 192, 13],
        [201, 12, 208, 13],
        [144, 12, 152, 13],
        [107, 12, 114, 13],
        [168, 12, 176, 14],
        [261, 10, 268, 14],
        [95, 13, 102, 14],
        [12, 12, 19, 14],
        [143, 13, 152, 14],
        [94, 14, 102, 15],
        [215, 13, 221, 15],
        [107, 13, 113, 15],
        [143, 14, 151, 15],
        [11, 14, 18, 15],
        [63, 12, 69, 15],
        [201, 13, 207, 16],
        [156, 12, 163, 16],
        [76, 13, 82, 16],
        [185, 13, 191, 16],
        [91, 15, 102, 16],
        [10, 15, 18, 16],
        [143, 15, 149, 17],
        [155, 16, 163, 17],
        [51, 15, 69, 18],
        [75, 16, 101, 18],
        [214, 15, 221, 18],
        [23, 13, 29, 18],
        [132, 12, 138, 18],
        [240, 12, 246, 18],
        [260, 14, 267, 18],
        [169, 14, 176, 18],
        [10, 16, 17, 18],
        [106, 15, 113, 18],
        [9, 18, 16, 19],
        [155, 17, 162, 20],
        [50, 18, 69, 20],
        [200, 16, 207, 20],
        [184, 16, 191, 20],
        [75, 18, 99, 20],
        [239, 18, 246, 21],
        [260, 18, 266, 21],
        [154, 20, 162, 21],
        [199, 20, 207, 21],
        [183, 20, 191, 21],
        [8, 19, 15, 21],
        [131, 18, 138, 21],
        [168, 18, 175, 21],
        [74, 20, 97, 21],
        [50, 20, 68, 21],
        [62, 21, 68, 22],
        [7, 21, 15, 22],
        [130, 21, 138, 22],
        [238, 21, 246, 22],
        [74, 21, 93, 22],
        [24, 18, 30, 22],
        [167, 21, 174, 22],
        [130, 22, 137, 23],
        [7, 22, 30, 23],
        [142, 17, 149, 23],
        [183, 21, 190, 23],
        [7, 23, 31, 24],
        [105, 18, 112, 24],
        [182, 23, 190, 24],
        [74, 22, 81, 24],
        [129, 23, 137, 24],
        [213, 18, 220, 24],
        [238, 22, 245, 24],
        [61, 22, 68, 24],
        [259, 21, 266, 24],
        [143, 23, 149, 24],
        [166, 22, 174, 24],
        [199, 21, 206, 24],
        [154, 21, 161, 24],
        [258, 24, 266, 25],
        [213, 24, 221, 25],
        [163, 24, 173, 25],
        [154, 24, 160, 25],
        [6, 24, 31, 25],
        [60, 24, 68, 25],
        [42, 24, 45, 25],
        [105, 24, 113, 25],
        [143, 24, 152, 25],
        [237, 24, 244, 25],
        [129, 24, 136, 25],
        [40, 25, 45, 26],
        [199, 24, 205, 26],
        [74, 24, 80, 26],
        [128, 25, 136, 26],
        [5, 25, 31, 26],
        [60, 25, 67, 26],
        [236, 25, 244, 26],
        [143, 25, 172, 26],
        [59, 26, 66, 27],
        [144, 26, 171, 27],
        [182, 24, 189, 27],
        [73, 26, 80, 27],
        [106, 25, 113, 27],
        [198, 26, 205, 27],
        [258, 25, 265, 27],
        [38, 26, 46, 27],
        [4, 26, 31, 27],
        [214, 25, 221, 27],
        [58, 27, 65, 28],
        [235, 26, 243, 28],
        [106, 27, 114, 28],
        [39, 27, 46, 28],
        [127, 26, 135, 28],
        [214, 27, 222, 28],
        [145, 27, 169, 28],
        [4, 27, 32, 28],
        [257, 27, 265, 28],
        [107, 28, 115, 29],
        [4, 28, 11, 29],
        [182, 27, 188, 29],
        [233, 28, 242, 29],
        [57, 28, 65, 29],
        [146, 28, 168, 29],
        [215, 28, 223, 29],
        [39, 28, 47, 29],
        [125, 28, 134, 29],
        [73, 27, 79, 30],
        [216, 29, 225, 30],
        [3, 29, 10, 30],
        [107, 29, 117, 30],
        [148, 29, 165, 30],
        [54, 29, 64, 30],
        [40, 29, 49, 30],
        [122, 29, 133, 30],
        [180, 29, 188, 30],
        [198, 27, 204, 30],
        [230, 29, 241, 30],
        [40, 30, 64, 31],
        [177, 30, 188, 31],
        [216, 30, 241, 31],
        [107, 30, 132, 31],
        [150, 30, 163, 31],
        [257, 28, 264, 32],
        [108, 31, 132, 32],
        [177, 31, 187, 32],
        [2, 30, 10, 32],
        [216, 31, 240, 32],
        [40, 31, 63, 32],
        [42, 32, 61, 33],
        [25, 28, 32, 33],
        [218, 32, 238, 33],
        [1, 32, 9, 33],
        [110, 32, 129, 34],
        [197, 30, 204, 34],
        [43, 33, 60, 34],
        [72, 30, 79, 34],
        [152, 31, 159, 34],
        [218, 33, 237, 34],
        [176, 32, 186, 34],
        [152, 34, 158, 35],
        [220, 34, 235, 35],
        [196, 34, 203, 35],
        [26, 33, 32, 35],
        [43, 34, 59, 35],
        [71, 34, 78, 35],
        [1, 33, 8, 35],
        [257, 32, 263, 35],
        [112, 34, 127, 35],
        [175, 34, 185, 35],
        [177, 35, 182, 36],
        [224, 35, 231, 36],
        [115, 35, 123, 36],
        [47, 35, 54, 36],
      ],
    },
    'Russian Airlines': {
      width: 343,
      height: 36,
      rects: [
        [0, 0, 20, 1],
        [200, 0, 205, 1],
        [0, 1, 24, 2],
        [199, 1, 206, 3],
        [0, 2, 25, 3],
        [259, 0, 263, 4],
        [198, 3, 206, 4],
        [221, 0, 226, 4],
        [0, 3, 26, 4],
        [111, 0, 116, 4],
        [203, 4, 206, 5],
        [21, 4, 26, 5],
        [198, 4, 202, 5],
        [197, 5, 202, 6],
        [22, 5, 27, 6],
        [197, 6, 201, 7],
        [23, 6, 27, 7],
        [203, 5, 207, 7],
        [204, 7, 208, 9],
        [197, 7, 200, 9],
        [67, 9, 74, 10],
        [204, 9, 209, 10],
        [279, 9, 284, 10],
        [92, 9, 98, 10],
        [329, 9, 335, 10],
        [128, 9, 137, 10],
        [303, 9, 310, 10],
        [239, 9, 244, 10],
        [158, 9, 164, 10],
        [196, 9, 200, 10],
        [276, 10, 287, 11],
        [326, 10, 338, 11],
        [89, 10, 101, 11],
        [237, 10, 246, 11],
        [125, 10, 140, 11],
        [300, 10, 313, 11],
        [155, 10, 167, 11],
        [232, 10, 236, 11],
        [64, 10, 77, 11],
        [299, 11, 314, 12],
        [325, 11, 339, 12],
        [155, 11, 168, 12],
        [88, 11, 102, 12],
        [63, 11, 77, 12],
        [124, 11, 140, 12],
        [205, 10, 209, 12],
        [195, 10, 200, 12],
        [23, 7, 28, 13],
        [299, 12, 315, 13],
        [87, 12, 103, 13],
        [62, 12, 78, 13],
        [275, 11, 289, 13],
        [324, 12, 340, 13],
        [232, 11, 245, 13],
        [154, 12, 168, 13],
        [206, 12, 209, 13],
        [149, 10, 153, 13],
        [269, 10, 274, 13],
        [123, 12, 141, 13],
        [195, 12, 199, 13],
        [206, 13, 210, 14],
        [232, 13, 239, 14],
        [297, 13, 302, 14],
        [323, 13, 328, 14],
        [136, 13, 142, 14],
        [86, 13, 91, 14],
        [335, 13, 341, 14],
        [98, 13, 104, 14],
        [269, 13, 277, 14],
        [194, 13, 199, 14],
        [149, 13, 156, 14],
        [22, 13, 27, 14],
        [244, 13, 245, 14],
        [122, 13, 128, 14],
        [311, 13, 316, 14],
        [62, 13, 66, 14],
        [284, 13, 290, 14],
        [296, 14, 302, 15],
        [311, 14, 317, 15],
        [20, 14, 26, 15],
        [74, 13, 79, 15],
        [232, 14, 238, 15],
        [164, 13, 169, 15],
        [296, 15, 301, 16],
        [19, 15, 26, 16],
        [74, 15, 80, 16],
        [312, 15, 317, 16],
        [164, 15, 170, 16],
        [149, 14, 155, 16],
        [285, 14, 290, 16],
        [206, 14, 211, 16],
        [336, 14, 341, 16],
        [122, 14, 127, 16],
        [99, 14, 104, 16],
        [0, 4, 5, 16],
        [194, 14, 198, 16],
        [86, 14, 90, 17],
        [323, 14, 327, 17],
        [232, 15, 237, 17],
        [0, 16, 25, 17],
        [124, 16, 126, 17],
        [313, 16, 317, 17],
        [296, 16, 300, 17],
        [75, 16, 77, 17],
        [61, 14, 65, 17],
        [100, 16, 102, 17],
        [337, 16, 339, 17],
        [269, 14, 275, 17],
        [149, 16, 154, 17],
        [61, 17, 66, 18],
        [323, 17, 328, 18],
        [193, 16, 197, 18],
        [314, 17, 317, 18],
        [207, 16, 212, 18],
        [86, 17, 91, 18],
        [86, 18, 92, 19],
        [0, 17, 23, 19],
        [296, 17, 299, 19],
        [314, 18, 318, 19],
        [137, 14, 142, 19],
        [61, 18, 67, 19],
        [323, 18, 329, 19],
        [86, 19, 96, 20],
        [62, 19, 71, 20],
        [133, 19, 142, 20],
        [192, 18, 197, 20],
        [323, 19, 333, 20],
        [13, 19, 19, 20],
        [208, 18, 212, 20],
        [324, 20, 335, 21],
        [14, 20, 20, 21],
        [128, 20, 142, 21],
        [62, 20, 74, 21],
        [87, 20, 98, 21],
        [325, 21, 338, 22],
        [63, 21, 76, 22],
        [191, 20, 213, 22],
        [15, 21, 20, 22],
        [88, 21, 101, 22],
        [125, 21, 142, 22],
        [327, 22, 341, 23],
        [90, 22, 104, 23],
        [17, 22, 22, 23],
        [65, 22, 79, 23],
        [295, 19, 318, 23],
        [123, 22, 142, 23],
        [191, 22, 214, 24],
        [122, 23, 134, 24],
        [329, 23, 341, 24],
        [92, 23, 104, 24],
        [68, 23, 80, 24],
        [17, 23, 23, 24],
        [70, 24, 80, 25],
        [332, 24, 342, 25],
        [95, 24, 105, 25],
        [18, 24, 23, 25],
        [122, 24, 129, 25],
        [75, 25, 81, 26],
        [190, 24, 194, 26],
        [122, 25, 126, 26],
        [337, 25, 343, 26],
        [100, 25, 106, 26],
        [210, 24, 215, 26],
        [295, 23, 299, 26],
        [19, 25, 24, 26],
        [76, 26, 81, 27],
        [295, 26, 300, 27],
        [121, 26, 126, 27],
        [324, 27, 326, 28],
        [296, 27, 300, 28],
        [211, 26, 215, 28],
        [62, 27, 65, 28],
        [20, 26, 25, 28],
        [189, 26, 194, 28],
        [87, 27, 89, 28],
        [51, 10, 56, 28],
        [313, 28, 318, 29],
        [35, 10, 39, 29],
        [137, 23, 142, 29],
        [85, 28, 90, 29],
        [296, 28, 301, 29],
        [322, 28, 327, 29],
        [60, 28, 65, 29],
        [86, 29, 90, 30],
        [50, 28, 56, 30],
        [338, 26, 343, 30],
        [212, 28, 216, 30],
        [121, 27, 125, 30],
        [136, 29, 142, 30],
        [77, 27, 81, 30],
        [313, 29, 317, 30],
        [188, 28, 193, 30],
        [61, 29, 65, 30],
        [21, 28, 26, 30],
        [323, 29, 327, 30],
        [101, 26, 106, 30],
        [296, 29, 302, 31],
        [312, 30, 317, 31],
        [61, 30, 66, 31],
        [49, 30, 56, 31],
        [323, 30, 328, 31],
        [101, 30, 105, 31],
        [35, 29, 40, 31],
        [212, 30, 217, 31],
        [22, 30, 27, 31],
        [76, 30, 80, 31],
        [188, 30, 192, 31],
        [86, 30, 91, 31],
        [338, 30, 342, 31],
        [121, 30, 126, 31],
        [135, 30, 142, 31],
        [23, 31, 28, 32],
        [212, 31, 218, 32],
        [133, 31, 142, 32],
        [187, 31, 192, 32],
        [74, 31, 80, 32],
        [323, 31, 330, 32],
        [298, 31, 305, 32],
        [86, 31, 93, 32],
        [335, 31, 341, 32],
        [98, 31, 104, 32],
        [35, 31, 42, 32],
        [122, 31, 128, 32],
        [47, 31, 56, 32],
        [309, 31, 317, 32],
        [62, 31, 68, 32],
        [36, 32, 50, 33],
        [87, 32, 104, 33],
        [122, 32, 143, 33],
        [62, 32, 80, 33],
        [298, 32, 316, 33],
        [324, 32, 341, 33],
        [37, 33, 50, 34],
        [122, 33, 136, 34],
        [23, 32, 29, 34],
        [325, 33, 341, 34],
        [299, 33, 315, 34],
        [88, 33, 104, 34],
        [63, 33, 79, 34],
        [137, 33, 143, 34],
        [213, 32, 218, 34],
        [187, 32, 191, 34],
        [232, 17, 236, 35],
        [286, 16, 290, 35],
        [186, 34, 191, 35],
        [269, 17, 274, 35],
        [124, 34, 134, 35],
        [51, 32, 56, 35],
        [326, 34, 338, 35],
        [25, 34, 30, 35],
        [139, 34, 143, 35],
        [38, 34, 47, 35],
        [302, 34, 313, 35],
        [248, 0, 253, 35],
        [214, 34, 218, 35],
        [221, 10, 226, 35],
        [0, 19, 5, 35],
        [149, 17, 153, 35],
        [111, 10, 116, 35],
        [165, 16, 170, 35],
        [89, 34, 101, 35],
        [259, 10, 263, 35],
        [65, 34, 77, 35],
        [41, 35, 46, 36],
        [126, 35, 132, 36],
        [329, 35, 336, 36],
        [304, 35, 311, 36],
        [67, 35, 74, 36],
        [92, 35, 99, 36],
      ],
    },
    'Российские авиалинии': {
      width: 513,
      height: 36,
      rects: [
        [150, 0, 153, 1],
        [0, 0, 19, 1],
        [139, 0, 142, 2],
        [0, 1, 22, 2],
        [149, 1, 153, 2],
        [149, 2, 152, 3],
        [0, 2, 23, 3],
        [139, 2, 143, 3],
        [148, 3, 152, 4],
        [139, 3, 144, 4],
        [0, 3, 24, 4],
        [141, 4, 151, 5],
        [19, 4, 25, 5],
        [20, 5, 25, 6],
        [142, 5, 150, 6],
        [21, 6, 25, 7],
        [143, 6, 148, 7],
        [282, 9, 290, 10],
        [362, 9, 370, 10],
        [241, 9, 248, 10],
        [66, 9, 73, 10],
        [39, 9, 45, 10],
        [91, 9, 97, 10],
        [169, 9, 176, 10],
        [302, 10, 319, 11],
        [358, 10, 373, 11],
        [166, 10, 179, 11],
        [199, 10, 204, 11],
        [88, 10, 100, 11],
        [238, 10, 251, 11],
        [63, 10, 76, 11],
        [278, 10, 293, 11],
        [36, 10, 48, 11],
        [123, 10, 129, 12],
        [165, 11, 180, 12],
        [358, 11, 374, 12],
        [302, 11, 320, 12],
        [150, 10, 156, 12],
        [61, 11, 76, 12],
        [480, 10, 486, 12],
        [223, 10, 229, 12],
        [198, 11, 204, 12],
        [507, 10, 513, 12],
        [426, 10, 432, 12],
        [86, 11, 101, 12],
        [34, 11, 49, 12],
        [277, 11, 294, 12],
        [238, 11, 253, 12],
        [277, 12, 295, 13],
        [385, 10, 405, 13],
        [302, 12, 321, 13],
        [506, 12, 513, 13],
        [197, 12, 204, 13],
        [479, 12, 486, 13],
        [22, 7, 26, 13],
        [85, 12, 102, 13],
        [122, 12, 129, 13],
        [425, 12, 432, 13],
        [237, 12, 253, 13],
        [343, 10, 349, 13],
        [357, 12, 375, 13],
        [61, 12, 77, 13],
        [34, 12, 50, 13],
        [222, 12, 229, 13],
        [149, 12, 156, 13],
        [164, 12, 181, 13],
        [176, 13, 181, 14],
        [249, 13, 254, 14],
        [196, 13, 201, 14],
        [316, 13, 322, 14],
        [33, 13, 38, 14],
        [163, 13, 169, 14],
        [276, 13, 281, 14],
        [289, 13, 295, 14],
        [85, 13, 90, 14],
        [21, 13, 25, 14],
        [235, 13, 241, 14],
        [60, 13, 65, 14],
        [73, 13, 78, 14],
        [46, 13, 51, 14],
        [97, 13, 103, 14],
        [98, 14, 103, 15],
        [163, 14, 168, 15],
        [356, 13, 361, 15],
        [177, 14, 182, 15],
        [317, 14, 322, 15],
        [221, 13, 229, 15],
        [370, 13, 376, 15],
        [290, 14, 295, 15],
        [46, 14, 52, 15],
        [342, 13, 349, 15],
        [73, 14, 79, 15],
        [20, 14, 25, 15],
        [276, 14, 280, 15],
        [235, 14, 240, 15],
        [84, 14, 89, 15],
        [32, 14, 37, 16],
        [47, 15, 52, 16],
        [220, 15, 229, 16],
        [19, 15, 25, 16],
        [478, 13, 486, 16],
        [99, 15, 103, 16],
        [148, 13, 156, 16],
        [341, 15, 349, 16],
        [84, 15, 88, 16],
        [0, 4, 4, 16],
        [355, 15, 361, 16],
        [59, 14, 64, 16],
        [250, 14, 255, 16],
        [74, 15, 79, 16],
        [424, 13, 432, 16],
        [505, 13, 513, 16],
        [178, 15, 182, 16],
        [196, 14, 200, 16],
        [163, 15, 167, 16],
        [121, 13, 129, 16],
        [235, 15, 239, 16],
        [275, 15, 280, 16],
        [504, 16, 513, 17],
        [251, 16, 256, 17],
        [75, 16, 79, 17],
        [178, 16, 183, 17],
        [220, 16, 223, 17],
        [358, 16, 360, 17],
        [477, 16, 486, 17],
        [423, 16, 432, 17],
        [0, 16, 24, 17],
        [147, 16, 156, 17],
        [277, 16, 280, 17],
        [120, 16, 129, 17],
        [100, 16, 104, 17],
        [196, 16, 199, 17],
        [75, 17, 77, 18],
        [422, 17, 432, 18],
        [476, 17, 486, 18],
        [48, 16, 52, 18],
        [178, 17, 181, 18],
        [119, 17, 129, 18],
        [318, 15, 322, 18],
        [146, 17, 156, 18],
        [503, 17, 513, 18],
        [100, 17, 102, 18],
        [0, 17, 23, 18],
        [340, 16, 344, 18],
        [252, 17, 256, 19],
        [291, 15, 295, 19],
        [31, 16, 36, 19],
        [340, 18, 343, 19],
        [162, 16, 166, 19],
        [317, 18, 322, 19],
        [195, 17, 199, 19],
        [0, 18, 22, 19],
        [371, 15, 376, 19],
        [219, 17, 223, 19],
        [119, 18, 123, 19],
        [48, 18, 53, 19],
        [234, 16, 238, 19],
        [83, 16, 88, 19],
        [503, 18, 507, 19],
        [476, 18, 480, 19],
        [58, 16, 63, 19],
        [146, 18, 150, 19],
        [422, 18, 426, 19],
        [0, 19, 18, 20],
        [118, 19, 122, 20],
        [367, 19, 376, 20],
        [316, 19, 322, 20],
        [217, 19, 222, 20],
        [454, 10, 459, 20],
        [438, 10, 442, 20],
        [421, 19, 425, 20],
        [338, 19, 343, 20],
        [302, 13, 307, 20],
        [502, 19, 506, 20],
        [286, 19, 295, 20],
        [145, 19, 149, 20],
        [194, 19, 198, 20],
        [475, 19, 479, 20],
        [187, 10, 191, 21],
        [338, 20, 342, 21],
        [145, 20, 148, 21],
        [502, 20, 505, 21],
        [118, 20, 121, 21],
        [362, 20, 376, 21],
        [302, 20, 321, 21],
        [193, 20, 197, 21],
        [282, 20, 295, 21],
        [475, 20, 478, 21],
        [421, 20, 424, 21],
        [144, 21, 148, 22],
        [302, 21, 319, 22],
        [359, 21, 376, 22],
        [501, 21, 505, 22],
        [279, 21, 295, 22],
        [117, 21, 121, 22],
        [217, 20, 221, 22],
        [474, 21, 478, 22],
        [420, 21, 424, 22],
        [337, 21, 342, 22],
        [233, 19, 256, 23],
        [277, 22, 290, 23],
        [116, 22, 121, 23],
        [143, 22, 148, 23],
        [357, 22, 370, 23],
        [337, 22, 341, 23],
        [473, 22, 478, 23],
        [302, 22, 321, 23],
        [187, 21, 196, 23],
        [216, 22, 220, 23],
        [419, 22, 424, 23],
        [500, 22, 505, 23],
        [499, 23, 504, 24],
        [115, 23, 120, 24],
        [215, 23, 220, 24],
        [418, 23, 423, 24],
        [472, 23, 477, 24],
        [276, 23, 287, 24],
        [302, 23, 322, 24],
        [142, 23, 147, 24],
        [193, 23, 197, 24],
        [438, 20, 459, 24],
        [356, 23, 367, 24],
        [418, 24, 422, 25],
        [336, 23, 340, 25],
        [355, 24, 363, 25],
        [275, 24, 283, 25],
        [316, 24, 322, 25],
        [472, 24, 476, 25],
        [215, 24, 219, 25],
        [142, 24, 146, 25],
        [499, 24, 503, 25],
        [115, 24, 119, 25],
        [193, 24, 198, 25],
        [318, 25, 323, 26],
        [418, 25, 421, 26],
        [499, 25, 502, 26],
        [49, 19, 53, 26],
        [31, 19, 35, 26],
        [195, 25, 199, 26],
        [142, 25, 145, 26],
        [58, 19, 62, 26],
        [115, 25, 118, 26],
        [335, 25, 339, 26],
        [472, 25, 475, 26],
        [82, 19, 87, 26],
        [275, 25, 280, 26],
        [141, 26, 145, 27],
        [114, 26, 118, 27],
        [498, 26, 502, 27],
        [161, 19, 166, 27],
        [355, 25, 360, 27],
        [179, 26, 181, 27],
        [100, 26, 103, 27],
        [417, 26, 421, 27],
        [274, 26, 280, 27],
        [82, 26, 88, 27],
        [76, 26, 78, 27],
        [48, 26, 53, 27],
        [233, 23, 238, 27],
        [214, 25, 218, 27],
        [195, 26, 200, 27],
        [471, 26, 475, 27],
        [334, 26, 339, 27],
        [100, 27, 105, 28],
        [328, 10, 333, 28],
        [291, 22, 295, 28],
        [31, 26, 36, 28],
        [465, 10, 469, 28],
        [411, 10, 415, 28],
        [470, 27, 475, 28],
        [334, 27, 338, 28],
        [162, 27, 166, 28],
        [497, 27, 502, 28],
        [213, 27, 217, 28],
        [76, 27, 80, 28],
        [135, 10, 139, 28],
        [371, 22, 376, 28],
        [108, 10, 112, 28],
        [416, 27, 421, 28],
        [492, 10, 496, 28],
        [113, 27, 118, 28],
        [140, 27, 145, 28],
        [179, 27, 184, 28],
        [234, 27, 238, 28],
        [196, 27, 200, 28],
        [48, 27, 52, 28],
        [58, 26, 63, 28],
        [208, 10, 212, 28],
        [465, 28, 474, 29],
        [196, 28, 201, 29],
        [290, 28, 295, 29],
        [75, 28, 79, 29],
        [319, 26, 323, 29],
        [108, 28, 117, 29],
        [234, 28, 239, 29],
        [411, 28, 420, 29],
        [58, 28, 64, 29],
        [31, 28, 37, 29],
        [162, 28, 167, 29],
        [135, 28, 144, 29],
        [100, 28, 104, 29],
        [83, 27, 88, 29],
        [492, 28, 501, 29],
        [208, 28, 217, 29],
        [318, 29, 323, 30],
        [355, 27, 359, 30],
        [47, 28, 52, 30],
        [370, 28, 376, 30],
        [274, 27, 279, 30],
        [84, 29, 88, 30],
        [251, 28, 256, 30],
        [196, 29, 202, 30],
        [235, 29, 240, 30],
        [163, 29, 167, 30],
        [99, 29, 104, 31],
        [32, 29, 37, 31],
        [385, 13, 389, 31],
        [328, 28, 337, 31],
        [46, 30, 52, 31],
        [74, 29, 79, 31],
        [178, 28, 183, 31],
        [289, 29, 295, 31],
        [465, 29, 473, 31],
        [355, 30, 360, 31],
        [318, 30, 322, 31],
        [235, 30, 241, 31],
        [135, 29, 143, 31],
        [59, 29, 64, 31],
        [197, 30, 202, 31],
        [492, 29, 500, 31],
        [274, 30, 280, 31],
        [208, 29, 216, 31],
        [302, 24, 307, 31],
        [108, 29, 116, 31],
        [84, 30, 89, 31],
        [411, 29, 419, 31],
        [369, 30, 376, 31],
        [250, 30, 256, 31],
        [163, 30, 168, 31],
        [33, 31, 40, 32],
        [380, 31, 389, 32],
        [367, 31, 376, 32],
        [85, 31, 91, 32],
        [164, 31, 170, 32],
        [275, 31, 281, 32],
        [44, 31, 51, 32],
        [61, 31, 67, 32],
        [247, 31, 255, 32],
        [97, 31, 103, 32],
        [286, 31, 295, 32],
        [175, 31, 181, 32],
        [72, 31, 78, 32],
        [236, 31, 243, 32],
        [355, 31, 361, 32],
        [328, 31, 335, 33],
        [236, 32, 254, 33],
        [411, 31, 418, 33],
        [108, 31, 115, 33],
        [465, 31, 472, 33],
        [135, 31, 142, 33],
        [198, 31, 203, 33],
        [275, 32, 296, 33],
        [85, 32, 103, 33],
        [302, 31, 322, 33],
        [34, 32, 50, 33],
        [492, 31, 499, 33],
        [355, 32, 376, 33],
        [61, 32, 78, 33],
        [164, 32, 181, 33],
        [199, 33, 204, 34],
        [291, 33, 296, 34],
        [380, 32, 388, 34],
        [86, 33, 102, 34],
        [356, 33, 370, 34],
        [61, 33, 77, 34],
        [465, 33, 471, 34],
        [411, 33, 417, 34],
        [135, 33, 141, 34],
        [371, 33, 376, 34],
        [492, 33, 498, 34],
        [302, 33, 321, 34],
        [276, 33, 289, 34],
        [208, 31, 214, 34],
        [165, 33, 181, 34],
        [34, 33, 49, 34],
        [238, 33, 253, 34],
        [108, 33, 114, 34],
        [187, 23, 191, 35],
        [0, 20, 4, 35],
        [400, 13, 405, 35],
        [302, 34, 317, 35],
        [208, 34, 213, 35],
        [508, 18, 513, 35],
        [199, 34, 205, 35],
        [277, 34, 288, 35],
        [240, 34, 251, 35],
        [380, 34, 386, 35],
        [454, 24, 459, 35],
        [373, 34, 377, 35],
        [465, 34, 470, 35],
        [481, 18, 486, 35],
        [89, 34, 100, 35],
        [438, 24, 442, 35],
        [124, 18, 129, 35],
        [37, 34, 47, 35],
        [328, 33, 334, 35],
        [224, 16, 229, 35],
        [151, 18, 156, 35],
        [168, 34, 178, 35],
        [358, 34, 368, 35],
        [64, 34, 75, 35],
        [108, 34, 113, 35],
        [292, 34, 297, 35],
        [345, 16, 349, 35],
        [135, 34, 140, 35],
        [492, 34, 497, 35],
        [427, 18, 432, 35],
        [411, 34, 416, 35],
        [280, 35, 286, 36],
        [242, 35, 249, 36],
        [66, 35, 73, 36],
        [360, 35, 366, 36],
        [39, 35, 45, 36],
        [91, 35, 97, 36],
        [169, 35, 176, 36],
      ],
    },
  };
  const faces = [],
    half = a.len / 2,
    r = a.r,
    spec = airframe(a),
    N = wireframe ? 24 : 48,
    body =
      a.code === 'A321' ? [247, 210, 23] : a.code === 'B737' ? [112, 181, 35] : [205, 214, 222],
    wingColor = [150, 171, 194],
    dark = [12, 27, 44],
    airline = {
      B77W: 'AEROFLOT',
      A339: 'AEROFLOT',
      A333: 'American',
      A35K: 'American',
      B737: 'S7',
      A321: 'spirit',
    }[a.code],
    airlineColor =
      airline === 'AEROFLOT'
        ? [25, 69, 133]
        : airline === 'American'
          ? [74, 84, 95]
          : airline === 'spirit'
            ? [20, 21, 22]
            : [250, 252, 247];
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
  // The painted boundary is part of the hull mesh. It follows the circular
  // cross-section and rises smoothly into the navy tail, as on the reference.
  function aeroflotBoundary(z) {
    const t = Math.max(0, Math.min(1, (z + half) / a.len)),
      u = Math.max(0, Math.min(1, (t - 0.58) / 0.42)),
      smooth = u * u * (3 - 2 * u);
    return -0.42 + 0.76 * smooth;
  }
  if (airline === 'AEROFLOT' && !wireframe) {
    function paintAngle(z, range, fraction) {
      const boundary = aeroflotBoundary(z),
        lower = Math.asin(boundary),
        upper = Math.asin(Math.min(0.95, boundary + 0.12));
      const cuts = [
        upper,
        Math.PI - upper,
        Math.PI - lower,
        Math.PI * 2 + lower,
        Math.PI * 2 + upper,
      ];
      return cuts[range] + (cuts[range + 1] - cuts[range]) * fraction;
    }
    const regions = [
      [24, body],
      [2, [231, 73, 34]],
      [24, [24, 51, 105]],
      [2, [231, 73, 34]],
    ];
    for (let k = 1; k < stations.length; k++)
      for (let region = 0; region < regions.length; region++) {
        const [segments, paint] = regions[region],
          left = stations[k - 1],
          right = stations[k];
        for (let j = 0; j < segments; j++) {
          const f0 = j / segments,
            f1 = (j + 1) / segments,
            p = [
              surface(paintAngle(left, region, f0), left),
              surface(paintAngle(right, region, f0), right),
              surface(paintAngle(right, region, f1), right),
              surface(paintAngle(left, region, f1), left),
            ];
          add(p, paint, true, p.map(surfaceNormal));
        }
      }
  } else {
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
      fractions = wireframe ? [0, 0.075, 0.38, 0.56, 0.7, 0.72, 0.86, 1] : geo.fractions,
      doubleSlotted = a.code === 'B737' || a.code === 'A321',
      leadingLast = spec.narrow || a.code === 'B77W' ? 3 : 4,
      at = (s, f, side = 1) => geo.point(s, f, sign, side),
      interpolate = (s, t, u) => s.map((v, i) => v + (t[i] - v) * u);
    const sectionAt = (x) => {
      let k = 1;
      while (k < stations.length - 1 && x > stations[k][0]) k++;
      const s = stations[k - 1],
        t = stations[k];
      return interpolate(s, t, (x - s[0]) / (t[0] - s[0]));
    };
    const devices = [],
      root = a.r * 1.025,
      engine = spec.ex,
      limit = stations[leadingLast][0] - 0.08,
      addDevices = (start, stop, count, device = 'slat') => {
        for (let i = 0; i < count; i++) {
          const gap = 0.018,
            x0 = start + ((stop - start) * i) / count + gap,
            x1 = start + ((stop - start) * (i + 1)) / count - gap,
            h = sectionAt(x0),
            e = sectionAt(x1),
            chord = (h[3] + e[3]) / 2,
            krueger = device === 'krueger',
            droop = device === 'droop';
          devices.push({
            kind: 'slat',
            device,
            sign,
            segment: devices.length,
            start: x0,
            stop: x1,
            hinge: h,
            end: e,
            chord: krueger ? 0.025 : 0.075,
            deflection: krueger ? 115 : droop ? -18 : -22,
            extension: krueger || droop ? 0 : -Math.min(0.68, chord * 0.105),
            drop: krueger || droop ? 0 : -Math.min(0.1, chord * 0.015),
          });
        }
      };
    if (a.code === 'B737') {
      addDevices(root, engine - 0.4, 2, 'krueger');
      addDevices(engine + 0.45, limit, 4);
    } else {
      addDevices(root, engine - 0.5, 1, a.code === 'A35K' ? 'droop' : 'slat');
      addDevices(engine + 0.5, limit, a.code === 'A321' ? 4 : 6);
    }
    function slatPoint(st, f, side = 1, device = 'slat') {
      const p = at(st, f, 1),
        lower = at(st, f, -1);
      if (device === 'droop') return at(st, f, side);
      // A real slat is a curved shell, with a rounded nose and a thin aft lip,
      // rather than the full thickness of a sliced wing-box segment.
      if (side < 0)
        p[1] -=
          (p[1] - lower[1]) * Math.pow(Math.max(0, 1 - f / 0.075), 0.72) + (0.012 * f) / 0.075;
      return p;
    }
    function leadingSpan(s, t) {
      const boundaries = [
          s[0],
          ...devices.flatMap((d) => [d.start, d.stop]).filter((x) => x > s[0] && x < t[0]),
          t[0],
        ].sort((a, b) => a - b),
        cuts = wireframe ? [0, 0.025, 0.075] : [0, 0.004, 0.012, 0.025, 0.045, 0.06, 0.075];
      for (let i = 1; i < boundaries.length; i++) {
        const x0 = boundaries[i - 1],
          x1 = boundaries[i],
          left = sectionAt(x0),
          right = sectionAt(x1),
          d = devices.find((d) => (x0 + x1) / 2 > d.start && (x0 + x1) / 2 < d.stop),
          movingNose = d && d.device !== 'krueger';
        // Fixed leading-edge structure is recessed below the shell. It becomes
        // visible through the slot during extension and closes the wing cove.
        const core = (st, f, side) => {
          const p = at(st, f, side);
          if (movingNose) {
            p[1] = st[1] + (p[1] - st[1]) * 0.7;
            p[2] += (0.075 - f) * st[3] * 0.42;
          }
          return p;
        };
        part = null;
        for (let j = 1; j < cuts.length; j++)
          for (const side of [-1, 1])
            add(
              [
                core(left, cuts[j - 1], side),
                core(right, cuts[j - 1], side),
                core(right, cuts[j], side),
                core(left, cuts[j], side),
              ],
              color.map((v) => v * (side > 0 ? 1 : 0.65)),
            );
        if (!d) continue;
        if (movingNose)
          add(
            [at(left, 0.075, 1), at(right, 0.075, 1), at(right, 0.075, -1), at(left, 0.075, -1)],
            [88, 109, 132],
          );
        part = d;
        if (d.device === 'krueger') {
          const f = wireframe ? [0.025, 0.14] : [0.025, 0.045, 0.075, 0.11, 0.14],
            point = (st, f, side) => {
              const p = at(st, f, -1);
              p[1] -= 0.018 + side * 0.009;
              return p;
            };
          for (let j = 1; j < f.length; j++)
            for (const side of [-1, 1])
              add(
                [
                  point(left, f[j - 1], side),
                  point(right, f[j - 1], side),
                  point(right, f[j], side),
                  point(left, f[j], side),
                ],
                [165, 183, 201],
              );
          for (const st of [left, right])
            for (let j = 1; j < f.length; j++)
              add(
                [
                  point(st, f[j - 1], 1),
                  point(st, f[j], 1),
                  point(st, f[j], -1),
                  point(st, f[j - 1], -1),
                ],
                [111, 132, 154],
              );
          for (const f of [0.025, 0.14])
            add(
              [point(left, f, 1), point(right, f, 1), point(right, f, -1), point(left, f, -1)],
              [111, 132, 154],
            );
        } else {
          const point = (st, f, side) => slatPoint(st, f, side, d.device);
          for (let j = 1; j < cuts.length; j++)
            for (const side of [-1, 1])
              add(
                [
                  point(left, cuts[j - 1], side),
                  point(right, cuts[j - 1], side),
                  point(right, cuts[j], side),
                  point(left, cuts[j], side),
                ],
                side > 0 ? [163, 183, 202] : [117, 139, 161],
                true,
                null,
                0.25,
              );
          for (const st of [left, right])
            for (let j = 1; j < cuts.length; j++)
              add(
                [
                  point(st, cuts[j - 1], 1),
                  point(st, cuts[j], 1),
                  point(st, cuts[j], -1),
                  point(st, cuts[j - 1], -1),
                ],
                [125, 145, 164],
              );
          add(
            [
              point(left, 0.075, 1),
              point(right, 0.075, 1),
              point(right, 0.075, -1),
              point(left, 0.075, -1),
            ],
            [119, 139, 158],
          );
        }
        part = null;
      }
    }
    for (let k = 1; k < stations.length; k++) {
      const s = stations[k - 1],
        t = stations[k],
        flap = k <= 2 ? { kind: 'flap', sign, hinge: s, end: t } : null,
        aileron = k === 3 ? { kind: 'aileron', sign, hinge: s, end: t, chord: 0.72 } : null,
        spoiler = k <= 2 ? { kind: 'spoiler', sign, hinge: s, end: t, chord: 0.56 } : null,
        aft =
          flap && doubleSlotted
            ? { ...flap, component: 'aft-element', chord: 0.86, deflection: 43, extension: 1.12 }
            : null,
        surfacePart = (f, side) =>
          side > 0 && spoiler && f >= 0.56 && f < 0.7
            ? spoiler
            : f >= 0.86 && aft
              ? aft
              : f >= 0.72
                ? flap || aileron
                : null;
      for (let j = 1; j < fractions.length; j++) {
        const lo = fractions[j - 1],
          hi = fractions[j];
        if (hi <= 0.075 && k <= leadingLast) continue;
        for (const side of [-1, 1]) {
          part = surfacePart((lo + hi) / 2, side);
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
            (airline === 'AEROFLOT' && a.code === 'A339' && k >= stations.length - 2
              ? [225, 73, 35]
              : color
            ).map((v) => v * (side > 0 ? 1 : 0.65)),
            true,
            normals,
            0.22,
          );
        }
      }
      // Close both sides of every moving element. Their exposed cove is visible
      // during travel rather than showing through an open, paper-thin surface.
      for (const [lo, hi, moving] of [
        [0.72, aft ? 0.86 : 1, flap || aileron],
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
        const f = lo;
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
      if (k <= leadingLast) leadingSpan(s, t);
    }
    for (const device of devices) {
      if (wireframe || device.device !== 'slat') continue;
      for (const u of [0.24, 0.76]) {
        const st = sectionAt(device.start + (device.stop - device.start) * u),
          root = slatPoint(st, 0.058, -1),
          length = Math.min(0.42, st[3] * 0.085);
        part = { ...device, component: 'slat-track' };
        let before = root;
        for (let j = 1; j <= 4; j++) {
          const v = j / 4,
            next = [
              root[0],
              root[1] - Math.sin((v * Math.PI) / 2) * length * 0.28,
              root[2] + v * length,
            ];
          beam(before, next, spec.narrow ? 0.012 : 0.019, [107, 122, 138]);
          before = next;
        }
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
      const elevator = { kind: 'elevator', sign, hinge: s, end: t, chord: 0.695 };
      part = null;
      for (let j = 1; j < fractions.length; j++)
        for (const side of [-1, 1]) {
          part = fractions[j - 1] >= 0.695 ? elevator : null;
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
      part = elevator;
      add(
        [
          [sign * s[0], s[1], s[2] + s[3]],
          [sign * t[0], t[1], t[2] + t[3]],
          [sign * t[0], t[1] - 0.08, t[2] + t[3]],
          [sign * s[0], s[1] - 0.08, s[2] + s[3]],
        ],
        [63, 99, 140],
      );
      part = null;
    }
  }

  for (const sign of [-1, 1]) {
    const stations = wingGeometry(a).stations;
    foil(stations, sign, wingColor, true);
    if (a.code === 'A321') {
      // A321-211 N156UW: the fence sweeps aft and tapers, with a shorter
      // lower blade. Both sit at the aft edge of the outer wingtip.
      // Reference: https://commons.wikimedia.org/wiki/File:Airbus_A321_wingtip_fence.jpg
      const q = stations.at(-1),
        point = (side, y, z) => [
          sign * (q[0] + side * 0.018),
          q[1] + y,
          q[2] + q[3] + (z - (q[3] * 0.49 + q[3] - 0.02) / 2) * 2.7,
        ],
        blade = (name, sections) => {
          part = { kind: 'wingtip-fence', component: name, sign };
          for (let i = 1; i < sections.length; i++) {
            const [y0, leading0, trailing0] = sections[i - 1],
              [y1, leading1, trailing1] = sections[i];
            for (const side of [-1, 1]) {
              const vertices = [
                point(side, y0, leading0),
                point(side, y1, leading1),
                ...(leading1 === trailing1 ? [] : [point(side, y1, trailing1)]),
                point(side, y0, trailing0),
              ];
              add(side > 0 ? vertices : [...vertices].reverse(), [174, 193, 212], true, null, 0.16);
            }
            for (const [z0, z1] of [
              [leading0, leading1],
              [trailing0, trailing1],
            ])
              add(
                [point(-1, y0, z0), point(-1, y1, z1), point(1, y1, z1), point(1, y0, z0)],
                [112, 137, 159],
              );
          }
          const [y, leading, trailing] = sections.at(-1);
          if (leading !== trailing)
            add(
              [
                point(-1, y, leading),
                point(-1, y, trailing),
                point(1, y, trailing),
                point(1, y, leading),
              ],
              [112, 137, 159],
            );
          part = null;
        };
      blade('upper', [
        [0, q[3] * 0.48, q[3] - 0.02],
        [1.09, q[3] * 0.98, q[3] * 0.98],
      ]);
      blade('lower', [
        [0, q[3] * 0.5, q[3] - 0.02],
        [-0.77, q[3] * 0.98, q[3] * 0.98],
      ]);
      if (!wireframe) {
        part = { kind: 'wingtip-fence', component: 'static-wick', sign };
        for (const [y, z] of [
          [0.87, q[3] * 0.978],
          [0.42, q[3] * 0.976],
          [-0.21, q[3] * 0.976],
          [-0.59, q[3] * 0.978],
        ]) {
          const base = point(0, y, z);
          beam(base, [base[0], base[1], base[2] + 0.16], 0.006, [74, 94, 113]);
        }
        part = null;
      }
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
        airline === 'spirit' || airline === 'S7' ? body : [181, 198, 217],
      );
      // Airline marks are attached to each engine cowling, not drawn in screen space.
      if (!wireframe && (airline === 'spirit' || airline === 'S7')) {
        const enginePoint = (distance, dy, lift = 0.03) => {
          let k = 1;
          while (k < contour.length - 1 && distance > contour[k][0]) k++;
          const lo = contour[k - 1],
            hi = contour[k],
            t = (distance - lo[0]) / (hi[0] - lo[0]),
            radius = er * (lo[1] + (hi[1] - lo[1]) * t),
            outer = Math.sqrt(Math.max(0, radius * radius - dy * dy));
          return [ex + sign * (outer + lift), ey + dy, z + distance];
        };
        const normal = [sign, 0, 0];
        part = { kind: 'decal', marking: 'engine-livery', sign, normal };
        if (airline === 'S7') {
          const center = enginePoint(1.35, 0, 0.04),
            segments = 32;
          for (let i = 0; i < segments; i++) {
            const t0 = (i * Math.PI * 2) / segments,
              t1 = ((i + 1) * Math.PI * 2) / segments;
            add(
              [
                center,
                enginePoint(1.35 + 0.43 * Math.cos(t0), 0.43 * Math.sin(t0), 0.04),
                enginePoint(1.35 + 0.43 * Math.cos(t1), 0.43 * Math.sin(t1), 0.04),
              ],
              [206, 35, 48],
              false,
              [normal, normal, normal],
            );
          }
        }
        const art = liveryGlyphs[airline],
          width = airline === 'spirit' ? 1.75 : 0.57,
          height = airline === 'spirit' ? 0.31 : 0.3,
          begin = 1.35 - width / 2,
          along = (x) => (sign > 0 ? begin + x * width : begin + (1 - x) * width);
        for (const [x0, y0, x1, y1] of art.rects) {
          const a0 = along(x0 / art.width),
            a1 = along(x1 / art.width),
            low = height * (0.5 - y1 / art.height),
            high = height * (0.5 - y0 / art.height);
          add(
            [
              enginePoint(a0, low, 0.065),
              enginePoint(a1, low, 0.065),
              enginePoint(a1, high, 0.065),
              enginePoint(a0, high, 0.065),
            ],
            airlineColor,
            false,
            [normal, normal, normal, normal],
          );
        }
        part = null;
      }
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
        airline === 'AEROFLOT' ? [24, 51, 105] : [172, 192, 215],
      );
      if (airline === 'AEROFLOT' && !wireframe)
        tube(
          ex,
          ey,
          [
            [z + 0.12, er * 0.94],
            [z + 0.2, er * 0.98],
          ],
          [232, 78, 35],
          36,
          true,
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
    // Filled wordmarks are made from short surface patches, so they follow
    // the fuselage and are occluded correctly as the model rotates.
    if (!wireframe) {
      marking = 'livery';
      const art =
          airline === 'AEROFLOT'
            ? aeroflotMarks[sign > 0 ? 'АЭРОФЛОТ' : 'AEROFLOT']
            : liveryGlyphs[airline],
        titleHeight = airline === 'AEROFLOT' ? 0.78 : spec.narrow ? 1.35 : 1.55,
        titleWidth =
          airline === 'spirit'
            ? 8.8
            : airline === 'S7'
              ? 3.1
              : airline === 'American'
                ? 14
                : a.code === 'B77W'
                  ? 10.8
                  : 9.2,
        start =
          airline === 'AEROFLOT'
            ? -half + spec.doors[0] + 2
            : -half + spec.noseLength + (spec.narrow ? 1.5 : 3.2),
        bottom = airline === 'AEROFLOT' ? 1.54 : spec.narrow ? -0.78 : -0.95,
        along = (v) => (sign > 0 ? start + v * titleWidth : start + (1 - v) * titleWidth);
      for (const [x0, y0, x1, y1] of art.rects) {
        const z0 = along(x0 / art.width),
          z1 = along(x1 / art.width),
          low = bottom + titleHeight * (1 - y1 / art.height),
          high = bottom + titleHeight * (1 - y0 / art.height);
        skinPatch(
          [
            [z0, low],
            [z1, low],
            [z1, high],
            [z0, high],
          ],
          airlineColor,
          0.075,
        );
      }
      if (airline === 'AEROFLOT') {
        const sub = aeroflotMarks[sign > 0 ? 'Российские авиалинии' : 'Russian Airlines'],
          subWidth = titleWidth * 0.55,
          subStart = start + titleWidth * 0.33,
          subY = 1.27,
          subHeight = 0.19,
          subAlong = (x) => (sign > 0 ? subStart + x * subWidth : subStart + (1 - x) * subWidth);
        for (const [x0, y0, x1, y1] of sub.rects) {
          const z0 = subAlong(x0 / sub.width),
            z1 = subAlong(x1 / sub.width),
            low = subY + subHeight * (1 - y1 / sub.height),
            high = subY + subHeight * (1 - y0 / sub.height);
          skinPatch(
            [
              [z0, low],
              [z1, low],
              [z1, high],
              [z0, high],
            ],
            airlineColor,
            0.073,
          );
        }
      }
      if (airline === 'American') {
        const front = start - 1.2;
        skinPatch(
          [
            [front, -0.2],
            [front + 0.45, 0.45],
            [front + 0.92, 0.17],
            [front + 0.47, -0.48],
          ],
          [45, 92, 145],
          0.074,
        );
        skinPatch(
          [
            [front + 0.5, -0.48],
            [front + 0.92, 0.17],
            [front + 1.18, -0.12],
            [front + 0.7, -0.7],
          ],
          [192, 43, 50],
          0.078,
        );
      }
      // Small registration-country flags are intentionally generic and do not
      // pretend that a fictional model represents a particular airframe.
      const flagZ =
          airline === 'AEROFLOT'
            ? -half + spec.noseLength * 0.52
            : half - (spec.narrow ? 6.8 : 11.5),
        flagW = spec.narrow ? 0.58 : 0.78,
        flagH = spec.narrow ? 0.3 : 0.4,
        yFlag = 0.54;
      if (airline === 'AEROFLOT' || airline === 'S7') {
        const cols = [
          [245, 245, 242],
          [43, 79, 160],
          [199, 42, 51],
        ];
        for (let i = 0; i < 3; i++) {
          const top = yFlag + flagH / 2 - (i * flagH) / 3,
            bottom = top - flagH / 3;
          skinPatch(
            [
              [flagZ, bottom],
              [flagZ + flagW, bottom],
              [flagZ + flagW, top],
              [flagZ, top],
            ],
            cols[i],
            0.065,
          );
        }
      } else {
        for (let i = 0; i < 6; i++) {
          const top = yFlag + flagH / 2 - (i * flagH) / 6,
            bottom = top - flagH / 6;
          skinPatch(
            [
              [flagZ, bottom],
              [flagZ + flagW, bottom],
              [flagZ + flagW, top],
              [flagZ, top],
            ],
            i % 2 ? [244, 244, 239] : [190, 42, 48],
            0.065,
          );
        }
        const sideStart = sign > 0 ? flagZ : flagZ + flagW * 0.56;
        skinPatch(
          [
            [sideStart, yFlag],
            [sideStart + flagW * 0.44, yFlag],
            [sideStart + flagW * 0.44, yFlag + flagH * 0.5],
            [sideStart, yFlag + flagH * 0.5],
          ],
          [35, 65, 121],
          0.075,
        );
      }
    }
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
      if (airline === 'AEROFLOT')
        skinStroke([...outline, outline[0]], [87, 103, 120], 0.035, 0.052);
      else {
        skinPatch(outline, [103, 120, 137], 0.034);
        skinPatch(rounded(z, cy, w - 0.07, h - 0.07, 0.14), body, 0.052);
      }
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
        if (airline === 'AEROFLOT') {
          const outline = rounded(z, -1.25 * c, 2.8 * c, 1.55 * c, 0.15);
          skinStroke([...outline, outline[0]], [102, 119, 138], 0.035, 0.055);
        } else {
          skinPatch(rounded(z, -1.25 * c, 2.8 * c, 1.55 * c, 0.15), [107, 124, 140], 0.026);
          skinPatch(rounded(z, -1.25 * c, 2.73 * c, 1.48 * c, 0.13), body, 0.045);
        }
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
  const baseFinSections = spec.finSections.map((q) => [q[0], half - q[1], q[2], q[3]]),
    finSections = wireframe
      ? baseFinSections
      : (() => {
          const bottom = baseFinSections[0][0],
            top = baseFinSections.at(-1)[0],
            heights = [
              ...baseFinSections.map((q) => q[0]),
              ...Array.from({ length: 15 }, (_, i) => bottom + ((top - bottom) * i) / 14),
            ]
              .sort((x, y) => x - y)
              .filter((y, i, all) => i === 0 || y - all[i - 1] > 1e-5);
          return heights.map((y) => {
            let k = 1;
            while (k < baseFinSections.length - 1 && y > baseFinSections[k][0]) k++;
            const lo = baseFinSections[k - 1],
              hi = baseFinSections[k],
              t = (y - lo[0]) / (hi[0] - lo[0]);
            return lo.map((value, index) => value + (hi[index] - value) * t);
          });
        })(),
    fractions = wireframe ? [0, 0.12, 0.48, 0.73, 1] : Array.from({ length: 49 }, (_, i) => i / 48);
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
          (() => {
            const height =
                ((lo[0] + hi[0]) / 2 - finSections[0][0]) /
                (finSections.at(-1)[0] - finSections[0][0]),
              chord = (u + v) / 2;
            if (airline === 'spirit') return [247, 210, 23];
            if (airline === 'S7') return [112, 181, 35];
            if (airline === 'AEROFLOT') return [24, 51, 105];
            const stripe = Math.floor(height * 14);
            return stripe % 2 === 0
              ? [231, 235, 235]
              : stripe % 4 === 1
                ? [192, 43, 50]
                : [33, 77, 128];
          })(),
          true,
          normals,
          0.12,
        );
      }
  // Paint and markings follow the airfoil on each side of the fin.
  const finAt = (height, fraction, side, lift = 0.045) => {
    const y = baseFinSections[0][0] + height * (baseFinSections.at(-1)[0] - baseFinSections[0][0]);
    let k = 1;
    while (k < baseFinSections.length - 1 && y > baseFinSections[k][0]) k++;
    const lo = baseFinSections[k - 1],
      hi = baseFinSections[k],
      t = (y - lo[0]) / (hi[0] - lo[0]);
    const section = lo.map((v, i) => v + (hi[i] - v) * t);
    const point = finPoint(section, fraction, side);
    point[0] += side * lift;
    return point;
  };
  if (!wireframe && airline === 'AEROFLOT') {
    for (const side of [-1, 1]) {
      const normal = [side, 0, 0];
      part = { kind: 'decal', marking: 'aeroflot-tail-stripe', sign: side, normal };
      for (let i = 0; i < 40; i++) {
        const f0 = i / 40,
          f1 = (i + 1) / 40,
          curve = (f) => 0.18 + 0.55 * f + 0.07 * Math.sin(Math.PI * f),
          strips = [
            [[238, 239, 233], 0.2, 0.32],
            [[46, 94, 151], 0.08, 0.2],
            [[201, 36, 50], -0.04, 0.08],
          ];
        for (const [colour, low, high] of strips) {
          const clip = (v) => Math.max(0.015, Math.min(0.985, v)),
            y00 = clip(curve(f0) + low),
            y01 = clip(curve(f0) + high),
            y10 = clip(curve(f1) + low),
            y11 = clip(curve(f1) + high);
          add(
            [
              finAt(y00, f0, side, 0.065),
              finAt(y10, f1, side, 0.065),
              finAt(y11, f1, side, 0.065),
              finAt(y01, f0, side, 0.065),
            ],
            colour,
            false,
            [normal, normal, normal, normal],
          );
        }
      }
      part = null;
    }
  }
  // Airline logos are attached to each side of the vertical stabilizer.
  if (!wireframe && (airline === 'spirit' || airline === 'S7')) {
    const art = liveryGlyphs[airline];
    for (const side of [-1, 1]) {
      const normal = [side, 0, 0];
      part = { kind: 'decal', marking: 'tail-livery', sign: side, normal };
      if (airline === 'S7') {
        const center = finAt(0.54, 0.46, side),
          segments = 36;
        for (let i = 0; i < segments; i++) {
          const t0 = (i * Math.PI * 2) / segments,
            t1 = ((i + 1) * Math.PI * 2) / segments;
          add(
            [
              center,
              finAt(0.54 + 0.23 * Math.sin(t0), 0.46 + 0.34 * Math.cos(t0), side),
              finAt(0.54 + 0.23 * Math.sin(t1), 0.46 + 0.34 * Math.cos(t1), side),
            ],
            [206, 35, 48],
            false,
            [normal, normal, normal],
          );
        }
      }
      const along = (x) => (side > 0 ? 0.13 + 0.67 * x : 0.8 - 0.67 * x);
      for (const [x0, y0, x1, y1] of art.rects) {
        const l = along(x0 / art.width),
          r = along(x1 / art.width),
          bottom = 0.38 + 0.32 * (1 - y1 / art.height),
          top = 0.38 + 0.32 * (1 - y0 / art.height);
        add(
          [
            finAt(bottom, l, side, airline === 'S7' ? 0.1 : 0.045),
            finAt(bottom, r, side, airline === 'S7' ? 0.1 : 0.045),
            finAt(top, r, side, airline === 'S7' ? 0.1 : 0.045),
            finAt(top, l, side, airline === 'S7' ? 0.1 : 0.045),
          ],
          airlineColor,
          false,
          [normal, normal, normal, normal],
        );
      }
      part = null;
    }
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
      airline === 'spirit' || airline === 'S7' ? body : [116, 158, 203],
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
