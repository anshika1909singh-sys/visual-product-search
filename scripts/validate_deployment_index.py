from pathlib import Path

import faiss
import numpy as np


PROJECT_ROOT = Path(__file__).resolve().parents[1]

EMBEDDINGS_PATH = PROJECT_ROOT / "embeddings" / "efficientnet_b0_embeddings.npy"
PRODUCT_IDS_PATH = PROJECT_ROOT / "embeddings" / "efficientnet_b0_product_ids.npy"

EXACT_INDEX_PATH = PROJECT_ROOT / "embeddings" / "efficientnet_b0_faiss.index"
DEPLOYMENT_INDEX_PATH = (
    PROJECT_ROOT / "embeddings" / "efficientnet_b0_faiss_deployment.index"
)

K = 10
NUM_QUERIES = 1000


print("=" * 70)
print("VALIDATING DEPLOYMENT FAISS INDEX")
print("=" * 70)


# ------------------------------------------------------------
# 1. Load embeddings and product IDs
# ------------------------------------------------------------

print("\nLoading embeddings...")

embeddings = np.load(EMBEDDINGS_PATH).astype(np.float32)
product_ids = np.load(PRODUCT_IDS_PATH)

print(f"Embeddings : {embeddings.shape}")
print(f"Product IDs: {product_ids.shape}")


# ------------------------------------------------------------
# 2. Normalize query embeddings
# ------------------------------------------------------------

faiss.normalize_L2(embeddings)


# ------------------------------------------------------------
# 3. Load both indexes
# ------------------------------------------------------------

print("\nLoading exact index...")
exact_index = faiss.read_index(str(EXACT_INDEX_PATH))

print("Loading deployment index...")
deployment_index = faiss.read_index(str(DEPLOYMENT_INDEX_PATH))

print(f"Exact index vectors      : {exact_index.ntotal:,}")
print(f"Deployment index vectors : {deployment_index.ntotal:,}")


assert exact_index.ntotal == len(embeddings)
assert deployment_index.ntotal == len(embeddings)


# ------------------------------------------------------------
# 4. Select deterministic queries
# ------------------------------------------------------------

rng = np.random.default_rng(42)

query_indices = rng.choice(
    len(embeddings),
    size=NUM_QUERIES,
    replace=False,
)

queries = embeddings[query_indices]


# ------------------------------------------------------------
# 5. Search both indexes
# ------------------------------------------------------------

print(f"\nSearching {NUM_QUERIES:,} queries...")

exact_scores, exact_indices = exact_index.search(queries, K)
deployment_scores, deployment_indices = deployment_index.search(
    queries,
    K,
)


# ------------------------------------------------------------
# 6. Calculate retrieval agreement
# ------------------------------------------------------------

overlaps = []

for exact_row, deployment_row in zip(
    exact_indices,
    deployment_indices,
):
    exact_set = set(exact_row)
    deployment_set = set(deployment_row)

    overlap = len(exact_set & deployment_set) / K
    overlaps.append(overlap)


overlaps = np.array(overlaps)


# ------------------------------------------------------------
# 7. Calculate top-1 agreement
# ------------------------------------------------------------

top1_agreement = np.mean(
    exact_indices[:, 0] == deployment_indices[:, 0]
)


# ------------------------------------------------------------
# 8. Calculate top-5 and top-10 agreement
# ------------------------------------------------------------

top5_overlaps = []

top10_overlaps = []

for exact_row, deployment_row in zip(
    exact_indices,
    deployment_indices,
):
    exact_top5 = set(exact_row[:5])
    deployment_top5 = set(deployment_row[:5])

    exact_top10 = set(exact_row[:10])
    deployment_top10 = set(deployment_row[:10])

    top5_overlaps.append(
        len(exact_top5 & deployment_top5) / 5
    )

    top10_overlaps.append(
        len(exact_top10 & deployment_top10) / 10
    )


top5_overlaps = np.array(top5_overlaps)
top10_overlaps = np.array(top10_overlaps)


# ------------------------------------------------------------
# 9. Similarity score comparison
# ------------------------------------------------------------

score_difference = np.abs(
    exact_scores - deployment_scores
)


# ------------------------------------------------------------
# 10. Print results
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("VALIDATION RESULTS")
print("=" * 70)

print(f"\nQueries tested              : {NUM_QUERIES:,}")

print(
    f"Top-1 agreement             : "
    f"{top1_agreement:.4f}"
)

print(
    f"Mean Top-5 overlap          : "
    f"{top5_overlaps.mean():.4f}"
)

print(
    f"Mean Top-10 overlap         : "
    f"{top10_overlaps.mean():.4f}"
)

print(
    f"Minimum Top-10 overlap      : "
    f"{top10_overlaps.min():.4f}"
)

print(
    f"Mean absolute score diff    : "
    f"{score_difference.mean():.6f}"
)

print(
    f"Maximum absolute score diff : "
    f"{score_difference.max():.6f}"
)


# ------------------------------------------------------------
# 11. Basic safety checks
# ------------------------------------------------------------

assert exact_index.ntotal == deployment_index.ntotal

assert np.isfinite(deployment_scores).all()



print("\nBasic validation checks passed.")

print("\n" + "=" * 70)
print("DONE")
print("=" * 70)