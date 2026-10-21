import { expect, it } from 'vitest';
import { cloudAccountsAvailable, cloudOrigins, resolveCloudEnvironment } from './cloud-config';

it('packaged builds are locked to production whatever the env var says', () => {
  expect(resolveCloudEnvironment({ packaged: true, requested: 'local' }).name).toBe('prod');
});

it('developer builds honour VOICESTUDIO_CLOUD_ENV and default to dev', () => {
  expect(resolveCloudEnvironment({ packaged: false, requested: 'local' }).issuer).toBe(
    'http://127.0.0.1:3000/identity/realms/vssaas',
  );
  expect(resolveCloudEnvironment({ packaged: false }).name).toBe('dev');
  expect(resolveCloudEnvironment({ packaged: false, requested: 'bogus' }).name).toBe('dev');
});

it('uses the open-source public client everywhere', () => {
  for (const requested of ['prod', 'dev', 'local'])
    expect(resolveCloudEnvironment({ packaged: false, requested }).clientId).toBe(
      'voicestudio-desktop-oss',
    );
});

it('lists exactly the origins the app may contact', () => {
  expect([...cloudOrigins(resolveCloudEnvironment({ packaged: true }))].sort()).toEqual([
    'https://appapi.voicestudio.sh',
    'https://voicestudio.sh',
  ]);
});

it('accounts are available in developer builds and hidden in packaged builds without the flag', () => {
  expect(cloudAccountsAvailable(false)).toBe(true);
  expect(cloudAccountsAvailable(true)).toBe(false);
});

it('the development server signs in through the dashboard host (vssaas f9ae9d4)', () => {
  const dev = resolveCloudEnvironment({ packaged: false, requested: 'dev' });
  expect(dev.issuer).toBe('https://dev-app.voicestudio.sh/identity/realms/vssaas');
  expect(dev.signedInPage).toBe('https://dev-app.voicestudio.sh/app/desktop-signed-in');
  expect([...cloudOrigins(dev)].sort()).toEqual([
    'https://dev-app.voicestudio.sh',
    'https://dev-appapi.voicestudio.sh',
  ]);
});
