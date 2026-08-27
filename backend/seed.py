from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.farmer import Farmer
from app.models.animal_type import AnimalType
from app.models.breed import Breed
from app.models.animals import Animal
from werkzeug.security import generate_password_hash
app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()
    cattle = AnimalType(name="Cattle", description="Bovine livestock")
    sheep = AnimalType(name="Sheep", description="Ovine livestock")
    goat = AnimalType(name="Goat", description="Caprine livestock")
    db.session.add_all([cattle, sheep, goat])
    db.session.flush()

    boran = Breed(name="Boran", animal_type_id=cattle.id)
    sahiwal = Breed(name="Sahiwal", animal_type_id=cattle.id)
    friesian = Breed(name="Friesian", animal_type_id=cattle.id)
    dorper = Breed(name="Dorper", animal_type_id=sheep.id)
    maasai = Breed(name="Red Maasai", animal_type_id=sheep.id)
    galla = Breed(name="Galla", animal_type_id=goat.id)
    db.session.add_all([boran, sahiwal, friesian, dorper, maasai, galla])
    db.session.flush()

    farmer_user = User(
        full_name="James Kariuki",
        email="farmer@farmart.co.ke",
        phone="0712345678",
        password_hash=generate_password_hash("password123"),
        role="FARMER",
        location="Naivasha",
    )
    buyer_user = User(
        full_name="Mary Wanjiru",
        email="buyer@farmart.co.ke",
        phone="0723456789",
        password_hash=generate_password_hash("password123"),
        role="BUYER",
        location="Nairobi",
    )
    db.session.add_all([farmer_user, buyer_user])
    db.session.flush()

    farmer = Farmer(
        user_id=farmer_user.id,
        farm_name="Kariuki Farm",
        farm_location="Naivasha, Kenya",
        description="Family-run cattle farm since 1998",
    )
    db.session.add(farmer)
    db.session.flush()
    animals = [
        Animal(farmer_id=farmer.id, animal_type_id=cattle.id, breed_id=boran.id,
               name="Purebred Boran Bull", gender="MALE", age=24,
               price=95000, location="Naivasha", status="AVAILABLE",
               description="Strong, healthy bull. Vaccinated."),
        Animal(farmer_id=farmer.id, animal_type_id=cattle.id, breed_id=sahiwal.id,
               name="Sahiwal Heifer", gender="FEMALE", age=18,
               price=72000, location="Naivasha", status="AVAILABLE",
               description="High milk producer. Gentle temperament."),
        Animal(farmer_id=farmer.id, animal_type_id=sheep.id, breed_id=dorper.id,
               name="Dorper Ram", gender="MALE", age=12,
               price=18000, location="Naivasha", status="AVAILABLE",
               description="Fast-growing meat breed."),
        Animal(farmer_id=farmer.id, animal_type_id=sheep.id, breed_id=maasai.id,
               name="Red Maasai Ewe", gender="FEMALE", age=8,
               price=12500, location="Naivasha", status="AVAILABLE",
               description="Disease-resistant breed."),
        Animal(farmer_id=farmer.id, animal_type_id=goat.id, breed_id=galla.id,
               name="Galla Goat", gender="MALE", age=6,
               price=8500, location="Naivasha", status="AVAILABLE",
               description="Premium meat goat."),
        Animal(farmer_id=farmer.id, animal_type_id=cattle.id, breed_id=friesian.id,
               name="Dairy Friesian Cow", gender="FEMALE", age=36,
               price=140000, location="Naivasha", status="AVAILABLE",
               description="30L/day milk production."),
    ]
    db.session.add_all(animals)
    db.session.commit()

    print("Database seeded successfully")
    print("Farmer login: farmer@farmart.co.ke / password123")
    print("Buyer login: buyer@farmart.co.ke / password123")
