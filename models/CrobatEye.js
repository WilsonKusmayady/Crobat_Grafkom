// models/CrobatEye.js

import { SceneObject } from "./SceneObject.js";

// Kelas helper untuk satu bagian mata
class EyePart extends SceneObject {
  constructor(GL, _position, _color, _normal, vertices, faces) {
    super(GL, _position, _color, _normal);
    this.vertices = vertices;
    this.faces = faces;
    this.setup();
  }
}

// --- Kelas Utama CrobatEye ---
export class CrobatEye {
  constructor(GL, _position, _color, _normal) {
    // 1. Buat Sklera Kuning (Setengah Lingkaran Bawah)
    this.yellowPart = this.createSclera(GL, _position, _color, _normal);

    // 2. Buat Outline / Kelopak Mata Hitam (BENTUK BARU)
    this.outlinePart = this.createEyelid(GL, _position, _color, _normal);
    
    // 3. Buat Pupil Merah
    this.redPart = this.createPupil(GL, _position, _color, _normal);

    // Atur hierarki posisi agar tidak tumpang tindih (Z-fighting)
    LIBS.translateZ(this.outlinePart.modelMatrix, 0.01);
    LIBS.translateZ(this.redPart.modelMatrix, 0.02);

    this.modelMatrix = LIBS.get_I4();
  }

  // --- Fungsi Geometri untuk Sklera Kuning ---
  createSclera(GL, _position, _color, _normal) {
    const YELLOW = [1.0, 1.0, 0.0];
    const RADIUS = 0.15;
    const SEGMENTS = 16;
    let vertices = [], faces = [];

    vertices.push(0, 0, 0, ...YELLOW, 0, 0, 1);

    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = Math.PI + (i * Math.PI) / SEGMENTS;
      const x = RADIUS * Math.cos(angle);
      const y = RADIUS * Math.sin(angle);
      vertices.push(x, y, 0, ...YELLOW, 0, 0, 1);
    }

    for (let i = 0; i < SEGMENTS; i++) {
      faces.push(0, i + 1, i + 2);
    }
    
    return new EyePart(GL, _position, _color, _normal, vertices, faces);
  }

// models/CrobatEye.js

// ... (kode lainnya biarkan sama) ...

  // --- FUNGSI EYELID BARU UNTUK MEMBUAT ALIS TAJAM ---
  createEyelid(GL, _position, _color, _normal) {
    const BLACK = [0.0, 0.0, 0.0];
    const RADIUS = 0.16;    // Radius busur bawah, sedikit lebih besar dari sklera kuning
    const HEIGHT = 0;    // Seberapa tinggi dan tajam puncak alisnya
    const SEGMENTS = 8;     // Jumlah segmen untuk membuat lengkungan bawah yang mulus
    let vertices = [], faces = [];

    // 1. Definisikan titik puncak alis sebagai pusat dari "Triangle Fan"
    const topPoint = [0, HEIGHT, 0];
    vertices.push(...topPoint, ...BLACK, 0, 0, 1); // Ini akan menjadi vertex index 0

    // 2. Buat serangkaian titik (vertices) yang membentuk busur/lengkungan di bagian bawah.
    // Loop ini akan membuat setengah lingkaran atas, dari kanan (0°) ke kiri (180°).
    for (let i = 0; i <= SEGMENTS; i++) {
        const angle = (i * Math.PI) / SEGMENTS;
        const x = RADIUS * Math.cos(angle);
        const y = RADIUS * Math.sin(angle);
        vertices.push(x, y, 0, ...BLACK, 0, 0, 1);
    }

    // 3. Buat faces (segitiga) yang menghubungkan titik puncak (index 0)
    // dengan setiap pasang titik pada busur bawah.
    for (let i = 0; i < SEGMENTS; i++) {
        // Menghubungkan (puncak, titik_busur_i, titik_busur_i+1)
        faces.push(0, i + 1, i + 2);
    }
    
    return new EyePart(GL, _position, _color, _normal, vertices, faces);
  }

// ... (sisa kode di file CrobatEye.js biarkan sama) ...
  
  // --- Fungsi Geometri untuk Pupil Merah ---
  createPupil(GL, _position, _color, _normal) {
    const RED = [1.0, 0.0, 0.0];
    const RADIUS = 0.04;
    const SEGMENTS = 16;
    let vertices = [], faces = [];
    
    vertices.push(0, 0, 0, ...RED, 0, 0, 1);

    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = (i * 2 * Math.PI) / SEGMENTS;
      const x = RADIUS * Math.cos(angle);
      const y = RADIUS * Math.sin(angle);
      vertices.push(x, y, 0, ...RED, 0, 0, 1);
    }

    for (let i = 0; i < SEGMENTS; i++) {
      faces.push(0, i + 1, i + 2);
    }
    
    return new EyePart(GL, _position, _color, _normal, vertices, faces);
  }

  // Render semua bagian mata
  render(GL, _Mmatrix, parentMatrix) {
    const combinedMatrix = LIBS.multiply(parentMatrix, this.modelMatrix);
    this.yellowPart.render(GL, _Mmatrix, combinedMatrix);
    this.outlinePart.render(GL, _Mmatrix, combinedMatrix);
    this.redPart.render(GL, _Mmatrix, combinedMatrix);
  }
}