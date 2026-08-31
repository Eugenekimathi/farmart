from app import create_app
from app.extensions import db
from app.models.animals import Animal

app = create_app()

with app.app_context():
    animals = Animal.query.all()
    print(f'Total animals: {len(animals)}')
    for a in animals:
        print(f'ID: {a.id}, Name: {a.name}, Price: {a.price}, Status: {a.status}')
