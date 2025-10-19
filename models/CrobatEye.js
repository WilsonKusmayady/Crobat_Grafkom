// models/CrobatEye.js
import { SceneObject } from "./SceneObject.js";

export class CrobatEye extends SceneObject {
  constructor(GL, _position, _color, _normal) {
    super(GL, _position, _color, _normal);

    const OUTLINE_COLOR = [0.0, 0.0, 0.0]; // Hitam
    const YELLOW_COLOR = [1.0, 1.0, 0.0]; // Kuning
    const RED_COLOR = [1.0, 0.0, 0.0];     // Merah

    const SEGMENTS = 12; // Lebih sedikit → lebih tajam
    const RADIUS = 0.18; // Lebih besar
    const EYELID_HEIGHT = 0.12; // Lebih tinggi → lebih menutup

    // === STEP 1: Buat Setengah Lingkaran (Semicircle) ===
    // Titik pusat bawah
    this.vertices.push(0, -RADIUS, 0, ...OUTLINE_COLOR, 0, 0, 1);

    // Titik-titik setengah lingkaran (dari kiri ke kanan)
    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = Math.PI + (i * Math.PI) / SEGMENTS; // Dari 180° ke 360°
      const x = RADIUS * Math.cos(angle);
      const y = RADIUS * Math.sin(angle);
      this.vertices.push(x, y, 0, ...OUTLINE_COLOR, 0, 0, 1);
    }

    // === STEP 2: Buat Eyelid (Top Cap) — Lebih Tebal & Tajam ===
    // Titik kiri atas eyelid (lebih tinggi dan lebih dalam)
    this.vertices.push(-RADIUS * 0.9, EYELID_HEIGHT, 0, ...OUTLINE_COLOR, 0, 0, 1);
    // Titik kanan atas eyelid
    this.vertices.push(RADIUS * 0.9, EYELID_HEIGHT, 0, ...OUTLINE_COLOR, 0, 0, 1);

    // === STEP 3: Buat Iris Kuning (di dalam semicircle) ===
    const IRIS_RADIUS = 0.14;
    this.vertices.push(0, -IRIS_RADIUS, 0, ...YELLOW_COLOR, 0, 0, 1); // Pusat iris

    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = Math.PI + (i * Math.PI) / SEGMENTS;
      const x = IRIS_RADIUS * Math.cos(angle);
      const y = IRIS_RADIUS * Math.sin(angle);
      this.vertices.push(x, y, 0, ...YELLOW_COLOR, 0, 0, 1);
    }

    // === STEP 4: Buat Pupil Merah (di tengah) ===
    const PUPIL_RADIUS = 0.05;
    this.vertices.push(0, -PUPIL_RADIUS, 0, ...RED_COLOR, 0, 0, 1); // Pusat pupil

    for (let i = 0; i <= 8; i++) {
      const angle = (i * 2 * Math.PI) / 8;
      const x = PUPIL_RADIUS * Math.cos(angle);
      const y = PUPIL_RADIUS * Math.sin(angle);
      this.vertices.push(x, y, 0, ...RED_COLOR, 0, 0, 1);
    }

    // === STEP 5: Buat Faces (Triangulasi) ===

    // Faces untuk Outline (semicircle + eyelid)
    const baseIndex = 0;
    const semicircleStart = 1;
    const semicircleEnd = 1 + SEGMENTS + 1;

    // Triangulasi semicircle
    for (let i = 0; i < SEGMENTS; i++) {
      this.faces.push(
        baseIndex,
        semicircleStart + i,
        semicircleStart + i + 1
      );
    }

    // Tambahkan eyelid (segitiga dari titik atas kiri ke kanan ke pusat)
    const eyelidLeftIndex = semicircleEnd;
    const eyelidRightIndex = semicircleEnd + 1;

    this.faces.push(
      baseIndex,
      eyelidLeftIndex,
      eyelidRightIndex
    );

    // Faces untuk Iris (di dalam semicircle)
    const irisBaseIndex = semicircleEnd + 2;
    const irisStart = irisBaseIndex + 1;
    for (let i = 0; i < SEGMENTS; i++) {
      this.faces.push(
        irisBaseIndex,
        irisStart + i,
        irisStart + i + 1
      );
    }

    // Faces untuk Pupil
    const pupilBaseIndex = irisStart + SEGMENTS + 1;
    const pupilStart = pupilBaseIndex + 1;
    for (let i = 0; i < 8; i++) {
      this.faces.push(
        pupilBaseIndex,
        pupilStart + i,
        pupilStart + i + 1
      );
    }

    this.setup();
  }
}