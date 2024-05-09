// Importing jest for mocking functions
import jest from 'jest-mock';

// Mocks for database interactions in rtl_process.js
export const dbMocks = {
  // Mock for client.connect
  connect: jest.fn().mockResolvedValue(),

  // Mock for client.query
  query: jest.fn((queryText, values) => {
    // Simulate different responses based on input query for testing purposes
    if (queryText.includes("SELECT * FROM sensors WHERE")) {
      return Promise.resolve({ rows: [{ pid: 1, sensor_id: '715591', sensor_type: 'LaCrosse-R3', data_validity: 1 }] });
    } else if (queryText.includes("INSERT INTO sensors")) {
      return Promise.resolve({ rows: [{ pid: 2, sensor_id: '715592', sensor_type: 'LaCrosse-BreezePro', data_validity: 1 }] });
    } else if (queryText.includes("INSERT INTO reports")) {
      return Promise.resolve({ rowCount: 1 });
    } else if (queryText.includes("ERROR")) {
      return Promise.reject(new Error("Simulated database error"));
    }
    // Default response for unhandled queries
    return Promise.resolve({ rows: [], rowCount: 0 });
  }),

  // Mock for client.end
  end: jest.fn().mockResolvedValue(),
};

// Documentation on how to use the mocks for testing
/*
  To use these mocks in your tests, import dbMocks from this file and then use jest.mock to redirect the actual database calls to these mocks.
  Example:
  jest.mock('../src/rtl_process.js', () => ({
    client: require('../tests/db_mocks').dbMocks
  }));
*/
