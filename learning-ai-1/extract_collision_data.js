// Script para extraer el layer 'Colisiones' del archivo collision.js y generar collision_map_data.js
const fs = require('fs');

// Leer el archivo collision.js como texto
const collisionText = fs.readFileSync('collision.js', 'utf8');

// Extraer el objeto de datos del mapa
const dataMatch = collisionText.match(/\((?:"collision"|\'collision\'),\s*({[\s\S]*})\);?\s*\)?/);
if (!dataMatch) {
  throw new Error('No se pudo encontrar el objeto de datos en collision.js');
}
const mapData = JSON.parse(dataMatch[1]);

// Buscar el layer llamado 'Colisiones' (insensible a mayúsculas)
const layer = mapData.layers.find(l => l.name.toLowerCase() === 'colisiones');
if (!layer) {
  throw new Error('No se encontró el layer "Colisiones" en collision.js');
}

// Guardar el array de datos en collision_map_data.js
const output = `export const collisionMapData = ${JSON.stringify(layer.data)};\n`;
fs.writeFileSync('collision_map_data.js', output);
console.log('collision_map_data.js generado correctamente.');
//console.log(window.collisionMapData.length); 