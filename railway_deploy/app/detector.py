from pathlib import Path

import numpy as np
import torch
from PIL import Image
from ultralytics import YOLO


class ObjectDetector:
    """
    YOLO-based object detector used to identify objects
    and their bounding boxes in uploaded images.
    """

    def __init__(self, project_root):
        self.project_root = Path(project_root)

        self.device = (
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

        print(f"Object detector device: {self.device}")

        model_path = (
            self.project_root
            / "models"
            / "yolo11n.pt"
        )

        if not model_path.exists():
            raise FileNotFoundError(
                f"YOLO model not found at: {model_path}"
            )

        self.model = YOLO(str(model_path))

        print("YOLO11n object detector loaded.")

    def detect(self, image: Image.Image):
        """
        Detect objects in a PIL image.

        Returns:
            list of dictionaries containing:
            - label
            - confidence
            - bounding box coordinates
        """

        image = image.convert("RGB")

        results = self.model.predict(
            source=image,
            conf=0.25,
            imgsz=640,
            device=self.device,
            verbose=False,
        )

        result = results[0]

        detections = []

        if result.boxes is None:
            return detections

        boxes = result.boxes

        xyxy = boxes.xyxy.cpu().numpy()
        confidences = boxes.conf.cpu().numpy()
        class_ids = boxes.cls.cpu().numpy().astype(int)

        for box, confidence, class_id in zip(
            xyxy,
            confidences,
            class_ids
        ):
            x1, y1, x2, y2 = box

            detections.append(
                {
                    "label": result.names[class_id],
                    "confidence": float(confidence),
                    "box": {
                        "x1": float(x1),
                        "y1": float(y1),
                        "x2": float(x2),
                        "y2": float(y2),
                    },
                }
            )

        return detections