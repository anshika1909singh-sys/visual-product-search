from pathlib import Path

from PIL import Image

from app.detector import ObjectDetector


PROJECT_ROOT = Path(__file__).resolve().parents[1]

IMAGE_PATH = (
    PROJECT_ROOT
    / "data"
    / "fashion-product-images-small"
    / "images"
    / "10000.jpg"
)


detector = ObjectDetector(PROJECT_ROOT)

image = Image.open(IMAGE_PATH).convert("RGB")

detections = detector.detect(image)

print("\nDetected objects:")
print("-" * 60)

for detection in detections:
    print(
        f"{detection['label']:20s} "
        f"{detection['confidence']:.3f} "
        f"{detection['box']}"
    )