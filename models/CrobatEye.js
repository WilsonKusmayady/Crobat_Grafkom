// models/CrobatEye.js
import { SceneObject } from "./SceneObject.js";

export class CrobatEye extends SceneObject {
  constructor(GL, _position, _color, _normal) {
    super(GL, _position, _color, _normal);

    // === Bagian 1: Sklera Kuning (Setengah Lingkaran) ===
    const YELLOW = [1.0, 1.0, 0.0];
    const RADIUS = 0.16;
    const SEGMENTS = 16;

    // Pusat sklera
    this.vertices.push(0, 0, 0, ...YELLOW, 0, 0, 1);

    for (let i = 0; i <= SEGMENTS; i++) {
      const angle = Math.PI + (i * Math.PI) / SEGMENTS;
      const x = RADIUS * Math.cos(angle);
      const y = RADIUS * Math.sin(angle);
      this.vertices.push(x, y, 0, ...YELLOW, 0, 0, 1);
    }

    for (let i = 0; i < SEGMENTS; i++) {
      this.faces.push(0, i + 1, i + 2);
    }

    // === Bagian 2: Alis Hitam (Garis Tajam) ===
    const BLACK = [0.0, 0.0, 0.0];
    const WIDTH = 0.17;
    const THICKNESS = 0.02;
    const ANGLE_HEIGHT = 0.04;

    const baseIndex = this.vertices.length / 9;
    const p1 = [-WIDTH, 0, 0.01];
    const p2 = [WIDTH, 0, 0.01];
    const p3 = [WIDTH, THICKNESS + ANGLE_HEIGHT, 0.01];
    const p4 = [-WIDTH, THICKNESS, 0.01];

    this.vertices.push(...p1, ...BLACK, 0, 0, 1);
    this.vertices.push(...p2, ...BLACK, 0, 0, 1);
    this.vertices.push(...p3, ...BLACK, 0, 0, 1);
    this.vertices.push(...p4, ...BLACK, 0, 0, 1);

    this.faces.push(baseIndex, baseIndex + 1, baseIndex + 2);
    this.faces.push(baseIndex, baseIndex + 2, baseIndex + 3);

    // === Bagian 3: Pupil Merah (Lingkaran) ===
    const RED = [1.0, 0.0, 0.0];
    const PUPIL_RADIUS = 0.04;
    const PUPIL_SEGMENTS = 16;

    const pupilBase = this.vertices.length / 9;
    this.vertices.push(0, 0, 0.02, ...RED, 0, 0, 1);

    for (let i = 0; i <= PUPIL_SEGMENTS; i++) {
      const angle = (i * 2 * Math.PI) / PUPIL_SEGMENTS;
      const x = PUPIL_RADIUS * Math.cos(angle);
      const y = PUPIL_RADIUS * Math.sin(angle);
      this.vertices.push(x, y, 0.02, ...RED, 0, 0, 1);
    }

    for (let i = 0; i < PUPIL_SEGMENTS; i++) {
      this.faces.push(pupilBase, pupilBase + i + 1, pupilBase + i + 2);
    }

    this.setup();
  }
}