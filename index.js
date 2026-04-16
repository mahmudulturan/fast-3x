#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const prompts = require('prompts');
const chalk = require('chalk');
const ora = require('ora');
const { glob } = require('glob');

/**
 * Scan directory for image files
 * @param {string} directory - Directory to scan
 * @param {boolean} recursive - Whether to scan recursively
 * @returns {Promise<Object>} Object with categorized image files
 */
async function scanImages(directory, recursive = true) {
  const patterns = recursive ? [
    '**/*.svg',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.webp'
  ] : [
    '*.svg',
    '*.png',
    '*.jpg',
    '*.jpeg',
    '*.webp'
  ];

  const files = {
    svg: [],
    png: [],
    jpg: [],
    webp: []
  };

  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: directory,
      nodir: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**', '**/*@2x*', '**/*@3x*']
    });

    matches.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.svg') {
        files.svg.push(file);
      } else if (ext === '.png') {
        files.png.push(file);
      } else if (ext === '.jpg' || ext === '.jpeg') {
        files.jpg.push(file);
      } else if (ext === '.webp') {
        files.webp.push(file);
      }
    });
  }

  return files;
}

/**
 * Resize PNG or JPG image
 * @param {string} inputPath - Input file path
 * @param {string} outputPath - Output file path
 * @param {number} width - Target width
 * @param {number} height - Target height (optional)
 */
async function resizeRasterImage(inputPath, outputPath, width, height = null) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Calculate height maintaining aspect ratio if not provided
  if (!height && metadata.width && metadata.height) {
    height = Math.round((width / metadata.width) * metadata.height);
  }

  await image
    .resize(width, height, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toFile(outputPath);
}

/**
 * Process SVG file by converting to specified format at different scales
 * @param {string} inputPath - Input SVG file path
 * @param {string} outputDir - Output directory
 * @param {string} baseName - Base filename without extension
 * @param {number} baseWidth - Base width in pixels
 * @param {number} baseHeight - Base height in pixels
 * @param {string} workingDir - Working directory
 * @param {string} format - Output format (webp, png, jpg)
 */
async function processSVG(inputPath, outputDir, baseName, baseWidth, baseHeight, workingDir, format = 'png') {
  const fullInputPath = path.join(workingDir, inputPath);
  const scales = [
    { suffix: '', scale: 1 },
    { suffix: '@2x', scale: 2 },
    { suffix: '@3x', scale: 3 }
  ];

  const ext = format === 'jpg' ? '.jpg' : `.${format}`;

  for (const { suffix, scale } of scales) {
    const width = baseWidth * scale;
    const height = baseHeight * scale;
    const outputFileName = `${baseName}${suffix}${ext}`;
    const outputPath = path.join(workingDir, outputDir, outputFileName);

    const image = sharp(fullInputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      });

    if (format === 'webp') {
      await image.webp({ quality: 90 }).toFile(outputPath);
    } else if (format === 'png') {
      await image.png().toFile(outputPath);
    } else if (format === 'jpg') {
      await image.jpeg({ quality: 90 }).toFile(outputPath);
    }
  }
}

/**
 * Process PNG, JPG, or WebP file at different scales
 * @param {string} inputPath - Input file path
 * @param {string} outputDir - Output directory
 * @param {string} baseName - Base filename without extension
 * @param {string} originalExt - Original file extension
 * @param {number} baseWidth - Base width in pixels
 * @param {number} baseHeight - Base height in pixels
 * @param {string} workingDir - Working directory
 * @param {string} format - Output format (webp, png, jpg, or 'original')
 */
async function processRasterImage(inputPath, outputDir, baseName, originalExt, baseWidth, baseHeight, workingDir, format = 'original') {
  const fullInputPath = path.join(workingDir, inputPath);

  const scales = [
    { suffix: '', scale: 1 },
    { suffix: '@2x', scale: 2 },
    { suffix: '@3x', scale: 3 }
  ];

  // Determine output extension
  let outputExt;
  if (format === 'original') {
    outputExt = originalExt;
  } else if (format === 'jpg') {
    outputExt = '.jpg';
  } else {
    outputExt = `.${format}`;
  }

  for (const { suffix, scale } of scales) {
    const width = baseWidth * scale;
    const height = baseHeight * scale;

    const outputFileName = `${baseName}${suffix}${outputExt}`;
    const outputPath = path.join(workingDir, outputDir, outputFileName);

    const resizedImage = sharp(fullInputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      });

    if (format === 'webp') {
      await resizedImage.webp({ quality: 90 }).toFile(outputPath);
    } else if (format === 'png') {
      await resizedImage.png().toFile(outputPath);
    } else if (format === 'jpg') {
      await resizedImage.jpeg({ quality: 90 }).toFile(outputPath);
    } else {
      // Keep original format
      await resizedImage.toFile(outputPath);
    }
  }
}

/**
 * Display welcome message with ASCII logo
 */
function displayWelcome() {
  console.clear();
  console.log(chalk.cyan.bold(`
  ███████╗ █████╗ ███████╗████████╗    ██████╗ ██╗  ██╗
  ██╔════╝██╔══██╗██╔════╝╚══██╔══╝    ╚════██╗╚██╗██╔╝
  █████╗  ███████║███████╗   ██║        █████╔╝ ╚███╔╝ 
  ██╔══╝  ██╔══██║╚════██║   ██║        ╚═══██╗ ██╔██╗ 
  ██║     ██║  ██║███████║   ██║       ██████╔╝██╔╝ ██╗
  ╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝       ╚═════╝ ╚═╝  ╚═╝
  `));
  
  console.log(chalk.white.bold('  Generate 1x, 2x, 3x image versions for retina displays\n'));
  console.log(chalk.gray('  Perfect for web, mobile apps, and responsive design'));
  console.log(chalk.gray('  Supports SVG, PNG, JPG, WebP → WebP, PNG, JPG\n'));
}

/**
 * Main function
 */
async function main() {
  displayWelcome();

  const workingDir = process.cwd();
  console.log(chalk.gray(`  📁 Working directory: ${workingDir}\n`));

  // Ask for scan mode
  const { scanMode } = await prompts({
    type: 'select',
    name: 'scanMode',
    message: '  🔍 How should I scan for images?',
    choices: [
      { title: 'Recursively (current + all subdirectories)', value: 'recursive' },
      { title: 'Current directory only', value: 'current' }
    ],
    initial: 0
  });

  if (!scanMode) {
    console.log(chalk.yellow('\n  ❌ Operation cancelled.\n'));
    return;
  }

  const recursive = scanMode === 'recursive';
  const scanModeText = recursive ? 'recursively' : 'current directory only';
  console.log(chalk.gray(`  📂 Scanning: ${scanModeText}\n`));

  const spinner = ora({
    text: 'Scanning',
    spinner: 'dots'
  }).start();

  try {
    const files = await scanImages(workingDir, recursive);
    const totalFiles = files.svg.length + files.png.length + files.jpg.length + files.webp.length;

    spinner.succeed(chalk.green('Scanning complete'));
    console.log();

    if (totalFiles === 0) {
      const location = recursive ? 'this directory and subdirectories' : 'this directory';
      console.log(chalk.yellow(`  ⚠️  No image files found in ${location}.`));
      console.log(chalk.gray('  Tip: Make sure you have SVG, PNG, JPG, or WebP files in the target location.\n'));
      return;
    }

    // Display found files
    console.log(chalk.green.bold('  📊 Found Images:\n'));
    if (files.svg.length > 0) {
      console.log(chalk.cyan(`     • ${files.svg.length} SVG file(s)`));
    }
    if (files.png.length > 0) {
      console.log(chalk.cyan(`     • ${files.png.length} PNG file(s)`));
    }
    if (files.jpg.length > 0) {
      console.log(chalk.cyan(`     • ${files.jpg.length} JPG file(s)`));
    }
    if (files.webp.length > 0) {
      console.log(chalk.cyan(`     • ${files.webp.length} WebP file(s)`));
    }
    console.log(chalk.white.bold(`\n     Total: ${totalFiles} file(s)\n`));

    // Ask for confirmation
    const { confirm } = await prompts({
      type: 'select',
      name: 'confirm',
      message: '  🚀 Start resizing them?',
      choices: [
        { title: 'Yes, start resizing', value: true },
        { title: 'No, cancel operation', value: false }
      ],
      initial: 0
    });

    if (!confirm) {
      console.log(chalk.yellow('\n  ❌ Operation cancelled.\n'));
      return;
    }

    console.log();

    // Ask for base width
    const { baseWidth } = await prompts({
      type: 'number',
      name: 'baseWidth',
      message: '  📏 Base width (1x) in pixels?',
      initial: 400,
      validate: value => {
        if (value === null || value === undefined) {
          return 'Please enter a positive number';
        }
        return value > 0 ? true : 'Please enter a positive number';
      }
    });

    const finalBaseWidth = baseWidth || 400;

    // Ask for base height
    const { baseHeight } = await prompts({
      type: 'number',
      name: 'baseHeight',
      message: '  📏 Base height (1x) in pixels?',
      initial: 300,
      validate: value => {
        if (value === null || value === undefined) {
          return 'Please enter a positive number';
        }
        return value > 0 ? true : 'Please enter a positive number';
      }
    });

    const finalBaseHeight = baseHeight || 300;

    if (finalBaseWidth <= 0 || finalBaseHeight <= 0) {
      console.log(chalk.yellow('\n  ❌ Invalid dimensions. Operation cancelled.\n'));
      return;
    }

    // Ask for output format
    const { outputFormat } = await prompts({
      type: 'select',
      name: 'outputFormat',
      message: '  🎨 Output format?',
      choices: [
        { title: 'WebP (recommended for web)', value: 'webp' },
        { title: 'PNG (lossless)', value: 'png' },
        { title: 'JPG (lossy)', value: 'jpg' },
        { title: 'Keep original format', value: 'original' }
      ],
      initial: 0
    });

    if (!outputFormat) {
      console.log(chalk.yellow('\n  ❌ Operation cancelled.\n'));
      return;
    }

    // Ask for output directory
    const { outputDir } = await prompts({
      type: 'text',
      name: 'outputDir',
      message: '  📂 Output directory name?',
      initial: 'resized'
    });

    if (!outputDir) {
      console.log(chalk.yellow('\n  ❌ Operation cancelled.\n'));
      return;
    }

    // Create output directory
    const outputPath = path.join(workingDir, outputDir);
    await fs.mkdir(outputPath, { recursive: true });

    console.log();
    console.log(chalk.blue.bold(`  📁 Output: ${outputPath}\n`));

    // Process files
    const processingSpinner = ora({
      text: 'Processing images',
      spinner: 'dots'
    }).start();
    let processed = 0;

    try {
      // Process SVG files
      for (const file of files.svg) {
        const baseName = path.basename(file, '.svg');
        const format = outputFormat === 'original' ? 'png' : outputFormat;
        await processSVG(file, outputDir, baseName, finalBaseWidth, finalBaseHeight, workingDir, format);
        processed++;
        processingSpinner.text = `Processing images (${processed}/${totalFiles})`;
      }

      // Process PNG files
      for (const file of files.png) {
        const baseName = path.basename(file, '.png');
        await processRasterImage(file, outputDir, baseName, '.png', finalBaseWidth, finalBaseHeight, workingDir, outputFormat);
        processed++;
        processingSpinner.text = `Processing images (${processed}/${totalFiles})`;
      }

      // Process JPG files
      for (const file of files.jpg) {
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        await processRasterImage(file, outputDir, baseName, ext, finalBaseWidth, finalBaseHeight, workingDir, outputFormat);
        processed++;
        processingSpinner.text = `Processing images (${processed}/${totalFiles})`;
      }

      // Process WebP files
      for (const file of files.webp) {
        const baseName = path.basename(file, '.webp');
        await processRasterImage(file, outputDir, baseName, '.webp', finalBaseWidth, finalBaseHeight, workingDir, outputFormat);
        processed++;
        processingSpinner.text = `Processing images (${processed}/${totalFiles})`;
      }

      processingSpinner.succeed(chalk.green('Processing complete'));
      
      const formatDisplay = outputFormat === 'original' ? 'Original formats' : outputFormat.toUpperCase();
      console.log();
      console.log(chalk.green.bold('  ✨ Done! Generated versions:\n'));
      console.log(chalk.cyan(`     • Format: ${formatDisplay}`));
      console.log(chalk.cyan(`     • 1x (${finalBaseWidth}x${finalBaseHeight})`));
      console.log(chalk.cyan(`     • 2x (${finalBaseWidth * 2}x${finalBaseHeight * 2}) with @2x suffix`));
      console.log(chalk.cyan(`     • 3x (${finalBaseWidth * 3}x${finalBaseHeight * 3}) with @3x suffix`));
      console.log();
      console.log(chalk.white.bold(`     📦 Total: ${totalFiles * 3} files created`));
      console.log();
      console.log(chalk.gray(`  🎉 All images are ready in: ${outputDir}/\n`));

    } catch (error) {
      processingSpinner.fail(chalk.red('Error processing images'));
      console.log();
      throw error;
    }

  } catch (error) {
    spinner.stop();
    console.log();
    console.error(chalk.red('  ❌ Error:'), chalk.white(error.message));
    console.log();
    process.exit(1);
  }
}

// Run the script
main();

