// models/CrobatTeeth.js

import { SceneObject } from "./SceneObject.js";

export class CrobatTeeth extends SceneObject {
  constructor(GL, _position, _color, _normal) {
    super(GL, _position, _color, _normal);
    
    const TOOTH_COLOR = [1.0, 1.0, 1.0]; // Putih
    const w = 0.1, h = 0.2, d = 0.1; // Ukuran satu gigi
    const positions = [-0.4, -0.15, 0.15, 0.4]; // Posisi X untuk setiap gigi

    for (const posX of positions) {
      const baseIndex = this.vertices.length / 9;
      // Menambahkan vertices untuk 6 sisi dari sebuah balok
      this.vertices.push(
        // Depan (Normal Z=1)
        -w + posX, -h, d, ...TOOTH_COLOR, 0, 0, 1, w + posX, -h, d, ...TOOTH_COLOR, 0, 0, 1, w + posX, h, d, ...TOOTH_COLOR, 0, 0, 1, -w + posX, h, d, ...TOOTH_COLOR, 0, 0, 1,
        // Belakang (Normal Z=-1)
        -w + posX, -h, -d, ...TOOTH_COLOR, 0, 0, -1, w + posX, -h, -d, ...TOOTH_COLOR, 0, 0, -1, w + posX, h, -d, ...TOOTH_COLOR, 0, 0, -1, -w + posX, h, -d, ...TOOTH_COLOR, 0, 0, -1,
        // Kiri (Normal X=-1)
        -w + posX, -h, -d, ...TOOTH_COLOR, -1, 0, 0, -w + posX, -h, d, ...TOOTH_COLOR, -1, 0, 0, -w + posX, h, d, ...TOOTH_COLOR, -1, 0, 0, -w + posX, h, -d, ...TOOTH_COLOR, -1, 0, 0,
        // Kanan (Normal X=1)
        w + posX, -h, -d, ...TOOTH_COLOR, 1, 0, 0, w + posX, -h, d, ...TOOTH_COLOR, 1, 0, 0, w + posX, h, d, ...TOOTH_COLOR, 1, 0, 0, w + posX, h, -d, ...TOOTH_COLOR, 1, 0, 0,
        // Atas (Normal Y=1)
        -w + posX, h, d, ...TOOTH_COLOR, 0, 1, 0, w + posX, h, d, ...TOOTH_COLOR, 0, 1, 0, w + posX, h, -d, ...TOOTH_COLOR, 0, 1, 0, -w + posX, h, -d, ...TOOTH_COLOR, 0, 1, 0,
        // Bawah (Normal Y=-1)
        -w + posX, -h, d, ...TOOTH_COLOR, 0, -1, 0, w + posX, -h, d, ...TOOTH_COLOR, 0, -1, 0, w + posX, -h, -d, ...TOOTH_COLOR, 0, -1, 0, -w + posX, -h, -d, ...TOOTH_COLOR, 0, -1, 0
      );
      
      // Menambahkan faces untuk 6 sisi (12 segitiga)
      for (let i = 0; i < 6; i++) {
        const offset = baseIndex + i * 4;
        this.faces.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
      }
    }
    
    this.setup();
  }
}