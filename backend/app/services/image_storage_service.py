"""Image storage abstraction for animal listings.

Cloudinary is used when all required credentials are configured. Local storage
remains available for development and tests so an absent cloud configuration
does not silently prevent a farmer from creating a listing.
"""
import os
import uuid

import cloudinary
import cloudinary.uploader
from flask import current_app, request


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024


def _cloudinary_enabled():
    return all([
        current_app.config.get("CLOUDINARY_CLOUD_NAME"),
        current_app.config.get("CLOUDINARY_API_KEY"),
        current_app.config.get("CLOUDINARY_API_SECRET"),
    ])


def _configure_cloudinary():
    cloudinary.config(
        cloud_name=current_app.config["CLOUDINARY_CLOUD_NAME"],
        api_key=current_app.config["CLOUDINARY_API_KEY"],
        api_secret=current_app.config["CLOUDINARY_API_SECRET"],
        secure=True,
    )


def validate_image(file_storage):
    if not file_storage or not file_storage.filename:
        raise ValueError("Each image must have a filename")

    extension = os.path.splitext(file_storage.filename)[1].lower()
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    if file_storage.mimetype not in ALLOWED_IMAGE_TYPES and (
        file_storage.mimetype != "application/octet-stream" or extension not in allowed_extensions
    ):
        raise ValueError("Only JPG, PNG, and WEBP images are allowed")

    file_storage.stream.seek(0, os.SEEK_END)
    size = file_storage.stream.tell()
    file_storage.stream.seek(0)
    if size > MAX_IMAGE_SIZE:
        raise ValueError("Each image must be 5MB or smaller")


def upload_animal_image(file_storage):
    """Store one validated image and return its permanent URL."""
    validate_image(file_storage)

    if _cloudinary_enabled():
        _configure_cloudinary()
        result = cloudinary.uploader.upload(
            file_storage,
            folder="farmart/animals",
            resource_type="image",
        )
        return result["secure_url"]

    extension = os.path.splitext(file_storage.filename)[1].lower()
    normalized_extension = ".jpg" if extension in {".jpg", ".jpeg"} else extension
    filename = f"{uuid.uuid4().hex}{normalized_extension}"
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_dir, exist_ok=True)
    file_storage.save(os.path.join(upload_dir, filename))
    return f"{request.host_url.rstrip('/')}/uploads/{filename}"
