from pathlib import Path
import time

import faiss
import numpy as np
import torch
from torch.utils.data import DataLoader
from torchvision import models, transforms
from PIL import Image
import pandas as pd
from tqdm import tqdm


# --------------------------------------------------
# Paths
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[1]

METADATA_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "product_metadata.csv"
)

EMBEDDINGS_DIR = PROJECT_ROOT / "embeddings"

EMBEDDINGS_PATH = (
    EMBEDDINGS_DIR
    / "efficientnet_b0_embeddings.npy"
)

INDEX_PATH = (
    EMBEDDINGS_DIR
    / "efficientnet_b0_faiss.index"
)

IDS_PATH = (
    EMBEDDINGS_DIR
    / "efficientnet_b0_product_ids.npy"
)


# --------------------------------------------------
# Device
# --------------------------------------------------

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print(f"Using device: {device}")


# --------------------------------------------------
# Load metadata
# --------------------------------------------------

metadata = pd.read_csv(METADATA_PATH)

print(f"Products: {len(metadata)}")


# --------------------------------------------------
# Preprocessing
# --------------------------------------------------

transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# --------------------------------------------------
# Dataset
# --------------------------------------------------

class ProductImageDataset(torch.utils.data.Dataset):

    def __init__(self, dataframe):
        self.dataframe = dataframe.reset_index(drop=True)

    def __len__(self):
        return len(self.dataframe)

    def __getitem__(self, index):

        row = self.dataframe.iloc[index]

        image = Image.open(
            row["image_path"]
        ).convert("RGB")

        image = transform(image)

        return image, int(row["id"])


dataset = ProductImageDataset(metadata)

loader = DataLoader(
    dataset,
    batch_size=16,
    shuffle=False,
    num_workers=0,
    pin_memory=torch.cuda.is_available()
)


# --------------------------------------------------
# Load EfficientNet-B0
# --------------------------------------------------

weights = models.EfficientNet_B0_Weights.DEFAULT

model = models.efficientnet_b0(
    weights=weights
)

model.classifier = torch.nn.Identity()

model = model.to(device)

model.eval()


print("EfficientNet-B0 loaded.")
print(f"Total batches: {len(loader)}")


# --------------------------------------------------
# Generate embeddings
# --------------------------------------------------

all_embeddings = []
all_ids = []

start_time = time.time()

with torch.no_grad():

    for batch_images, batch_ids in tqdm(
        loader,
        total=len(loader),
        desc="Generating EfficientNet embeddings"
    ):

        batch_images = batch_images.to(
            device,
            non_blocking=True
        )

        batch_embeddings = model(batch_images)

        batch_embeddings = (
            batch_embeddings
            .cpu()
            .numpy()
            .astype(np.float32)
        )

        all_embeddings.append(
            batch_embeddings
        )

        all_ids.append(
            batch_ids.numpy()
        )


# --------------------------------------------------
# Combine batches
# --------------------------------------------------

embeddings = np.vstack(all_embeddings)

product_ids = np.concatenate(all_ids)

elapsed = time.time() - start_time


# --------------------------------------------------
# Validate
# --------------------------------------------------

print("\nEmbedding generation complete")

print(
    "Embedding shape:",
    embeddings.shape
)

print(
    "Embedding dtype:",
    embeddings.dtype
)

print(
    "Product IDs:",
    len(product_ids)
)

print(
    f"Time: {elapsed:.2f} seconds"
)


assert embeddings.shape == (
    len(metadata),
    1280
)

assert len(product_ids) == len(metadata)

assert np.array_equal(
    product_ids,
    metadata["id"].to_numpy()
)


# --------------------------------------------------
# Normalize embeddings
# --------------------------------------------------

faiss.normalize_L2(embeddings)

norms = np.linalg.norm(
    embeddings,
    axis=1
)

print(
    f"Mean norm: {norms.mean():.6f}"
)


# --------------------------------------------------
# Build FAISS index
# --------------------------------------------------

index = faiss.IndexFlatIP(1280)

index.add(embeddings)

print(
    f"FAISS index size: {index.ntotal}"
)


# --------------------------------------------------
# Save
# --------------------------------------------------

EMBEDDINGS_DIR.mkdir(
    exist_ok=True
)

np.save(
    EMBEDDINGS_PATH,
    embeddings
)

np.save(
    IDS_PATH,
    product_ids
)

faiss.write_index(
    index,
    str(INDEX_PATH)
)


print("\nSaved:")

print(EMBEDDINGS_PATH)
print(INDEX_PATH)
print(IDS_PATH)