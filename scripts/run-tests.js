#!/usr/bin/env node

/**
 * Goof World Test Runner
 * 
 * This script orchestrates all game testing via API and Socket.io.
 * Run with: node scripts/run-tests.js [suite]
 * 
 * Available suites:
 * - api: Run API-based tests
 * - socket: Run Socket.io-based tests
 * - all: Run all test suites
 */

const { spawn } = require('child_process');
const path = require('path');

function runScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running: node ${scriptPath} ${args.join(' ')}`);
    
    const child = spawn('node', [scriptPath, ...args], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${scriptPath} completed successfully`);
        resolve();
      } else {
        console.error(`❌ ${scriptPath} failed with code ${code}`);
        reject(new Error(`Script failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error(`❌ Failed to start ${scriptPath}:`, error.message);
      reject(error);
    });
  });
}

async function runApiTests() {
  console.log('\n📡 API Testing Suite');
  console.log('===================');
  
  try {
    await runScript(path.join(__dirname, 'test-game.js'), ['all']);
  } catch (error) {
    console.error('❌ API tests failed:', error.message);
    throw error;
  }
}

async function runSocketTests() {
  console.log('\n🔌 Socket.io Testing Suite');
  console.log('=========================');
  
  try {
    await runScript(path.join(__dirname, 'test-socket.js'), ['all']);
  } catch (error) {
    console.error('❌ Socket.io tests failed:', error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('\n🎮 Complete Goof World Testing Suite');
  console.log('====================================');
  
  try {
    await runApiTests();
    await runSocketTests();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('  ✅ API endpoints working');
    console.log('  ✅ Socket.io connections working');
    console.log('  ✅ Game mechanics validated');
    console.log('  ✅ Multiplayer interactions tested');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Main test runner
async function main() {
  const suite = process.argv[2] || 'all';
  
  console.log('🎮 Goof World Test Runner');
  console.log('========================');
  
  try {
    switch (suite) {
      case 'api':
        await runApiTests();
        break;
      case 'socket':
        await runSocketTests();
        break;
      case 'all':
        await runAllTests();
        break;
      default:
        console.log('Available suites: api, socket, all');
        console.log('Usage: node scripts/run-tests.js [suite]');
        break;
    }
    
  } catch (error) {
    console.error('💥 Test runner failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
main();
