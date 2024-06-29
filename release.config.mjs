/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [{ name: 'lts', prerelease: false }, { name: 'main', prerelease: 'beta' }],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    ['@semantic-release/exec', { prepareCmd: 'npx json -I -f manifest.json -e \'this.version="${nextRelease.version}"\'' }],
    ['@semantic-release/github', { assets: ['main.js', 'manifest.json', 'styles.css'] }],
  ],
  tagFormat: '${version}',
}
