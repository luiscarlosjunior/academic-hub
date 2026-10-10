// Style Dictionary (v4): lê os tokens e gera CSS e Swift a partir da mesma fonte.
// Uso: npm i style-dictionary && node style-dictionary.config.mjs
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  source: ['tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'dist/css/',
      files: [{ destination: 'variables.css', format: 'css/variables' }]
    },
    ios: {
      transformGroup: 'ios-swift',
      buildPath: 'dist/ios/',
      files: [{ destination: 'Tokens.swift', format: 'ios-swift/class.swift', className: 'Tokens' }]
    }
  }
});

await sd.buildAllPlatforms();
console.log('Tokens gerados em dist/');
