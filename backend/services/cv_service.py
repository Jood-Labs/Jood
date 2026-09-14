async def detect_ingredients_from_image(image):
    # Mock result for now.
    # Later, this will be replaced with the real Computer Vision model.
    return [
        {"name": "tomato", "confidence": 0.96},
        {"name": "egg", "confidence": 0.93},
        {"name": "cheese", "confidence": 0.89}
    ]