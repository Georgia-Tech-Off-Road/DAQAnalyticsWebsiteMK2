module.exports = {
      testEnvironment: 'node',
      coveragePathIgnorePatterns: ['/node_modules/'],
      testMatch: ['**/tests/**/*.test.js'],
      collectCoverageFrom: [
          'routes/**/*.js',
          'middleware/**/*.js',
          '!**/node_modules/**'
      ],
      testPathIgnorePatterns: ['/node_modules/']
    };