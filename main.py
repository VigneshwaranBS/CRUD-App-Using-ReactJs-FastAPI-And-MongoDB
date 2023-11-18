from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from pydantic import BaseModel
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
origins = ["http://localhost:3000", "http://localhost:8000"]
# Add any other origins as needed

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Connect to your MongoDB Atlas cluster
mongo_client = MongoClient("{{Replace With MongoDB URI}}")


db = mongo_client["todo"]
collection = db["items"]

# Define a Pydantic model for the item
class Item(BaseModel):
    name: str
    description: str

# CRUD Operations
@app.post("/items/", response_model=Item)
def create_item(item: Item):
    # Create a new item in the collection
    item_dict = item.dict()
    inserted_item = collection.insert_one(item_dict)
    item_dict["_id"] = str(inserted_item.inserted_id)  # Add _id to the item_dict
    return item_dict  # Return the item with _id


@app.get("/items/{item_id}", response_model=Item)
def read_item(item_id: str):
    # Retrieve an item by ID
    item = collection.find_one({"_id": ObjectId(item_id)})
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    item["_id"] = str(item["_id"])  # Convert ObjectId to string for _id
    return item

@app.get("/items/", response_model=list[Item])
def read_items(skip: int = 0, limit: int = 10):
    # Retrieve a list of items with pagination
    items = list(collection.find().skip(skip).limit(limit))
    for item in items:
        item["_id"] = str(item["_id"])  # Convert ObjectId to string for _id
    return items


@app.get("/items_all/", response_model=list[Item])
def read_all_items():
    # Retrieve all items from MongoDB
    items = list(collection.find())
    for item in items:
        item["_id"] = str(item["_id"])  # Convert ObjectId to string for _id
    return items



@app.put("/items/{item_id}", response_model=Item)
def update_item(item_id: str, updated_item: Item):
    # Update an item by ID
    item = collection.find_one({"_id": ObjectId(item_id)})
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    update_data = updated_item.dict(exclude_unset=True)
    collection.update_one({"_id": ObjectId(item_id)}, {"$set": update_data})
    return {**item, **update_data}

@app.delete("/items/{item_id}", response_model=dict)
def delete_item(item_id: str):
    # Delete an item by ID
    item = collection.find_one({"_id": ObjectId(item_id)})
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    collection.delete_one({"_id": ObjectId(item_id)})
    return {"message": "Item deleted"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
