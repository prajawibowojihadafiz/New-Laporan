import test from 'node:test';
import assert from 'node:assert/strict';
import {
  verifyPin,
  APP_PIN,
  APP_ID,
  APP_PASS,
  verifyTripleCredentials,
  verifyLoginCredentials,
  AUTH_CREDENTIALS,
  clearAuthSession,
  setAuthSession,
} from './auth';

test('verifyTripleCredentials validates 3-layer credentials (ID, Password, PIN)', () => {
  assert.equal(APP_ID, 'Meraya.id');
  assert.equal(APP_PASS, 'Meraya.id');
  assert.equal(APP_PIN, '2901');

  // Exact credentials
  assert.equal(verifyTripleCredentials('Meraya.id', 'Meraya.id', '2901'), true);
  // Case-insensitive ID check
  assert.equal(verifyTripleCredentials('meraya.id', 'Meraya.id', '2901'), true);
  assert.equal(verifyTripleCredentials('MERAYA.ID', 'Meraya.id', '2901'), true);

  // Wrong ID
  assert.equal(verifyTripleCredentials('wrong', 'Meraya.id', '2901'), false);
  // Wrong Password
  assert.equal(verifyTripleCredentials('Meraya.id', 'wrong', '2901'), false);
  // Wrong PIN
  assert.equal(verifyTripleCredentials('Meraya.id', 'Meraya.id', '0000'), false);
  // Empty
  assert.equal(verifyTripleCredentials('', '', ''), false);
});

test('verifyPin validates 4-digit PIN 2901 correctly', () => {
  assert.equal(APP_PIN, '2901');
  assert.equal(verifyPin('2901'), true);
  assert.equal(verifyPin(' 2901 '), true);
  assert.equal(verifyPin('0000'), false);
  assert.equal(verifyPin('1234'), false);
  assert.equal(verifyPin(''), false);
});

test('verifyLoginCredentials validates backward compatible credentials', () => {
  assert.equal(verifyLoginCredentials('Meraya.id', 'Meraya.id'), true);
  assert.equal(verifyLoginCredentials('meraya.id', 'Meraya.id'), true);
  assert.equal(verifyLoginCredentials('Meraya.id', 'Meraya.id', '2901'), true);
});

test('clearAuthSession and setAuthSession safely run without error', () => {
  assert.doesNotThrow(() => {
    setAuthSession('Meraya.id');
    clearAuthSession();
  });
});
