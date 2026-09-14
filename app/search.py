from pathlib import Path

import faiss
import numpy as np
import pandas as pd


class ProductSearch:
    def __init__(self, project_root):
        self.project_root = Path(project_root)

        # Paths
        self.index_path = (
            self.project_root
            / "embeddings"
            / "efficientnet_b0_faiss.index"
        )

        self.ids_path = (
            self.project_root
            / "embeddings"
            / "efficientnet_b0_product_ids.npy"
        )

        self.metadata_path = (
            self.project_root
            / "data"
            / "processed"
            / "product_metadata.csv"
        )

        # Load FAISS index
        self.index = faiss.read_index(str(self.index_path))

        # Load product IDs
        self.product_ids = np.load(self.ids_path)

        # Load metadata
        self.metadata = pd.read_csv(self.metadata_path)

        # Validate alignment
        assert self.index.ntotal == len(self.product_ids)
        assert len(self.product_ids) == len(self.metadata)

        print(f"FAISS index loaded: {self.index.ntotal} products")
        print(f"Product metadata loaded: {len(self.metadata)} products")

    def search(self, query_embedding, k=10):
        # Make a copy so we don't modify the original embedding
        query_vector = query_embedding.copy().astype(np.float32)

        faiss.normalize_L2(query_vector)

        scores, indices = self.index.search(
           query_vector,
            k + 1
        )

        scores = scores[0]
        indices = indices[0]

        results = []

        for score, index in zip(scores, indices):

            if index == -1:
              continue
 
            product_id = int(self.product_ids[index])

           # Find metadata for this product
            product_row = self.metadata[
              self.metadata["id"] == product_id
            ].iloc[0]

            results.append({
            "product_id": product_id,
            "similarity": float(score),
            "gender": product_row["gender"],
            "masterCategory": product_row["masterCategory"],
            "subCategory": product_row["subCategory"],
            "articleType": product_row["articleType"],
            "baseColour": product_row["baseColour"],
            "season": product_row["season"],
            "year": int(product_row["year"]),
            "usage": product_row["usage"],
            "productDisplayName": product_row["productDisplayName"],
            "image_url": f"/images/{product_id}.jpg"
            })

            if len(results) == k:
              break
    
        return results