from pydantic import BaseModel
from uuid import UUID


class CartProduct(BaseModel):
    product_id: UUID
    name: str
    ingredient_key: str
    category: str
    unit_price: float
    cart_quantity: int
    line_total: float
    image_url: str | None = None


class UnmatchedIngredient(BaseModel):
    name: str
    ingredient_key: str
    cart_quantity: int


class CartResponse(BaseModel):
    products: list[CartProduct]
    unmatched_ingredients: list[UnmatchedIngredient]
    total_price: float