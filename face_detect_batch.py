#!/usr/bin/env python3
"""
Batch face detection over a directory of images using OpenCV Haar cascades.

Outputs:
- Annotated images with detected face rectangles
- Optional cropped face images
- CSV metadata of detections (one row per face; zero-face images are included)

Example:
  python3 face_detect_batch.py \
    --input /path/to/photos \
    --output /path/to/output \
    --save-crops
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Sequence, Tuple

import cv2
import numpy as np


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".tif",
    ".tiff",
    ".webp",
}


@dataclass(frozen=True)
class DetectionBox:
    x: int
    y: int
    width: int
    height: int

    def to_tuple(self) -> Tuple[int, int, int, int]:
        return (self.x, self.y, self.width, self.height)


def find_image_files(root: Path) -> List[Path]:
    """Return a list of image file paths under root, sorted for stable order."""
    if not root.exists():
        return []
    files: List[Path] = []
    for path in root.rglob("*"):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            files.append(path)
    files.sort()
    return files


def ensure_directory(path: Path) -> None:
    """Create directory if it does not exist."""
    path.mkdir(parents=True, exist_ok=True)


def load_cascade(cascade_path: Path | None) -> cv2.CascadeClassifier:
    """Load Haar cascade classifier from path or OpenCV defaults."""
    if cascade_path is None:
        default_dir = Path(cv2.data.haarcascades)
        cascade_path = default_dir / "haarcascade_frontalface_default.xml"
    classifier = cv2.CascadeClassifier(str(cascade_path))
    if classifier.empty():
        raise RuntimeError(f"Failed to load cascade from: {cascade_path}")
    return classifier


def detect_faces(
    image_bgr: np.ndarray,
    classifier: cv2.CascadeClassifier,
    scale_factor: float,
    min_neighbors: int,
    min_size: Tuple[int, int],
) -> List[DetectionBox]:
    """Detect faces and return a list of bounding boxes."""
    if image_bgr is None or image_bgr.size == 0:
        return []
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    detections = classifier.detectMultiScale(
        gray,
        scaleFactor=scale_factor,
        minNeighbors=min_neighbors,
        minSize=min_size,
        flags=cv2.CASCADE_SCALE_IMAGE,
    )
    boxes: List[DetectionBox] = [
        DetectionBox(int(x), int(y), int(w), int(h)) for (x, y, w, h) in detections
    ]
    return boxes


def draw_boxes(image_bgr: np.ndarray, boxes: Sequence[DetectionBox]) -> np.ndarray:
    """Return a copy of image with rectangles drawn for each detection."""
    annotated = image_bgr.copy()
    for box in boxes:
        pt1 = (box.x, box.y)
        pt2 = (box.x + box.width, box.y + box.height)
        cv2.rectangle(annotated, pt1, pt2, color=(0, 255, 0), thickness=2)
    return annotated


def save_crops(
    image_bgr: np.ndarray,
    boxes: Sequence[DetectionBox],
    output_dir: Path,
    base_stem: str,
) -> List[Path]:
    """Save cropped faces and return their file paths."""
    saved_paths: List[Path] = []
    for index, box in enumerate(boxes):
        y1 = max(0, box.y)
        y2 = max(0, box.y + box.height)
        x1 = max(0, box.x)
        x2 = max(0, box.x + box.width)
        crop = image_bgr[y1:y2, x1:x2]
        if crop.size == 0:
            continue
        crop_path = output_dir / f"{base_stem}_face{index:02d}.jpg"
        cv2.imwrite(str(crop_path), crop)
        saved_paths.append(crop_path)
    return saved_paths


def write_metadata_header(csv_writer: csv.writer) -> None:
    csv_writer.writerow(
        [
            "source_path",
            "image_width",
            "image_height",
            "face_index",
            "x",
            "y",
            "width",
            "height",
            "extra",
        ]
    )


def write_metadata_rows(
    csv_writer: csv.writer,
    source_path: Path,
    image_shape: Tuple[int, int, int],
    boxes: Sequence[DetectionBox],
) -> None:
    height, width = int(image_shape[0]), int(image_shape[1])
    if not boxes:
        csv_writer.writerow(
            [str(source_path), width, height, "", "", "", "", "", json.dumps({})]
        )
        return
    for index, box in enumerate(boxes):
        csv_writer.writerow(
            [
                str(source_path),
                width,
                height,
                index,
                box.x,
                box.y,
                box.width,
                box.height,
                json.dumps({}),
            ]
        )


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Batch face detection over a directory of images",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--input",
        "-i",
        type=Path,
        required=True,
        help="Input directory containing images",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        required=True,
        help="Output directory for results",
    )
    parser.add_argument(
        "--cascade",
        type=Path,
        default=None,
        help="Optional path to Haar cascade XML (defaults to OpenCV's frontal face)",
    )
    parser.add_argument(
        "--scale-factor",
        type=float,
        default=1.1,
        help="Scale factor for multi-scale detection",
    )
    parser.add_argument(
        "--min-neighbors",
        type=int,
        default=5,
        help="Minimum neighbors for detections",
    )
    parser.add_argument(
        "--min-size",
        type=int,
        nargs=2,
        default=(30, 30),
        metavar=("W", "H"),
        help="Minimum face size in pixels",
    )
    parser.add_argument(
        "--no-rectangles",
        action="store_true",
        help="Do not save annotated images with rectangles",
    )
    parser.add_argument(
        "--save-crops",
        action="store_true",
        help="Save cropped face images",
    )
    parser.add_argument(
        "--max-images",
        type=int,
        default=None,
        help="Optionally limit number of images to process",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="Recreate input directory structure under output",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str]) -> int:
    try:
        args = parse_args(argv)
        input_dir: Path = args.input
        output_dir: Path = args.output
        classifier = load_cascade(args.cascade)

        if not input_dir.exists() or not input_dir.is_dir():
            print(f"Input directory not found: {input_dir}", file=sys.stderr)
            return 2

        ensure_directory(output_dir)
        annotated_dir = output_dir / "annotated"
        crops_dir = output_dir / "crops"
        ensure_directory(annotated_dir)
        ensure_directory(crops_dir)

        metadata_path = output_dir / "detections.csv"
        image_paths = find_image_files(input_dir)
        if args.max_images is not None:
            image_paths = image_paths[: max(0, int(args.max_images))]

        try:
            from tqdm import tqdm  # type: ignore
        except Exception:  # pragma: no cover - optional dependency
            def tqdm(x: Iterable, **_: object) -> Iterable:  # type: ignore
                return x

        processed_count = 0
        total_detections = 0

        with metadata_path.open("w", newline="", encoding="utf-8") as csv_file:
            writer = csv.writer(csv_file)
            write_metadata_header(writer)

            for image_path in tqdm(image_paths, desc="Processing images"):
                image_bgr = cv2.imread(str(image_path))
                if image_bgr is None:
                    print(f"Warning: failed to read image: {image_path}", file=sys.stderr)
                    continue

                boxes = detect_faces(
                    image_bgr=image_bgr,
                    classifier=classifier,
                    scale_factor=float(args.scale_factor),
                    min_neighbors=int(args.min_neighbors),
                    min_size=(int(args.min_size[0]), int(args.min_size[1])),
                )
                total_detections += len(boxes)

                if not args.no_rectangles:
                    annotated = draw_boxes(image_bgr, boxes)
                    if args.recursive:
                        rel_path = image_path.relative_to(input_dir)
                        target_dir = annotated_dir / rel_path.parent
                        ensure_directory(target_dir)
                        annotated_path = target_dir / image_path.name
                    else:
                        annotated_path = annotated_dir / image_path.name
                    cv2.imwrite(str(annotated_path), annotated)

                if args.save_crops and boxes:
                    base_stem = image_path.stem
                    target_dir = crops_dir / image_path.relative_to(input_dir).parent if args.recursive else crops_dir
                    ensure_directory(target_dir)
                    save_crops(image_bgr, boxes, target_dir, base_stem)

                write_metadata_rows(writer, image_path, image_bgr.shape, boxes)
                processed_count += 1

        print(
            f"Completed. Processed {processed_count} images with {total_detections} total faces.")
        print(f"Annotated images: {annotated_dir}")
        if args.save_crops:
            print(f"Cropped faces: {crops_dir}")
        print(f"Metadata CSV: {metadata_path}")
        return 0
    except KeyboardInterrupt:
        print("Interrupted", file=sys.stderr)
        return 130
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

