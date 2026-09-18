from uuid import UUID

from pydantic import BaseModel


class CartProduct(BaseModel):
    shopping_list_item_id: UUID
    product_id: UUID
    name: str
    ingredient_key: str
    category: str
    unit_price: float
    cart_quantity: int
    line_total: float
    image_url: str | None = None


class UnmatchedIngredient(BaseModel):
    shopping_list_item_id: UUID
    name: str
    ingredient_key: str
    cart_quantity: int


class CartResponse(BaseModel):
    products: list[CartProduct]
    unmatched_ingredients: list[UnmatchedIngredient]
    total_price: float