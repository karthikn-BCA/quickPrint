const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { PDFDocument } = require('pdf-lib');
const config = require('./config');

/**
 * Extracts custom page ranges if specified
 */
async function preparePdfForPrinting(sourceFilePath, itemConfig) {
  if (itemConfig.pageSelection !== 'CUSTOM' || !itemConfig.selectedPagesList || itemConfig.selectedPagesList.length === 0) {
    return sourceFilePath;
  }

  const sourceBytes = await fs.promises.readFile(sourceFilePath);
  const srcDoc = await PDFDocument.load(sourceBytes);
  const destDoc = await PDFDocument.create();

  // 1-based to 0-based conversion
  const zeroBasedPages = itemConfig.selectedPagesList
    .map((p) => p - 1)
    .filter((idx) => idx >= 0 && idx < srcDoc.getPageCount());

  const copied = await destDoc.copyPages(srcDoc, zeroBasedPages);
  copied.forEach((p) => destDoc.addPage(p));

  const destBytes = await destDoc.save();
  const slicedPath = path.join(
    path.dirname(sourceFilePath),
    `sliced_${path.basename(sourceFilePath)}`
  );
  await fs.promises.writeFile(slicedPath, destBytes);
  return slicedPath;
}

/**
 * Sends a prepared document to the Windows printer or runs realistic simulation
 */
async function printDocument(filePath, itemConfig) {
  const isSimulated = config.SIMULATION_MODE;

  console.log(`\n==================================================`);
  console.log(`🖨️  [Print Job] File: ${itemConfig.originalName}`);
  console.log(`📄 Mode: ${itemConfig.printType === 'COLOUR' ? 'COLOR' : 'BLACK & WHITE'}`);
  console.log(`📑 Duplex: ${itemConfig.printSides === 'DOUBLE' ? 'DOUBLE-SIDED' : 'SINGLE-SIDED'}`);
  console.log(`📋 Copies: ${itemConfig.copies}`);
  console.log(`📐 Pages: ${itemConfig.selectedPagesList ? itemConfig.selectedPagesList.length : 'ALL'}`);
  console.log(`🎯 Target Printer: ${config.PRINTER_NAME}`);
  console.log(`🧪 Mode: ${isSimulated ? 'HARDWARE SIMULATION' : 'PHYSICAL HARDWARE'}`);
  console.log(`==================================================\n`);

  if (isSimulated) {
    // Realistic simulation: simulate printer mechanical spooling and output time
    const simulatedPrintDelayMs = Math.min(3000, 1000 + (itemConfig.copies * 500));
    await new Promise((resolve) => setTimeout(resolve, simulatedPrintDelayMs));
    console.log(`✅ [Simulation] Successfully printed ${itemConfig.copies} copies of "${itemConfig.originalName}".`);
    return { success: true, simulated: true };
  }

  // Windows Physical Printing via PowerShell spooler command
  return new Promise((resolve, reject) => {
    const printerArg = config.PRINTER_NAME ? `"${config.PRINTER_NAME}"` : '""';
    const escapedFilePath = filePath.replace(/"/g, '`"');

    // Windows shell print command
    const psCommand = `Start-Process -FilePath "${escapedFilePath}" -Verb PrintTo -ArgumentList ${printerArg} -PassThru | Out-Null`;

    exec(`powershell.exe -NoProfile -Command "${psCommand}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Printer Hardware Error]:`, stderr || error.message);
        return reject(new Error(`Physical printer dispatch failed: ${error.message}`));
      }
      console.log(`[Printer Spooler] Dispatched to Windows Print Spooler.`);
      resolve({ success: true, simulated: false });
    });
  });
}

module.exports = {
  preparePdfForPrinting,
  printDocument,
};
