# Fast-3x 🖼️

A powerful CLI tool to automatically generate 1x, 2x, and 3x versions of your images for retina displays.

## Features

- 🔍 Automatically scans current directory for images
- 📊 Supports SVG, PNG, and JPG/JPEG formats
- 🌐 **WebP output support** for modern web optimization
- ✨ Generates @2x and @3x versions for retina displays
- 🎯 Interactive prompts for easy configuration
- 🚀 Fast processing with Sharp
- 💫 Beautiful CLI interface with progress indicators
- 🎨 Choose output format: WebP, PNG, JPG, or keep original

## Installation

### Using npx (Recommended)

No installation needed! Just run:

```bash
npx @tawfik/fast-3x
```

### Global Installation

```bash
pnpm install -g @tawfik/fast-3x
```

### Local Development

```bash
pnpm install
node index.js
```

## Usage

1. Navigate to your project directory containing images:
   ```bash
   cd path/to/your/images
   ```

2. Run the tool:
```bash
npx @tawfik/fast-3x
```

3. Follow the interactive prompts:
   - Choose scan mode (recursive or current directory only)
   - Confirm to start resizing
   - Enter base size (e.g., 32 for 32px)
   - Choose output format (WebP, PNG, JPG, or keep original)
   - Choose output directory name (default: "resized")

4. The tool will generate three versions of each image:
   - `image.webp` - 1x version (base size)
   - `image@2x.webp` - 2x version (double size)
   - `image@3x.webp` - 3x version (triple size)

## Example

```bash
$ npx @tawfik/fast-3x

  ███████╗ █████╗ ███████╗████████╗    ██████╗ ██╗  ██╗
  ██╔════╝██╔══██╗██╔════╝╚══██╔══╝    ╚════██╗╚██╗██╔╝
  █████╗  ███████║███████╗   ██║        █████╔╝ ╚███╔╝ 
  ██╔══╝  ██╔══██║╚════██║   ██║        ╚═══██╗ ██╔██╗ 
  ██║     ██║  ██║███████║   ██║       ██████╔╝██╔╝ ██╗
  ╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝       ╚═════╝ ╚═╝  ╚═╝
  
  Generate 1x, 2x, 3x image versions for retina displays

  Perfect for web, mobile apps, and responsive design
  Supports SVG, PNG, JPG → WebP, PNG, JPG

  📁 Working directory: /Users/you/project

✔ 🔍 How should I scan for images? › Recursively (current + all subdirectories)
  📂 Scanning: recursively

✔ Scanning complete

  📊 Found Images:

     • 15 SVG file(s)
     • 10 PNG file(s)
     • 5 JPG file(s)

     Total: 30 file(s)

✔ 🚀 Start resizing them? › Yes, start resizing

✔ 📏 What is the base size? (e.g., 32 for 32px) … 32
✔ 🎨 Output format? › WebP (recommended for web)
✔ 📂 Output directory name? … resized

  📁 Output: /Users/you/project/resized

✔ Processing complete

  ✨ Done! Generated versions:

     • Format: WEBP
     • 1x (32px)
     • 2x (64px) with @2x suffix
     • 3x (96px) with @3x suffix

     📦 Total: 90 files created

  🎉 All images are ready in: resized/

```

## Image Format Details

### Output Formats

**WebP (Recommended)** - Modern format with excellent compression, ~30% smaller than PNG/JPG while maintaining quality. Quality set to 90%.

**PNG** - Lossless format, best for images with transparency or simple graphics.

**JPG** - Lossy format, best for photos. Quality set to 90%.

**Keep Original** - Maintains the original format for each file (PNG stays PNG, JPG stays JPG).

### Input Format Handling

**SVG Files** - Converted to your chosen format at the specified sizes while maintaining transparency.

**PNG Files** - Resized maintaining aspect ratio and transparency.

**JPG Files** - Resized maintaining aspect ratio and quality.

## Output Structure

All resized images are placed in the specified output directory (default: `resized/`):

```
your-project/
├── original-image.svg
├── icon.png
├── photo.jpg
└── resized/
    ├── original-image.webp
    ├── original-image@2x.webp
    ├── original-image@3x.webp
    ├── icon.webp
    ├── icon@2x.webp
    ├── icon@3x.webp
    ├── photo.webp
    ├── photo@2x.webp
    └── photo@3x.webp
```

*Note: Output format depends on your selection. This example shows WebP output.*

## Use Cases

- 📱 Mobile app development (iOS, Android)
- 🌐 Responsive web design
- 🎨 Design systems
- 📦 Asset optimization for retina displays

## Requirements

- Node.js >= 14.0.0
- Sharp library (automatically installed)

## License

MIT

## Author

xtawfik

