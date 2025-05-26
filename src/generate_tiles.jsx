import * as fs from 'fs';
import * as path from 'path';
import FractoTileGenerate from "./fracto/common/tile/FractoTileGenerate.jsx";

const ROOT_DIRECTORY = '/var/www/html';

const LEVEL = process.argv[2]
const naught = LEVEL < 10 ? '0' : ''
const directoryPath = `${ROOT_DIRECTORY}/L${naught}${LEVEL}`

const bounds_from_short_code = (short_code) => {
   let left = -2;
   let right = 2;
   let top = 2;
   let bottom = -2;
   let scope = 4.0;
   for (let i = 0; i < short_code.length; i++) {
      const half_scope = scope / 2;
      const digit = short_code[i];
      switch (digit) {
         case "0":
            right -= half_scope;
            bottom += half_scope;
            break;
         case "1":
            left += half_scope;
            bottom += half_scope;
            break;
         case "2":
            right -= half_scope;
            top -= half_scope;
            break;
         case "3":
            left += half_scope;
            top -= half_scope;
            break;
         default:
            debugger;
      }
      scope = half_scope;
   }
   return {
      left: left,
      right: right,
      top: top,
      bottom: bottom
   }
}

fs.readdir(directoryPath, (err, files) => {
   if (err) {
      console.error('Error reading directory:', err);
      return;
   }
   const filesWithStats = files
      .filter(file => file !== '.' && file !== '..')
      .map(file => {
         const filePath = path.join(directoryPath, file);
         const stats = fs.statSync(filePath);
         return {file, stats};
      });
   console.log(`found a total of ${filesWithStats.length} files`)
   const cutoff_date = new Date('2025-01-31');
   const early_files = filesWithStats
      .filter(f => f.stats.mtimeMs < cutoff_date);
   console.log(`filtered to ${early_files.length} files`)

   const sorted = early_files
      .map(f => {
         const short_code = f.file.replaceAll('.gz', '')
         return {
            short_code,
            bounds: bounds_from_short_code(short_code),
         }
      })
      .sort((a, b) => {
         return a.bounds.left === b.bounds.left ?
            (a.bounds.top > b.bounds.top ? -1 : 1) :
            (a.bounds.left > b.bounds.left ? 1 : -1)
      });

   sorted.forEach(tile => {
      console.log(tile.short_code);
      FractoTileGenerate.begin(tile, true, result => {
         console.log(result)
      });
   })
});