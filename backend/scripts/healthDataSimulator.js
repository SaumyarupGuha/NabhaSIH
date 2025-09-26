const axios = require('axios');
const fs = require('fs');
const path = require('path');

class HealthDataSimulator {
  constructor(baseUrl = 'http://localhost:5000', intervalMinutes = 1) {
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
      const response = await axios.get(`${this.baseUrl}/api/users?role=patient`);
      if (response.data.success && response.data.data.length > 0) {
        this.patientIds = response.data.data.map(patient => patient._id);
        console.log(`📋 Loaded ${this.patientIds.length} patient IDs`);
      } else {
        console.log('⚠️ No patients found, using fallback IDs');
        this.patientIds = ['68cc4acae4fc2d7ddaf13fa4', '68ccec50249ad6de413eaaf3'];
      }
    } catch (error) {
      console.log('⚠️ Using fallback patient IDs');
      this.patientIds = ['68cc4acae4fc2d7ddaf13fa4', '68ccec50249ad6de413eaaf3'];
    }
  }

  async sendHealthData() {

    
    try {
      if (this.patientIds.length === 0) {
        await this.loadPatientIds();
        if (this.patientIds.length === 0) {
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
      if (error.code === 'ECONNREFUSED') {
        console.log('⚠️ Server not ready, retrying in 5 seconds...');
      } else {
        console.error('❌ Error sending health data:', error.message);
        if (error.response) {
          console.error('Response data:', error.response.data);
        }
      }
      this.dataIndex++;
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('Simulator is already running');
      return;
    }
    
    console.log(`🚀 Starting health data simulator (interval: ${this.interval/1000}s)`);
    console.log('⏳ Waiting 3 seconds for server to start...');
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Load patient IDs first
    await this.loadPatientIds();
    
    this.isRunning = true;
    
    // Send first data after delay
    setTimeout(async () => {
      await this.sendHealthData();
    }, 2000);
    
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