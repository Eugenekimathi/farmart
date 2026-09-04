from io import BytesIO
from werkzeug.datastructures import FileStorage

from app.services import image_storage_service


def test_upload_uses_cloudinary_when_configured(app, monkeypatch):
    app.config.update(
        CLOUDINARY_CLOUD_NAME="cloud",
        CLOUDINARY_API_KEY="key",
        CLOUDINARY_API_SECRET="secret",
    )
    monkeypatch.setattr(
        image_storage_service.cloudinary.uploader,
        "upload",
        lambda *_args, **_kwargs: {"secure_url": "https://res.cloudinary.com/demo/image/upload/cow.jpg"},
    )
    file = FileStorage(BytesIO(b"image"), filename="cow.jpg", content_type="image/jpeg")

    with app.test_request_context("/"):
        url = image_storage_service.upload_animal_image(file)

    assert url.startswith("https://res.cloudinary.com/")
