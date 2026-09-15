import { useEffect, useRef, useState } from "react";
import lensLogo from "./assets/lensfind-logo.jpg";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [detections, setDetections] = useState([]);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const [isCropping, setIsCropping] = useState(false);

  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [cropImage, setCropImage] = useState(null);

  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  /*
   * ---------------------------------------------------------
   * FILE UPLOAD
   * ---------------------------------------------------------
   */

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    setError("");
    setResults([]);
    setDetections([]);
    setSelectedDetection(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(url);

    detectObjects(file);
  };

  const handleFileInput = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  /*
   * ---------------------------------------------------------
   * YOLO OBJECT DETECTION
   * ---------------------------------------------------------
   */

  const detectObjects = async (file) => {
    setIsDetecting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/detect`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Object detection failed.");
      }

      const data = await response.json();

      setDetections(data.detections || []);
    } catch (err) {
      console.error(err);
      setError(
        "Object detection could not be completed. You can still use manual crop."
      );
    } finally {
      setIsDetecting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DETECTION → SMART CROP
   * ---------------------------------------------------------
   */

  const handleDetectionSelect = (detection) => {
    if (!previewUrl) return;

    setSelectedDetection(detection);
    setError("");

    /*
     * YOLO gives coordinates in ORIGINAL IMAGE PIXELS.
     *
     * ReactCrop can use percentage coordinates.
     *
     * We therefore convert the YOLO bounding box
     * into percentages.
     */

    const img = new Image();

    img.onload = () => {
      const imageWidth = img.naturalWidth;
      const imageHeight = img.naturalHeight;

      const { x1, y1, x2, y2 } = detection.box;

      const x = (x1 / imageWidth) * 100;
      const y = (y1 / imageHeight) * 100;
      const width = ((x2 - x1) / imageWidth) * 100;
      const height = ((y2 - y1) / imageHeight) * 100;

      const initialCrop = {
        unit: "%",
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: Math.min(100 - x, width),
        height: Math.min(100 - y, height),
      };

      setCrop(initialCrop);
      setCompletedCrop(initialCrop);
      setCropImage(previewUrl);
      setIsCropping(true);
    };

    img.src = previewUrl;
  };

  /*
   * ---------------------------------------------------------
   * MANUAL CROP
   * ---------------------------------------------------------
   */

  const handleManualCrop = () => {
    if (!previewUrl) return;

    setSelectedDetection(null);
    setError("");

    /*
     * Start with a large rectangular crop.
     * The user can resize it freely.
     */

    const initialCrop = {
      unit: "%",
      x: 10,
      y: 10,
      width: 80,
      height: 80,
    };

    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
    setCropImage(previewUrl);
    setIsCropping(true);
  };

  /*
   * ---------------------------------------------------------
   * FULL IMAGE SEARCH
   * ---------------------------------------------------------
   */

  const handleUseFullImage = () => {
    if (!selectedFile) return;

    searchImage(selectedFile);
  };

  /*
   * ---------------------------------------------------------
   * CREATE CROPPED IMAGE
   * ---------------------------------------------------------
   */

  const createCroppedImage = async () => {
    if (!completedCrop || !cropImage) {
      return null;
    }

    const image = new Image();

    image.src = cropImage;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;

    const cropX =
      completedCrop.unit === "%"
        ? (completedCrop.x / 100) * naturalWidth
        : completedCrop.x;

    const cropY =
      completedCrop.unit === "%"
        ? (completedCrop.y / 100) * naturalHeight
        : completedCrop.y;

    const cropWidth =
      completedCrop.unit === "%"
        ? (completedCrop.width / 100) * naturalWidth
        : completedCrop.width;

    const cropHeight =
      completedCrop.unit === "%"
        ? (completedCrop.height / 100) * naturalHeight
        : completedCrop.height;

    const canvas = document.createElement("canvas");

    canvas.width = Math.max(1, Math.round(cropWidth));
    canvas.height = Math.max(1, Math.round(cropHeight));

    const context = canvas.getContext("2d");

    context.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }

          const croppedFile = new File(
            [blob],
            "cropped-product.jpg",
            {
              type: "image/jpeg",
            }
          );

          resolve(croppedFile);
        },
        "image/jpeg",
        0.95
      );
    });
  };

  /*
   * ---------------------------------------------------------
   * SEARCH CROPPED IMAGE
   * ---------------------------------------------------------
   */

  const handleCropAndSearch = async () => {
    setError("");

    const croppedFile = await createCroppedImage();

    if (!croppedFile) {
      setError("Could not create the selected crop.");
      return;
    }

    setIsCropping(false);

    await searchImage(croppedFile);
  };

  /*
   * ---------------------------------------------------------
   * SEARCH API
   * ---------------------------------------------------------
   */

  const searchImage = async (file) => {
    setIsSearching(true);
    setError("");
    setResults([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/search?k=10`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Search failed.");
      }

      const data = await response.json();

      setResults(data.results || []);

      /*
       * Scroll toward results after search.
       */

      setTimeout(() => {
        document
          .getElementById("results")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (err) {
      console.error(err);
      setError(
        "Visual search failed. Make sure the FastAPI backend is running."
      );
    } finally {
      setIsSearching(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * RESET
   * ---------------------------------------------------------
   */

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");
    setDetections([]);
    setSelectedDetection(null);
    setIsCropping(false);
    setCrop(null);
    setCompletedCrop(null);
    setCropImage(null);
    setResults([]);
    setError("");
  };

  /*
   * ---------------------------------------------------------
   * CLEANUP
   * ---------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const formatSimilarity = (score) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  return (
    <div className="app">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="site-header">
        <div className="header-inner">

          <div className="brand">
            <div className="brand-mark">
              <img src={lensLogo} alt="LensFind logo" />
            </div>

            <div>
              <div className="brand-name">
                LensFind
              </div>

              <div className="brand-tagline">
                Visual Product Search
              </div>
            </div>
          </div>

          <nav className="desktop-nav">
            <a href="#workspace" className="nav-link">Search</a>
            <a href="#results" className="nav-link">Results</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
          </nav>

          <div className="api-status">
            <span className="status-dot"></span>
            API Online
          </div>

        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <main>

        <section className="hero">
          <div className="hero-badge">
            AI-POWERED VISUAL RETRIEVAL
          </div>

          <h1>
            Find products by
            <span> seeing them.</span>
          </h1>

          <p>
            Upload an image, select the object you care about,
            and discover visually similar products using
            deep CNN embeddings and vector search.
          </p>
        </section>

        {/* ===================================================
            WORKSPACE
        =================================================== */}

        <section
          className="workspace-section"
          id="workspace"
        >

          {!selectedFile ? (

            <div
              className="upload-zone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: "pointer" }}
            >

              <div className="upload-icon">
                ↑
              </div>

              <h2>
                Drop an image here
              </h2>

              <p>
                Or click anywhere here to choose an image
              </p>

              <button
                className="primary-button"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose Image
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInput}
                hidden
              />

              <div className="upload-note">
                JPEG, PNG or WebP
              </div>

            </div>

          ) : (

            <div className="workspace-card">

              <div className="workspace-header">

                <div>
                  <div className="section-eyebrow">
                    SEARCH WORKSPACE
                  </div>

                  <h2>
                    Select what you want to find
                  </h2>
                </div>

              </div>

              <div className="workspace-grid">

                {/* IMAGE */}
                <div className="image-panel">

                  <div className="panel-label">
                    <span>UPLOADED IMAGE</span>
                    <button
                      type="button"
                      className="primary-button new-image-btn"
                      onClick={handleReset}
                    >
                      New Image
                    </button>
                  </div>

                  <div className="image-stage">

                    <img
                      src={previewUrl}
                      alt="Uploaded product"
                      className="uploaded-image"
                    />

                    {/* YOLO DETECTION BOXES */}

                    {detections.map(
                      (detection, index) => {

                        const img = document.querySelector(
                          ".uploaded-image"
                        );

                        if (!img) return null;

                        const naturalWidth =
                          img.naturalWidth;

                        const naturalHeight =
                          img.naturalHeight;

                        if (
                          !naturalWidth ||
                          !naturalHeight
                        ) {
                          return null;
                        }

                        const {
                          x1,
                          y1,
                          x2,
                          y2,
                        } = detection.box;

                        const left =
                          (x1 / naturalWidth) *
                          100;

                        const top =
                          (y1 / naturalHeight) *
                          100;

                        const width =
                          ((x2 - x1) /
                            naturalWidth) *
                          100;

                        const height =
                          ((y2 - y1) /
                            naturalHeight) *
                          100;

                        const isSelected =
                          selectedDetection ===
                          detection;

                        return (
                          <button
                            key={index}
                            className={`detection-box ${
                              isSelected
                                ? "selected"
                                : ""
                            }`}
                            style={{
                              left: `${left}%`,
                              top: `${top}%`,
                              width: `${width}%`,
                              height: `${height}%`,
                            }}
                            onClick={() =>
                              handleDetectionSelect(
                                detection
                              )
                            }
                          >
                            <span className="detection-label">
                              {detection.label} ·{" "}
                              {(
                                detection.confidence *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                          </button>
                        );
                      }
                    )}

                  </div>

                  <div className="image-actions">

                    <button
                      className="secondary-button"
                      onClick={handleManualCrop}
                    >
                      ✦ Manual Crop
                    </button>

                    <button
                      className="primary-button"
                      onClick={handleUseFullImage}
                      disabled={isSearching}
                    >
                      {isSearching
                        ? "Searching..."
                        : "Search Full Image"}
                    </button>

                  </div>

                </div>

                {/* INSPECTOR */}

                <aside className="inspector">

                  <div className="panel-label">
                    AI OBJECT DETECTION
                  </div>

                  {isDetecting ? (

                    <div className="inspector-loading">
                      <div className="loading-spinner"></div>

                      <p>
                        Detecting objects...
                      </p>
                    </div>

                  ) : detections.length > 0 ? (

                    <>

                      <p className="inspector-description">
                        Select an detected object to
                        automatically create a crop around it.
                      </p>

                      <div className="detection-list">

                        {detections.map(
                          (detection, index) => (

                            <button
                              key={index}
                              className={`detection-item ${
                                selectedDetection ===
                                detection
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                handleDetectionSelect(
                                  detection
                                )
                              }
                            >

                              <div>
                                <strong>
                                  {detection.label}
                                </strong>

                                <span>
                                  Detection {index + 1}
                                </span>
                              </div>

                              <div className="confidence">
                                {(
                                  detection.confidence *
                                  100
                                ).toFixed(0)}
                                %
                              </div>

                            </button>

                          )
                        )}

                      </div>

                    </>

                  ) : (

                    <div className="no-detection">

                      <div className="no-detection-icon">
                        ○
                      </div>

                      <h3>
                        No objects detected
                      </h3>

                      <p>
                        YOLO could not confidently identify
                        an object in this image.
                      </p>

                      <button
                        className="secondary-button full-width"
                        onClick={handleManualCrop}
                      >
                        Create Manual Crop
                      </button>

                    </div>

                  )}

                </aside>

              </div>

            </div>

          )}

          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

        </section>

        {/* ===================================================
            RESULTS
        =================================================== */}

        {results.length > 0 && (

          <section
            className="results-section"
            id="results"
          >

            <div className="results-header">

              <div>
                <div className="section-eyebrow">
                  VISUAL MATCHES
                </div>

                <h2>
                  Similar products
                </h2>

                <p>
                  Ranked using EfficientNet-B0 embeddings
                  and FAISS cosine similarity.
                </p>
              </div>

              <div className="result-count">
                {results.length} results
              </div>

            </div>

            <div className="results-grid">

              {results.map(
                (product, index) => (

                  <article
                    className="product-card"
                    key={product.product_id}
                  >

                    <div className="product-image">

                      <img
                        src={`${API_URL}${product.image_url}`}
                        alt={
                          product.productDisplayName ||
                          `Product ${product.product_id}`
                        }
                      />

                      <div className="rank-badge">
                        #{index + 1}
                      </div>

                      <div className="similarity-badge">
                        {formatSimilarity(
                          product.similarity
                        )}
                      </div>

                    </div>

                    <div className="product-info">

                      <div className="product-type">
                        {product.articleType}
                      </div>

                      <h3>
                        {product.productDisplayName}
                      </h3>

                      <div className="product-meta">

                        <span>
                          {product.baseColour}
                        </span>

                        <span>
                          {product.gender}
                        </span>

                        <span>
                          {product.usage}
                        </span>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          </section>

        )}

        {/* ===================================================
            HOW IT WORKS
        =================================================== */}

        <section
          className="how-section"
          id="how-it-works"
        >

          <div className="section-eyebrow">
            THE PIPELINE
          </div>

          <h2>
            From pixels to products
          </h2>

          <div className="pipeline">

            <div className="pipeline-step">
              <div className="pipeline-number">
                01
              </div>

              <h3>
                Upload
              </h3>

              <p>
                Upload a product image from your device.
              </p>
            </div>

            <div className="pipeline-line"></div>

            <div className="pipeline-step">
              <div className="pipeline-number">
                02
              </div>

              <h3>
                Detect / Crop
              </h3>

              <p>
                YOLO identifies objects or you manually
                select the relevant region.
              </p>
            </div>

            <div className="pipeline-line"></div>

            <div className="pipeline-step">
              <div className="pipeline-number">
                03
              </div>

              <h3>
                Embed
              </h3>

              <p>
                EfficientNet-B0 converts the image into a
                1,280-dimensional visual embedding.
              </p>
            </div>

            <div className="pipeline-line"></div>

            <div className="pipeline-step">
              <div className="pipeline-number">
                04
              </div>

              <h3>
                Retrieve
              </h3>

              <p>
                FAISS searches the catalog for the most
                visually similar products.
              </p>
            </div>

          </div>

        </section>

      </main>

      {/* =====================================================
          FREEFORM CROP MODAL
      ===================================================== */}

      {isCropping && cropImage && (

        <div className="crop-modal">

          <div className="crop-modal-backdrop"></div>

          <div className="crop-modal-card">

            <div className="crop-modal-header">

              <div>

                <div className="section-eyebrow">
                  CROP STUDIO
                </div>

                <h2>
                  Select the exact object
                </h2>

                <p>
                  Drag the box or resize any edge or corner.
                  The crop can have any shape.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setIsCropping(false)
                }
              >
                ×
              </button>

            </div>

            <div className="free-crop-container">

              <ReactCrop
                crop={crop}
                onChange={(newCrop) => {
                  setCrop(newCrop);
                }}
                onComplete={(newCrop) => {
                  setCompletedCrop(newCrop);
                }}
                keepSelection
                minWidth={20}
                minHeight={20}
              >

                <img
                  src={cropImage}
                  alt="Crop selection"
                  className="crop-image"
                />

              </ReactCrop>

            </div>

            <div className="crop-modal-footer">

              <div className="crop-help">
                ↗ Drag corners or edges to resize
                <br />
                ✥ Drag inside the box to move it
              </div>

              <div className="crop-actions">

                <button
                  className="secondary-button"
                  onClick={() =>
                    setIsCropping(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  onClick={handleCropAndSearch}
                  disabled={isSearching}
                >
                  {isSearching
                    ? "Searching..."
                    : "Search Selected Area →"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;