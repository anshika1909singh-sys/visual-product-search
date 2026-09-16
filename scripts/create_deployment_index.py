from pathlib import Path

import faiss
import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parents[1]

EMBEDDINGS_PATH = PROJECT_ROOT / "embeddings" / "efficientnet_b0_embeddings.npy"
EXACT_INDEX_PATH = PROJECT_ROOT / "embeddings" / "efficientnet_b0_faiss.index"

DEPLOYMENT_INDEX_PATH = (
    PROJECT_ROOT / "embeddings" / "efficientnet_b0_faiss_deployment.index"
)


print("=" * 70)
print("CREATING DEPLOYMENT FAISS INDEX")
print("=" * 70)

print("\nLoading embeddings...")
embeddings = np.load(EMBEDDINGS_PATH)

print(f"Embedding shape : {embeddings.shape}")
print(f"Embedding dtype : {embeddings.dtype}")

# Make sure FAISS receives float32 vectors.
embeddings = embeddings.astype(np.float32, copy=False)

# Normalize so inner product corresponds to cosine similarity.
faiss.normalize_L2(embeddings)

dimension = embeddings.shape[1]

print(f"\nDimension       : {dimension}")
print("Normalization   : L2")

print("\nCreating 8-bit scalar-quantized index...")

deployment_index = faiss.IndexScalarQuantizer(
    dimension,
    faiss.ScalarQuantizer.QT_8bit,
    faiss.METRIC_INNER_PRODUCT,
)

deployment_index.train(embeddings)
deployment_index.add(embeddings)

print(f"Vectors indexed : {deployment_index.ntotal:,}")

print("\nSaving deployment index...")
faiss.write_index(deployment_index, str(DEPLOYMENT_INDEX_PATH))

print(f"Saved to        : {DEPLOYMENT_INDEX_PATH}")

print("\n" + "=" * 70)
print("DONE")
print("=" * 70)