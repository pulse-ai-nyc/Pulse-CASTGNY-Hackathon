from pydantic import BaseModel


class AnalysisRequest(BaseModel):
    brand_name: str
    category: str
    customer_segment: str | None = None
