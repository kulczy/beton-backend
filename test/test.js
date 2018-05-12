/* eslint no-undef: 0 */
const request = require('supertest');
const app = require('../app/app');

describe('Test the root path', () => {
  test('It should response the GET method', async () => {
    const response = await request(app).get('/v1/api');
    expect(response.statusCode).toBe(200);
  });
});
