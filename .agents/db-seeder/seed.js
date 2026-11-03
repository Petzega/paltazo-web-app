#!/usr/bin/env node
/**
 * db-seeder — Script de inserción de datos aleatorios de prueba para Paltazo
 * Uso: node seed.js [email] [diasAtras]
 * Por defecto: email = peter@gmail.com, diasAtras = 6 (hoy + 6 días atrás = 7 días)
 */

const { execSync } = require('child_process');

const EMAIL = process.argv[2] || 'peter@gmail.com';
const DAYS_BACK = parseInt(process.argv[3] || '6', 10);
const CONTAINER = 'supabase_db_paltazo-web-app';

function runPsql(sql) {
  try {
    return execSync(
      `docker exec -i ${CONTAINER} psql -U postgres -d postgres -t -A -F "|" -c "${sql.replace(/"/g, '\\"')}"`,
      { encoding: 'utf8' }
    ).trim();
  } catch (error) {
    console.error('Error ejecutando SQL:', error.message);
    process.exit(1);
  }
}

function runPsqlScript(fullSql) {
  try {
    return execSync(
      `docker exec -i ${CONTAINER} psql -U postgres -d postgres`,
      { input: fullSql, encoding: 'utf8' }
    ).trim();
  } catch (error) {
    console.error('Error insertando lote SQL:', error.message);
    process.exit(1);
  }
}

function formatLocalDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomAmount(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const DESCRIPTIONS = {
  expense: {
    Comida: ['Almuerzo menú', 'Supermercado semanal', 'Café y postre', 'Cena delivery', 'Panadería', 'Snack', 'Frutas y verduras', 'Desayuno café'],
    Transporte: ['Viaje Uber', 'Recarga tarjeta transporte', 'Gasolina / Combustible', 'Estacionamiento', 'Pasaje bus', 'Taxi express'],
    Servicios: ['Recibo de luz', 'Servicio de agua', 'Internet hogar', 'Suscripción streaming', 'Plan telefonía móvil'],
    Entretenimiento: ['Entradas al cine', 'Juegos digitales', 'Salida fin de semana', 'Cena con amigos', 'Libro / Revista'],
    Otros: ['Farmacia medicamentos', 'Artículos de limpieza', 'Ferretería accesorios', 'Regalo sorpresa', 'Lavandería']
  },
  income: {
    Sueldo: ['Pago de quincena', 'Abono de sueldo', 'Honorarios mensuales'],
    Freelance: ['Desarrollo web cliente', 'Consultoría técnica', 'Diseño de interfaz', 'Mantenimiento sistema'],
    Devolución: ['Reembolso de compra', 'Devolución préstamo', 'Cashback bancario'],
    Venta: ['Venta producto usado', 'Venta equipo tecnología', 'Venta artículos varios'],
    Otros: ['Ingreso extraordinario', 'Transferencia recibida', 'Premio / Bonificación']
  }
};

console.log(`====================================================`);
console.log(` [db-seeder] Generando datos de prueba para: ${EMAIL}`);
console.log(`====================================================`);

// 1. Obtener user_id
const userOutput = runPsql(`SELECT id FROM auth.users WHERE email = '${EMAIL}' LIMIT 1;`);
if (!userOutput) {
  console.error(`❌ Error: No se encontró al usuario con email "${EMAIL}" en auth.users.`);
  process.exit(1);
}
const userId = userOutput.split('\n')[0].trim();
console.log(`✔ Usuario identificado: ID = ${userId}`);

// 2. Obtener monedas configuradas (desde budgets, o fallback a profiles)
let currenciesOutput = runPsql(`SELECT DISTINCT currency FROM budgets WHERE user_id = '${userId}';`);
let currencies = currenciesOutput ? currenciesOutput.split('\n').map(c => c.trim()).filter(Boolean) : [];

if (currencies.length === 0) {
  const profileCurrency = runPsql(`SELECT COALESCE(primary_currency, currency, 'S/') FROM profiles WHERE id = '${userId}';`);
  currencies = [profileCurrency.split('\n')[0].trim() || 'S/'];
}
console.log(`✔ Monedas activas detectadas: ${currencies.join(', ')}`);

// 3. Obtener categorías de gastos
const expCatOutput = runPsql(`SELECT id, name FROM categories WHERE user_id = '${userId}';`);
if (!expCatOutput) {
  console.error(`❌ Error: El usuario no tiene categorías de gastos creadas.`);
  process.exit(1);
}
const expenseCategories = expCatOutput.split('\n').filter(Boolean).map(line => {
  const [id, name] = line.split('|');
  return { id: id.trim(), name: name.trim() };
});
console.log(`✔ Categorías de gastos: ${expenseCategories.map(c => c.name).join(', ')}`);

// 4. Obtener categorías de ingresos
const incCatOutput = runPsql(`SELECT id, name FROM income_categories WHERE user_id = '${userId}';`);
let incomeCategories = [];
if (incCatOutput) {
  incomeCategories = incCatOutput.split('\n').filter(Boolean).map(line => {
    const [id, name] = line.split('|');
    return { id: id.trim(), name: name.trim() };
  });
  console.log(`✔ Categorías de ingresos: ${incomeCategories.map(c => c.name).join(', ')}`);
}

// 5. Generar transacciones por fecha (usando hora local del sistema)
let sqlStatements = ['BEGIN;'];

// Limpiar gastos e ingresos previos del usuario antes de re-sembrar
sqlStatements.push(`DELETE FROM public.expenses WHERE user_id = '${userId}';`);
sqlStatements.push(`DELETE FROM public.incomes WHERE user_id = '${userId}';`);

let totalExpenses = 0;
let totalIncomes = 0;
const summaryByDate = [];

const today = new Date();

for (let d = DAYS_BACK; d >= 0; d--) {
  const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - d);
  const dateStr = formatLocalDate(targetDate);

  // Entre 1 y 15 registros por día
  const recordCount = getRandomInt(1, 15);
  let dayExpenses = 0;
  let dayIncomes = 0;

  for (let r = 0; r < recordCount; r++) {
    const currency = pickRandom(currencies);
    const isIncome = incomeCategories.length > 0 && Math.random() < 0.22; // ~22% ingresos, ~78% gastos

    if (isIncome) {
      const cat = pickRandom(incomeCategories);
      const descList = DESCRIPTIONS.income[cat.name] || DESCRIPTIONS.income.Otros;
      const desc = pickRandom(descList);
      
      let amount;
      if (currency === 'S/') {
        amount = cat.name === 'Sueldo' ? getRandomAmount(1200, 2800) : getRandomAmount(60, 450);
      } else if (currency === '$') {
        amount = cat.name === 'Sueldo' ? getRandomAmount(400, 900) : getRandomAmount(20, 150);
      } else {
        amount = getRandomAmount(25, 200);
      }

      sqlStatements.push(
        `INSERT INTO public.incomes (user_id, category_id, amount, currency, description, date, created_at, updated_at) ` +
        `VALUES ('${userId}', '${cat.id}', ${amount}, '${currency}', '${desc}', '${dateStr}', '${dateStr} 12:00:00+00', '${dateStr} 12:00:00+00');`
      );
      dayIncomes++;
      totalIncomes++;
    } else {
      const cat = pickRandom(expenseCategories);
      const descList = DESCRIPTIONS.expense[cat.name] || DESCRIPTIONS.expense.Otros;
      const desc = pickRandom(descList);

      let amount;
      if (currency === 'S/') {
        if (cat.name === 'Comida') amount = getRandomAmount(12, 65);
        else if (cat.name === 'Transporte') amount = getRandomAmount(6, 35);
        else if (cat.name === 'Servicios') amount = getRandomAmount(30, 110);
        else amount = getRandomAmount(10, 85);
      } else if (currency === '$') {
        if (cat.name === 'Comida') amount = getRandomAmount(4, 22);
        else if (cat.name === 'Transporte') amount = getRandomAmount(2, 12);
        else if (cat.name === 'Servicios') amount = getRandomAmount(10, 40);
        else amount = getRandomAmount(3, 30);
      } else {
        amount = getRandomAmount(5, 40);
      }

      sqlStatements.push(
        `INSERT INTO public.expenses (user_id, category_id, amount, currency, description, date, created_at, synced_at) ` +
        `VALUES ('${userId}', '${cat.id}', ${amount}, '${currency}', '${desc}', '${dateStr}', '${dateStr} 12:00:00+00', '${dateStr} 12:00:00+00');`
      );
      dayExpenses++;
      totalExpenses++;
    }
  }

  summaryByDate.push({ date: dateStr, count: recordCount, expenses: dayExpenses, incomes: dayIncomes });
}

sqlStatements.push('COMMIT;');

console.log(`\n⏳ Insertando registros en base de datos...`);
runPsqlScript(sqlStatements.join('\n'));

console.log(`\n📊 Resumen de inserción diaria (${DAYS_BACK + 1} días):`);
summaryByDate.forEach(item => {
  console.log(`  - ${item.date}: ${item.count} registros (${item.expenses} gastos, ${item.incomes} ingresos)`);
});

console.log(`\n✅ [db-seeder] Inserción completada con éxito:`);
console.log(`   Total gastos insertados:   ${totalExpenses}`);
console.log(`   Total ingresos insertados: ${totalIncomes}`);
console.log(`   Total general:             ${totalExpenses + totalIncomes} registros.`);
