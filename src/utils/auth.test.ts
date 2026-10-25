import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyLoginCredentials, AUTH_CREDENTIALS, AUTH_STORAGE_KEY, clearAuthSession, setAuthSession } from './auth';

test('verifyLoginCredentials validates correct credentials', () => {
  assert.equal(verifyLoginCredentials('Meraya.id', 'Meraya.id'), true);
  // Case-insensitive username check
  assert.equal(verifyLoginCredentials('meraya.id', 'Meraya.id'), true);
  assert.equal(verifyLoginCredentials('MERAYA.ID', 'Meraya.id'), true);
});

test('verifyLoginCredentials rejects invalid credentials', () => {
  assert.equal(verifyLoginCredentials('wrong_id', 'Meraya.id'), false);
  assert.equal(verifyLoginCredentials('Meraya.id', 'wrong_pass'), false);
  assert.equal(verifyLoginCredentials('', ''), false);
  assert.equal(verifyLoginCredentials('admin', '123456'), false);
});

test('clearAuthSession and setAuthSession safely run without error', () => {
  // In node environment without global localStorage, it handles safely
  assert.doesNotThrow(() => {
    setAuthSession('Meraya.id');
    clearAuthSession();
  });
});

