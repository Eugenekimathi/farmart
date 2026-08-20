from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models.animal import Animal
from app.schemas.animal_schema import (
    AnimalSchema,
    AnimalResponseSchema
)

animal_bp = Blueprint(
    "animals",
    __name__,
    url_prefix="/api/animals"
)

schema = AnimalSchema()
response_schema = AnimalResponseSchema()
many_response_schema = AnimalResponseSchema(
    many=True
)
