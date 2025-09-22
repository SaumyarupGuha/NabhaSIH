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
    
    // Actual patient IDs from database
    this.patientIds = [
      '68cc4acae4fc2d7ddaf13fa4',
      '68ccec50249ad6de413eaaf3'
    ];
  }

  async sendHealthData() {
    try {
      const data = this.healthData[this.dataIndex % this.healthData.length];
      const patientId = this.patientIds[Math.floor(Math.random() * this.patientIds.length)];
      
      const payload = {
        ...data,
        patientId,
        timestamp: new Date().toISOString()
      };

      console.log(`Sending health data for patient ${patientId}:`, payload);
      
      const response = await axios.post(`${this.baseUrl}/api/health-data`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('Data sent successfully:', response.data);
      this.dataIndex++;
      
    } catch (error) {
      console.error('Error sending health data:', error.message);
    }
  }

  start() {
    if (this.isRunning) {
      console.log('Simulator is already running');
      return;
    }
    
    console.log(`Starting health data simulator (interval: ${this.interval/1000}s)`);
    this.isRunning = true;
    
    // Send first data immediately
    this.sendHealthData();
    
    // Set interval for subsequent data
    this.intervalId = setInterval(() => {
      this.sendHealthData();
    }, this.interval);
  }

  stop() {
    if (!this.isRunning) {
      console.log('Simulator is not running');
      return;
    }
    
    console.log('Stopping health data simulator');
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
}

// CLI usage
if (require.main === module) {
  const simulator = new HealthDataSimulator();
  
  // Handle command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--fast')) {
    simulator.setInterval(0.1); // 6 seconds for testing
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