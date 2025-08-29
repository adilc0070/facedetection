## Face Detection Batch Script (Python)

Detect faces across a directory of photos using OpenCV's Haar cascades. The script saves annotated images, optional cropped faces, and a CSV with detection metadata.

### Install

```bash
python3 -m pip install -r requirements.txt
```

### Usage

```bash
python3 face_detect_batch.py \
  --input /path/to/photos \
  --output /path/to/output \
  --save-crops
```

Key options:
- `--cascade`: custom Haar cascade XML. Defaults to OpenCV frontal face.
- `--scale-factor`: scaling between pyramid levels (default 1.1).
- `--min-neighbors`: detection threshold (default 5).
- `--min-size W H`: minimum face size in pixels (default 30 30).
- `--no-rectangles`: skip saving annotated images.
- `--save-crops`: save cropped face images.
- `--recursive`: mirror input directory structure under output.
- `--max-images N`: process at most N images.

Outputs are written under the chosen output directory:
- `annotated/`: images with rectangles
- `crops/`: cropped faces (if enabled)
- `detections.csv`: one row per detected face (images with zero faces are included)

### Notes

- Uses `opencv-python-headless`, which avoids GUI dependencies for servers/containers.
- Supported image extensions: jpg, jpeg, png, bmp, tif, tiff, webp.
