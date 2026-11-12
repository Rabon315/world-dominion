const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync(__dirname+'/../www/js/countries.js','utf8')+';({COUNTRY_NAMES,FLAG_CHOICES})';
const {COUNTRY_NAMES,FLAG_CHOICES}=vm.runInNewContext(code);
assert(COUNTRY_NAMES.length>=190,'country catalogue should cover the world');
assert(new Set(COUNTRY_NAMES).size===COUNTRY_NAMES.length,'country names should be unique');
assert(FLAG_CHOICES.length>=20,'flag picker should provide multiple flag choices');
assert(COUNTRY_NAMES.includes('ایران')&&COUNTRY_NAMES.includes('ایالات متحده آمریکا')&&COUNTRY_NAMES.includes('ژاپن'));
console.log('PASS: '+COUNTRY_NAMES.length+' selectable countries and '+FLAG_CHOICES.length+' flag choices');
