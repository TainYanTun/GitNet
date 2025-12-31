# App Icons Guide for GitCanopy

To ensure your application looks professional on all platforms (macOS, Windows, Linux), you need to provide specific icon formats in the `assets/` directory.

## Required Files

Place the following files in the `assets/` folder:

| Platform | Filename | Format | Size | Details |
| :--- | :--- | :--- | :--- | :--- |
| **macOS** | `icon.icns` | Apple Icon Image | Multi-size | Must include 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024 retina sizes. |
| **Windows** | `icon.ico` | Windows Icon | Multi-size | Must include 16x16, 32x32, 48x48, 256x256 sizes. |
| **Linux** | `icon.png` | PNG Image | 512x512 px | High-quality PNG with transparency. |

## How to Generate These Icons

Since you have a source image (e.g., a high-res 1024x1024 PNG), you can generate the platform-specific files using these methods:

### Option 1: CLI Tools (Recommended)
You can use tools like `electron-icon-builder` or `icon-gen` to automate this.

1.  **Install a generator:**
    ```bash
    npm install -g icon-gen
    ```
2.  **Run the command:**
    ```bash
    # Assuming you have a master icon at assets/master.png
    icon-gen -i assets/master.png -o assets/
    ```

### Option 2: Online Converters
If you don't want to install tools, use online converters:
1.  **CloudConvert:** [https://cloudconvert.com/png-to-icns](https://cloudconvert.com/png-to-icns) (for .icns)
2.  **ICO Convert:** [https://icoconvert.com/](https://icoconvert.com/) (for .ico)

### Option 3: macOS Preview (Manual)
You can technically create an `.icns` file on macOS using the terminal and `iconutil`, but it's complex. Using a tool is preferred.

## Verification
After adding the files, your `assets/` folder should look like this:

```
assets/
├── icon.icns
├── icon.ico
├── icon.png
```

## Build Configuration
Your `package.json` is already configured to look in the `assets/` folder. `electron-builder` will automatically pick up:
- `icon.icns` for the macOS `.dmg` and `.app`.
- `icon.ico` for the Windows `.exe` and installer.
- `icon.png` for Linux builds.
