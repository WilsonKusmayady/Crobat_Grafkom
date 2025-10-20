// models/CrobatFoot.js

import { SceneObject } from "./SceneObject.js";

export class CrobatFoot extends SceneObject {
  constructor(GL, _position, _color, _normal) {
    super(GL, _position, _color, _normal);

    const FOOT_COLOR = [0.37, 0.23, 0.9];
    
    // STEP 1: Buat Pangkal Kaki (Palm)
    const palmRadius = 0;
    const palmHeight = 0.15;
    this.createPalm(palmRadius, palmHeight, FOOT_COLOR);

    // =========================================================
    //         PERUBAHAN UTAMA ADA DI SINI
    // =========================================================
    // STEP 2: Definisikan Tiga Jari Kaki dengan Ukuran Berbeda
    const toeData = [
      // Jari Kiri (standar)
      { pos: [-0.12, -0.05, 0], rotZ: 0.5, height: 0.4, radius: 0.1 },
      // Jari Tengah (lebih panjang dan lebih lebar)
      { pos: [0, 0, 0], rotZ: 0, height: 0.6, radius: 0.13 },
      // Jari Kanan (standar)
      { pos: [0.12, -0.05, 0], rotZ: -0.5, height: 0.4, radius: 0.1 }
    ];

    for (const data of toeData) {
      this.createToe(data.pos, data.rotZ, data.height, data.radius, FOOT_COLOR);
    }
    // =========================================================

    this.setup();
  }

  createPalm(radius, height, color) {
    const segments = 12;
    const baseIndex = this.vertices.length / 9;

    this.vertices.push(0, height, 0, ...color, 0, 1, 0);

    for (let i = 0; i <= segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        this.vertices.push(x, 0, z, ...color, 0, -1, 0);
    }

    for (let i = 0; i < segments; i++) {
        this.faces.push(baseIndex, baseIndex + i + 1, baseIndex + i + 2);
    }
  }

  // Fungsi createToe sekarang menerima 'radius' sebagai parameter
  createToe(position, rotationZ, height, radius, color) {
    const segments = 10;
    const baseIndex = this.vertices.length / 9;

    for (let j = 0; j <= segments; j++) {
      const y_ratio = j / segments;
      const y = y_ratio * height;
      const currentRadius = radius * (1 - y_ratio);

      for (let i = 0; i <= segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;
        let x = currentRadius * Math.cos(angle);
        let z = currentRadius * Math.sin(angle);
        
        const rotatedX = x * Math.cos(rotationZ) - y * Math.sin(rotationZ);
        const rotatedY = x * Math.sin(rotationZ) + y * Math.cos(rotationZ);
        
        const finalX = rotatedX + position[0];
        const finalY = rotatedY + position[1];
        const finalZ = z + position[2];
        
        this.vertices.push(finalX, finalY, finalZ, ...color, 0, 0, 1);
      }
    }

    for (let j = 0; j < segments; j++) {
      for (let i = 0; i < segments; i++) {
        const first = baseIndex + (j * (segments + 1)) + i;
        const second = first + segments + 1;
        this.faces.push(first, second, first + 1);
        this.faces.push(second, second + 1, first + 1);
      }
    }
  }
}