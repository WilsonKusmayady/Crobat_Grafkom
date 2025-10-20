// File: models/CrobatWing.js

export class CrobatUpperWing {
  constructor(GL, positionAttribLocation, colorAttribLocation, normalAttribLocation) {
    this.GL = GL;
    this._position = positionAttribLocation;
    this._color = colorAttribLocation;
    this._normal = normalAttribLocation;
    this.modelMatrix = LIBS.get_I4();

    const wingData = this.generateWing();
    this.vertices = wingData.vertices;
    this.colors = wingData.colors;
    this.normals = wingData.normals;
    this.indices = wingData.indices;

    this.TRIANGLE_VERTEX = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.STATIC_DRAW);

    this.TRIANGLE_COLORS = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_COLORS);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.colors), GL.STATIC_DRAW);

    this.TRIANGLE_NORMAL = GL.createBuffer();
    GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_NORMAL);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.normals), GL.STATIC_DRAW);

    this.TRIANGLE_FACES = GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.TRIANGLE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.indices), GL.STATIC_DRAW);
  }

  // Fungsi untuk menghitung titik pada kurva Bézier kubik
  bezierPoint(t, p0, p1, p2, p3) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    return [
      uuu * p0[0] + 3 * uu * t * p1[0] + 3 * u * tt * p2[0] + ttt * p3[0],
      uuu * p0[1] + 3 * uu * t * p1[1] + 3 * u * tt * p2[1] + ttt * p3[1],
      uuu * p0[2] + 3 * uu * t * p1[2] + 3 * u * tt * p2[2] + ttt * p3[2]
    ];
  }

  // Fungsi untuk membuat tube/pipe di sepanjang kurva
  generateTubeAlongCurve(curve, radius, segments, radialSegments) {
    const vertices = [];
    const colors = [];
    const normals = [];
    const indices = [];
    let vertexOffset = 0;

    // Warna ungu untuk tulang sayap
    const boneColor = [0.6, 0.3, 0.8];

    for (let i = 0; i < segments; i++) {
      const t = i / (segments - 1);
      const point = curve(t);
      
      // Hitung tangent untuk orientasi tube
      const dt = 0.01;
      const nextPoint = curve(Math.min(t + dt, 1));
      const tangent = [
        nextPoint[0] - point[0],
        nextPoint[1] - point[1],
        nextPoint[2] - point[2]
      ];
      const tangentLen = Math.sqrt(tangent[0]**2 + tangent[1]**2 + tangent[2]**2);
      tangent[0] /= tangentLen;
      tangent[1] /= tangentLen;
      tangent[2] /= tangentLen;

      // Buat vektor perpendicular
      let up = [0, 1, 0];
      if (Math.abs(tangent[1]) > 0.9) up = [1, 0, 0];
      
      const right = [
        tangent[1] * up[2] - tangent[2] * up[1],
        tangent[2] * up[0] - tangent[0] * up[2],
        tangent[0] * up[1] - tangent[1] * up[0]
      ];
      const rightLen = Math.sqrt(right[0]**2 + right[1]**2 + right[2]**2);
      right[0] /= rightLen;
      right[1] /= rightLen;
      right[2] /= rightLen;

      const newUp = [
        tangent[1] * right[2] - tangent[2] * right[1],
        tangent[2] * right[0] - tangent[0] * right[2],
        tangent[0] * right[1] - tangent[1] * right[0]
      ];

      // Radius yang mengecil di ujung
      const taperFactor = 1 - t * 0.5;
      const currentRadius = radius * taperFactor;

      // Buat lingkaran di sekitar titik
      for (let j = 0; j <= radialSegments; j++) {
        const angle = (j / radialSegments) * Math.PI * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const x = point[0] + (right[0] * cos + newUp[0] * sin) * currentRadius;
        const y = point[1] + (right[1] * cos + newUp[1] * sin) * currentRadius;
        const z = point[2] + (right[2] * cos + newUp[2] * sin) * currentRadius;

        vertices.push(x, y, z);
        colors.push(...boneColor);

        const nx = right[0] * cos + newUp[0] * sin;
        const ny = right[1] * cos + newUp[1] * sin;
        const nz = right[2] * cos + newUp[2] * sin;
        normals.push(nx, ny, nz);
      }

      // Buat indices untuk segment ini
      if (i > 0) {
        for (let j = 0; j < radialSegments; j++) {
          const a = vertexOffset + j;
          const b = vertexOffset + j + 1;
          const c = vertexOffset + j + radialSegments + 1;
          const d = vertexOffset + j + radialSegments + 2;

          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }

      vertexOffset += radialSegments + 1;
    }

    return { vertices, colors, normals, indices, vertexCount: vertices.length / 3 };
  }

  generateWing() {
    let allVertices = [];
    let allColors = [];
    let allNormals = [];
    let allIndices = [];
    let indexOffset = 0;

    // Definisi 4 jari tulang sayap dengan kontrol point Bézier
    const bones = [
      { // Jari atas (paling panjang)
        p0: [0, 0, 0],
        p1: [0.5, 0.8, 0.3],
        p2: [1.2, 1.5, 0.2],
        p3: [2.0, 2.2, 0],
        radius: 0.04
      },
      { // Jari tengah atas
        p0: [0, -0.1, 0],
        p1: [0.6, 0.3, 0.2],
        p2: [1.3, 0.8, 0.1],
        p3: [2.2, 1.2, 0],
        radius: 0.045
      },
      { // Jari tengah bawah
        p0: [0, -0.2, 0],
        p1: [0.7, -0.2, 0.15],
        p2: [1.4, 0.1, 0.05],
        p3: [2.3, 0.3, 0],
        radius: 0.04
      },
      { // Jari bawah
        p0: [0, -0.3, 0],
        p1: [0.5, -0.6, 0.1],
        p2: [1.0, -0.8, 0],
        p3: [1.8, -1.0, 0],
        radius: 0.035
      }
    ];

    // Tulang utama (dari bahu ke tengah sayap)
    const mainBone = {
      p0: [0, 0, 0],
      p1: [0.2, 0, 0],
      p2: [0.4, -0.1, 0],
      p3: [0.6, -0.15, 0],
      radius: 0.05
    };

    // Buat tulang utama
    const mainBoneCurve = (t) => this.bezierPoint(t, mainBone.p0, mainBone.p1, mainBone.p2, mainBone.p3);
    const mainBoneData = this.generateTubeAlongCurve(mainBoneCurve, mainBone.radius, 20, 8);
    
    allVertices.push(...mainBoneData.vertices);
    allColors.push(...mainBoneData.colors);
    allNormals.push(...mainBoneData.normals);
    mainBoneData.indices.forEach(idx => allIndices.push(idx + indexOffset));
    indexOffset += mainBoneData.vertexCount;

    // Simpan titik ujung untuk membran
    const boneEndPoints = [];

    // Buat semua jari tulang
    bones.forEach(bone => {
      const curve = (t) => this.bezierPoint(t, bone.p0, bone.p1, bone.p2, bone.p3);
      const boneData = this.generateTubeAlongCurve(curve, bone.radius, 30, 8);
      
      allVertices.push(...boneData.vertices);
      allColors.push(...boneData.colors);
      allNormals.push(...boneData.normals);
      boneData.indices.forEach(idx => allIndices.push(idx + indexOffset));
      indexOffset += boneData.vertexCount;

      // Simpan beberapa titik di sepanjang kurva untuk membran
      const curvePoints = [];
      for (let i = 0; i <= 10; i++) {
        curvePoints.push(curve(i / 10));
      }
      boneEndPoints.push(curvePoints);
    });

    // Buat membran di antara tulang-tulang
    const membraneColor = [0.4, 0.7, 0.9]; // Biru muda
    
    for (let i = 0; i < bones.length - 1; i++) {
      const curve1 = boneEndPoints[i];
      const curve2 = boneEndPoints[i + 1];

      for (let j = 0; j < curve1.length - 1; j++) {
        const p1 = curve1[j];
        const p2 = curve1[j + 1];
        const p3 = curve2[j];
        const p4 = curve2[j + 1];

        // Offset Z sedikit agar membran sedikit di belakang tulang
        const zOffset = -0.01;

        // Tambah vertices untuk quad membran
        const startIdx = allVertices.length / 3;
        
        allVertices.push(p1[0], p1[1], p1[2] + zOffset);
        allVertices.push(p2[0], p2[1], p2[2] + zOffset);
        allVertices.push(p3[0], p3[1], p3[2] + zOffset);
        allVertices.push(p4[0], p4[1], p4[2] + zOffset);

        // Warna membran (semi-transparan visual)
        for (let k = 0; k < 4; k++) {
          allColors.push(...membraneColor);
        }

        // Hitung normal untuk membran
        const v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
        const v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
        const normal = [
          v1[1] * v2[2] - v1[2] * v2[1],
          v1[2] * v2[0] - v1[0] * v2[2],
          v1[0] * v2[1] - v1[1] * v2[0]
        ];
        const len = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
        normal[0] /= len;
        normal[1] /= len;
        normal[2] /= len;

        for (let k = 0; k < 4; k++) {
          allNormals.push(...normal);
        }

        // Indices untuk dua segitiga membran
        allIndices.push(
          indexOffset + 0, indexOffset + 1, indexOffset + 2,
          indexOffset + 1, indexOffset + 3, indexOffset + 2
        );
        indexOffset += 4;
      }
    }

    // Tambahkan membran ke tepi atas dan bawah
    const edgeCurves = [
      boneEndPoints[0], // Tepi atas
      boneEndPoints[boneEndPoints.length - 1] // Tepi bawah
    ];

    edgeCurves.forEach(curve => {
      const origin = [0, 0, 0];
      for (let j = 0; j < curve.length - 1; j++) {
        const p1 = curve[j];
        const p2 = curve[j + 1];

        const startIdx = allVertices.length / 3;
        const zOffset = -0.01;

        allVertices.push(origin[0], origin[1], origin[2] + zOffset);
        allVertices.push(p1[0], p1[1], p1[2] + zOffset);
        allVertices.push(p2[0], p2[1], p2[2] + zOffset);

        for (let k = 0; k < 3; k++) {
          allColors.push(...membraneColor);
        }

        const v1 = [p1[0] - origin[0], p1[1] - origin[1], p1[2] - origin[2]];
        const v2 = [p2[0] - origin[0], p2[1] - origin[1], p2[2] - origin[2]];
        const normal = [
          v1[1] * v2[2] - v1[2] * v2[1],
          v1[2] * v2[0] - v1[0] * v2[2],
          v1[0] * v2[1] - v1[1] * v2[0]
        ];
        const len = Math.sqrt(normal[0]**2 + normal[1]**2 + normal[2]**2);
        normal[0] /= len;
        normal[1] /= len;
        normal[2] /= len;

        for (let k = 0; k < 3; k++) {
          allNormals.push(...normal);
        }

        allIndices.push(indexOffset + 0, indexOffset + 1, indexOffset + 2);
        indexOffset += 3;
      }
    });

    return {
      vertices: allVertices,
      colors: allColors,
      normals: allNormals,
      indices: allIndices
    };
  }

  render(GL, uniformMatrix, parentMatrix) {
    const finalMatrix = LIBS.multiply(parentMatrix, this.modelMatrix);

    GL.uniformMatrix4fv(uniformMatrix, false, finalMatrix);

    GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_VERTEX);
    GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, 0, 0);

    GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_COLORS);
    GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, 0, 0);

    GL.bindBuffer(GL.ARRAY_BUFFER, this.TRIANGLE_NORMAL);
    GL.vertexAttribPointer(this._normal, 3, GL.FLOAT, false, 0, 0);

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.TRIANGLE_FACES);
    GL.drawElements(GL.TRIANGLES, this.indices.length, GL.UNSIGNED_INT, 0);
  }
}