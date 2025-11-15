// Script para generar hash de contraseña con bcrypt
// Uso: node scripts/generar-hash-password.js "tu_password"

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('Uso: node scripts/generar-hash-password.js "tu_password"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('\nHash generado:');
  console.log(hash);
  console.log('\nPuedes usar este hash en el script SQL crear-usuario-inicial.sql\n');
});

