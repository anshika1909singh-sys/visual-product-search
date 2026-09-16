import torch
import torch.nn as nn
from torchvision import models, transforms


class FeatureExtractor:
    def __init__(self):
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        print(f"Using device: {self.device}")

        # Load pretrained EfficientNet-B0
        weights = models.EfficientNet_B0_Weights.DEFAULT
        model = models.efficientnet_b0(weights=weights)

        # Remove classifier
        model.classifier = nn.Identity()

        # Move model to device
        model = model.to(self.device)

        # Evaluation mode
        model.eval()

        self.model = model

        # Same preprocessing used during embedding generation
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        print("EfficientNet-B0 feature extractor loaded.")

    def extract(self, image):
        image_tensor = self.transform(image)
        image_tensor = image_tensor.unsqueeze(0)
        image_tensor = image_tensor.to(self.device)

        with torch.no_grad():
            embedding = self.model(image_tensor)

        embedding = embedding.cpu().numpy()

        return embedding