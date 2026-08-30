"""
Clean Database Setup Script
This script sets up a fresh database without any seed data.
Run this to start with a completely clean database for testing.
"""
from app import create_app
from app.extensions import db
from app.models.animal_type import AnimalType
from app.models.breed import Breed

app = create_app()

print("Setting up clean database...")

with app.app_context():
    # Drop all existing tables
    print("Dropping existing tables...")
    db.drop_all()

    # Create all tables fresh
    print("Creating fresh tables...")
    db.create_all()

    # Add basic animal types (catalog data, not seed data)
    print("Adding basic animal types...")
    animal_types = [
        AnimalType(name="Cattle", description="Bovine livestock including dairy and beef cattle"),
        AnimalType(name="Sheep", description="Ovine livestock including meat and wool sheep"),
        AnimalType(name="Goat", description="Caprine livestock including dairy and meat goats"),
        AnimalType(name="Pigs", description="Porcine livestock"),
        AnimalType(name="Chicken", description="Poultry including layers and broilers"),
    ]
    db.session.add_all(animal_types)
    db.session.flush()

    # Add basic breeds for each animal type (catalog data, not seed data)
    print("Adding basic breeds...")
    cattle = next(t for t in animal_types if t.name == "Cattle")
    sheep = next(t for t in animal_types if t.name == "Sheep")
    goat = next(t for t in animal_types if t.name == "Goat")

    breeds = [
        # Cattle breeds
        Breed(name="Boran", animal_type_id=cattle.id, description="Indigenous Kenyan beef breed"),
        Breed(name="Sahiwal", animal_type_id=cattle.id, description="Dual-purpose dairy and beef breed"),
        Breed(name="Friesian", animal_type_id=cattle.id, description="High-yielding dairy breed"),
        Breed(name="Ayrshire", animal_type_id=cattle.id, description="Hardy dairy breed"),
        Breed(name="Jersey", animal_type_id=cattle.id, description="High-butterfat dairy breed"),
        Breed(name="Other", animal_type_id=cattle.id, description="Other or mixed cattle breeds"),
        # Sheep breeds
        Breed(name="Dorper", animal_type_id=sheep.id, description="Fast-growing meat breed"),
        Breed(name="Red Maasai", animal_type_id=sheep.id, description="Indigenous disease-resistant breed"),
        Breed(name="Merino", animal_type_id=sheep.id, description="Wool-producing breed"),
        Breed(name="Other", animal_type_id=sheep.id, description="Other or mixed sheep breeds"),
        # Goat breeds
        Breed(name="Galla", animal_type_id=goat.id, description="Large meat and milk breed"),
        Breed(name="Toggenburg", animal_type_id=goat.id, description="Dairy goat breed"),
        Breed(name="Alpine", animal_type_id=goat.id, description="Dairy goat breed"),
        Breed(name="Boer", animal_type_id=goat.id, description="Meat goat breed"),
        Breed(name="Other", animal_type_id=goat.id, description="Other or mixed goat breeds"),
    ]
    db.session.add_all(breeds)
    db.session.commit()

    print("\n[SUCCESS] Clean database setup complete!")
    print("\nDatabase is now ready for use without any seed data.")
    print("\nCatalog data added:")
    print(f"  - {len(animal_types)} animal types")
    print(f"  - {len(breeds)} breeds")
    print("\nNext steps:")
    print("1. Register a farmer account")
    print("2. Create farmer profile")
    print("3. Add animals (using the available types and breeds)")
    print("4. Register a buyer account")
    print("5. Buyers can browse and purchase")

