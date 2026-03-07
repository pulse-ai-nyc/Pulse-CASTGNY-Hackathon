from pydantic import BaseModel


class AnalysisRequest(BaseModel):
    brand_name: str
    website_url: str
    customer_segment: str | None = None
