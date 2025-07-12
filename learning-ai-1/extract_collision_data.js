// Script para extraer datos de colisión del archivo collision.js
// y generar collision_map_data.js con los datos correctos

// Datos extraídos del archivo collision.js
const collisionData = [
  1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608,
  1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 1810, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 177, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608, 7608,
  // ... (continuar con todos los datos del archivo collision.js)
];

// Función para convertir los datos de colisión
function convertCollisionData(data) {
  return data.map(tileId => {
    // Definir qué IDs de tile son colisiones
    const collisionTiles = [1810, 177, 7608, 259, 3792, 3793, 1980, 3049, 1576, 7600, 7717, 7834, 1337, 1685, 1687, 990, 1107, 1454, 1446, 1444, 1563, 1561];
    return collisionTiles.includes(tileId) ? 1 : 0;
  });
}

// Convertir los datos
const convertedData = convertCollisionData(collisionData);

// Generar el archivo collision_map_data.js
const output = `export const collisionMapData = [${convertedData.join(', ')}];`;

console.log(output); 