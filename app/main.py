from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from PIL import Image
import io

from app.model import FeatureExtractor
from app.search import ProductSearch


PROJECT_ROOT = Path(__file__).resolve().parent.parent


app = FastAPI(
    title="Visual Product Search API",
    description="Visual product similarity search using EfficientNet-B0 and FAISS.",
    version="1.0.0",
)


# Load ML components once when the API starts
feature_extractor = FeatureExtractor()
search_engine = ProductSearch(PROJECT_ROOT)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "visual-product-search-api"
    }


@app.post("/search")
async def search_products(
    file: UploadFile = File(...),
    k: int = 5
):
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, and WebP images are supported."
        )

    # Validate k
    if k < 1 or k > 20:
        raise HTTPException(
            status_code=400,
            detail="k must be between 1 and 20."
        )

    try:
        # Read uploaded image
        image_bytes = await file.read()

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

        # Generate query embedding
        embedding = feature_extractor.extract(image)

        # Search FAISS
        results = search_engine.search(
            embedding,
            k=k
        )

        return {
            "query": {
                "filename": file.filename
            },
            "results": results
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )