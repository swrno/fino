from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI(
    title="Fino Prediction Engine",
    description="FastAPI service for running ML model predictions",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
router = APIRouter(prefix="/api/v1")

class PredictionRequest(BaseModel):
    features: list[float]

class PredictionResponse(BaseModel):
    prediction: list[float]
    metadata: Dict[str, Any]

@router.get("/health")
def health_check():
    return {"status": "healthy", "service": "prediction-engine"}

@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    # Place prediction logic here
    # Example mock prediction (just returns features doubled)
    output = [x * 2.0 for x in request.features]
    return {
        "prediction": output,
        "metadata": {
            "model_version": "0.1.0",
            "algorithm": "mock_linear_scale"
        }
    }

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
