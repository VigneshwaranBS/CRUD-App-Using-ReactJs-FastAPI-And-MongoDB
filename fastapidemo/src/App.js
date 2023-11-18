import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '' });
  const [updateItem, setUpdateItem] = useState({ name: '', description: '' });
  const [itemIdToUpdate, setItemIdToUpdate] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/items/')
      .then(response => {
        setItems(response.data);
      })
      .catch(error => {
        console.error('Error fetching items:', error);
      });
  }, []);

  const createItem = () => {
    axios.post('http://localhost:8000/items/', newItem)
      .then(response => {
        setItems([...items, response.data]);
        setNewItem({ name: '', description: '' });
      })
      .catch(error => {
        console.error('Error creating item:', error);
      });
  };

  const updateItemById = () => {
    axios.put(`http://localhost:8000/items/${itemIdToUpdate}`, updateItem)
      .then(response => {
        const updatedItems = items.map(item => {
          if (item._id === itemIdToUpdate) {
            return response.data;
          }
          return item;
        });
        setItems(updatedItems);
        setUpdateItem({ name: '', description: '' });
        setItemIdToUpdate('');
      })
      .catch(error => {
        console.error('Error updating item:', error);
      });
  };

  const deleteItemById = async (itemId) => {
    if (!itemId) {
      console.error('Invalid item ID:', itemId);
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/items/${itemId}`);
      const updatedItems = items.filter(item => item._id !== itemId);
      setItems(updatedItems);
    } catch (error) {
      console.error(`Error deleting item: ${error.message}`);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">CRUD App</h1>
      <div className="row">
        <div className="col-md-4">
          <h2>Create Item</h2>
          <div className="form-group">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            />
            <button className="btn btn-primary" onClick={createItem}>Create</button>
          </div>
          <h2>Edit Item</h2>
          <div className="form-group">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="New Name"
              value={updateItem.name}
              onChange={(e) => setUpdateItem({ ...updateItem, name: e.target.value })}
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="New Description"
              value={updateItem.description}
              onChange={(e) => setUpdateItem({ ...updateItem, description: e.target.value })}
            />
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Item ID"
              value={itemIdToUpdate}
              onChange={(e) => setItemIdToUpdate(e.target.value)}
            />
            <button className="btn btn-warning" onClick={updateItemById}>Update</button>
          </div>
        </div>
        <div className="col-md-8">
          <h2>Items</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>
                    <button className="btn btn-warning mr-2" onClick={() => {
                      setUpdateItem({ name: item.name, description: item.description });
                      setItemIdToUpdate(item._id);
                    }}>Edit</button>
                    <button className="btn btn-danger" onClick={() => deleteItemById(item._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
