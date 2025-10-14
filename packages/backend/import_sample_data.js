const mysql = require('mysql2/promise');
require('dotenv').config();

async function importSampleData() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smart_school_bus',
      multipleStatements: true
    });

    console.log('✅ Connected to database successfully');

    // Check if data already exists
    const [existing] = await connection.execute('SELECT COUNT(*) as count FROM students');
    
    if (existing[0].count > 0) {
      console.log(`📊 Database already has ${existing[0].count} students`);
      console.log('🔄 Cleaning and re-importing data...');
    }

    // Read sample data file
    const fs = require('fs');
    const path = require('path');
    const sampleDataPath = path.join(__dirname, '../database/sample_data.sql');
    
    if (!fs.existsSync(sampleDataPath)) {
      throw new Error(`Sample data file not found: ${sampleDataPath}`);
    }

    const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
    
    // Execute the SQL
    console.log('📥 Importing sample data...');
    await connection.query(sampleData);
    
    // Verify import
    const [students] = await connection.execute('SELECT COUNT(*) as count FROM students');
    const [parents] = await connection.execute('SELECT COUNT(*) as count FROM parents');
    const [schedules] = await connection.execute('SELECT COUNT(*) as count FROM schedules');
    
    console.log('✅ Sample data imported successfully!');
    console.log(`📊 Statistics:`);
    console.log(`   - Students: ${students[0].count}`);
    console.log(`   - Parents: ${parents[0].count}`);
    console.log(`   - Schedules: ${schedules[0].count}`);
    
    // Test a specific query for parent dashboard
    const [parentData] = await connection.execute(`
      SELECT s.*, p.parent_type, p.occupation 
      FROM students s 
      JOIN student_parents sp ON s.id = sp.student_id 
      JOIN parents p ON sp.parent_id = p.id 
      LIMIT 1
    `);
    
    if (parentData.length > 0) {
      console.log('👨‍👩‍👧‍👦 Parent dashboard data preview:');
      console.log(`   - Student: ${parentData[0].name}`);
      console.log(`   - Parent: ${parentData[0].parent_type} (${parentData[0].occupation})`);
    }

  } catch (error) {
    console.error('❌ Error importing sample data:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the import
importSampleData();