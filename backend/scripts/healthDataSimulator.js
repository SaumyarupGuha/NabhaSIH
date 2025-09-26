const axios = require('axios');
const fs = require('fs');
const path = require('path');

class HealthDataSimulator {
  constructor(baseUrl = 'https://nabhasih-1.onrender.com', intervalMinutes = 1) {
    this.baseUrl = baseUrl;
    this.interval = intervalMinutes * 60 * 1000; // Convert to milliseconds
    this.dataIndex = 0;
    this.isRunning = false;
    this.intervalId = null;
    
    // Load sample data
    const dataPath = path.join(__dirname, '../data/sample-health-data.json');
    this.healthData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Will be populated from database
    this.patientIds = [];
    this.loadPatientIds();
  }

  async loadPatientIds() {
    try {
      console.log(`🔗 Loading patient IDs from: ${this.baseUrl}/api/users?role=patient`);
      const response = await axios.get(`${this.baseUrl}/api/users?role=patient`);
      if (response.data.success && response.data.data.length > 0) {
        this.patientIds = response.data.data.map(patient => patient._id);
        console.log(`📋 Loaded ${this.patientIds.length} patient IDs:`, this.patientIds);
      } else {
        console.log('⚠️ No patients found in database');
      }
    } catch (error) {
      console.error('❌ Error loading patient IDs:', error.message);
      // Fallback to hardcoded IDs
      this.patientIds = ['68cc4acae4fc2d7ddaf13fa4', '68ccec50249ad6de413eaaf3'];
    }
  }

  async sendHealthData() {

    
    try {
      if (this.patientIds.length === 0) {
        console.log('⚠️ No patient IDs available, reloading...');
        await this.loadPatientIds();
        if (this.patientIds.length === 0) {
          console.log('❌ Still no patient IDs, skipping this cycle');
          return;
        }
      }

      // Cycle through data continuously
      const data = this.healthData[this.dataIndex % this.healthData.length];
      const patientId = this.patientIds[Math.floor(Math.random() * this.patientIds.length)];
      
      const payload = {
        ...data,
        patientId,
        timestamp: new Date().toISOString()
      };

      console.log(`🩺 Sending health data for patient ${patientId}:`, {
        heartRate: payload.heartRate,
        temperature: payload.temperature,
        oxygenSaturation: payload.oxygenSaturation
      });
      
      const response = await axios.post(`${this.baseUrl}/api/health-data`, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000 // 15 second timeout
      });
      
      console.log('✅ Data sent successfully. Alerts created:', response.data.alertsCreated);
      this.dataIndex++;
      
    } catch (error) {
      console.error('❌ Error sending health data:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      // Always move to next data point after error
      this.dataIndex++;
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('Simulator is already running');
      return;
    }
    
    console.log(`🚀 Starting health data simulator (interval: ${this.interval/1000}s)`);
    
    // Load patient IDs first
    await this.loadPatientIds();
    
    this.isRunning = true;
    
    // Send first data immediately
    await this.sendHealthData();
    
    // Set interval for subsequent data
    this.intervalId = setInterval(async () => {
      await this.sendHealthData();
    }, this.interval);
  }

  stop() {
    if (!this.isRunning) {
      console.log('Simulator is not running');
      return;
    }
    
    console.log('🛑 Stopping health data simulator');
    console.log(`📊 Summary: Processed ${this.dataIndex} data points`);
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setInterval(minutes) {
    this.interval = minutes * 60 * 1000;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }
  
  reset() {
    this.dataIndex = 0;
    console.log('🔄 Simulator reset');
  }
}

// CLI usage
if (require.main === module) {
  const simulator = new HealthDataSimulator();
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--fast')) {
    simulator.setInterval(0.167); // 10 second interval (10/60 minutes)
  }
  
  simulator.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down simulator...');
    simulator.stop();
    process.exit(0);
  });
}

module.exports = HealthDataSimulator;