import React, { useState } from 'react';
import { Home, MessageSquare, UserPlus, LogIn, MapPin, Tag, ShoppingCart, X } from 'lucide-react';

type Message = {
  text: string;
  isBot: boolean;
  shops?: Shop[];
  medicines?: Medicine[];
};

type Shop = {
  name: string;
  distance: string;
  discount: string;
  address: string;
};

type Medicine = {
  name: string;
  price: number;
  dosage: string;
};

type CartItem = {
  medicine: Medicine;
  shop: Shop;
  quantity: number;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const mockShops: Shop[] = [
    {
      name: "HealthCare Pharmacy",
      distance: "0.5 km",
      discount: "15% off on all medicines",
      address: "123 Medical Avenue"
    },
    {
      name: "MediPlus Drugstore",
      distance: "0.8 km",
      discount: "10% off + free delivery",
      address: "456 Health Street"
    },
    {
      name: "Wellness Pharmacy",
      distance: "1.2 km",
      discount: "20% off on first purchase",
      address: "789 Wellness Road"
    }
  ];

  const mockMedicines: Medicine[] = [
    {
      name: "Paracetamol",
      price:200,
      dosage: "500mg"
    },
    {
      name: "Ibuprofen",
      price:150,
      dosage: "400mg"
    }
  ];

  const handleAddToCart = (medicine: Medicine, shop: Shop) => {
    setCart(prev => {
      const existingItem = prev.find(
        item => item.medicine.name === medicine.name && item.shop.name === shop.name
      );

      if (existingItem) {
        return prev.map(item =>
          item === existingItem
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { medicine, shop, quantity: 1 }];
    });
    setShowCart(true);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {
    alert('Order placed successfully! You will receive a confirmation email shortly.');
    setCart([]);
    setShowCart(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
  
    setMessages(prev => [...prev, { text: inputText, isBot: false }]);
  
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          connectors: [{ id: 'web-search' }],
        }),
      });
      
      
      
  
      const data = await response.json();
      const reply = data.text || "Sorry, I couldn't find an answer.";
  
      setMessages(prev => [
        ...prev,
        {
          text: reply,
          isBot: true
        }
      ]);
      
      
    } catch (error) {
      console.error('Cohere API error:', error);
      setMessages(prev => [...prev, {
        text: "Oops! Something went wrong while fetching the response.",
        isBot: true
      }]);
    }
  
    setInputText('');
  };
  

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.medicine.price * item.quantity;
      const discount = item.shop.discount.includes('15%') ? 0.15 : 
                      item.shop.discount.includes('20%') ? 0.20 : 0.10;
      return total + (price - (price * discount));
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Home className="h-6 w-6 text-blue-600 cursor-pointer" />
              <span className="ml-2 text-xl font-semibold text-gray-800">MediChat</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="flex items-center text-gray-600 hover:text-blue-600 relative"
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              <button className="flex items-center text-gray-600 hover:text-blue-600">
                <LogIn className="h-5 w-5" />
                <span className="ml-1">Login</span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-blue-600">
                <UserPlus className="h-5 w-5" />
                <span className="ml-1">Sign Up</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-lg">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Shopping Cart</h2>
                <button 
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4 h-[calc(100vh-200px)] overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center">Your cart is empty</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{item.medicine.name}</h3>
                        <p className="text-sm text-gray-600">{item.medicine.dosage}</p>
                        <p className="text-sm text-gray-600">From: {item.shop.name}</p>
                        <p className="text-sm text-green-600">{item.shop.discount}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveFromCart(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span>Quantity: {item.quantity}</span>
                      <span>${(item.medicine.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="bg-blue-600 p-4 text-white flex items-center">
            <MessageSquare className="h-6 w-6 mr-2" />
            <h2 className="text-xl font-semibold">Medical Assistant</h2>
          </div>

          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>Welcome to MediChat! 👋</p>
                <p className="mt-2">Describe your symptoms and I'll help you understand what might be wrong.</p>
                <p className="text-sm mt-4 text-gray-400">Note: This is a demo. Always consult healthcare professionals for medical advice.</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="space-y-4">
                  <div
                    className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.isBot
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                  {msg.medicines && (
                    <div className="mt-4 space-y-3">
                      <h3 className="text-gray-700 font-semibold">Recommended Medicines:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {msg.medicines.map((medicine, medIdx) => (
                          <div key={medIdx} className="bg-white border rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold text-gray-800">{medicine.name}</h4>
                            <p className="text-sm text-gray-600">Dosage: {medicine.dosage}</p>
                            <p className="text-sm text-gray-600">Price: ${medicine.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {msg.shops && (
                    <div className="mt-4 space-y-3">
                      <h3 className="text-gray-700 font-semibold">Nearby Medical Shops:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {msg.shops.map((shop, shopIdx) => (
                          <div key={shopIdx} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                                <h4 className="font-semibold text-gray-800">{shop.name}</h4>
                              </div>
                              <span className="text-sm text-gray-500">{shop.distance}</span>
                            </div>
                            <div className="mt-2 flex items-center text-green-600">
                              <Tag className="h-4 w-4 mr-1" />
                              <span className="text-sm">{shop.discount}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">{shop.address}</p>
                            {msg.medicines && (
                              <div className="mt-3 space-y-2">
                                {msg.medicines.map((medicine, medIdx) => (
                                  <button
                                    key={medIdx}
                                    onClick={() => handleAddToCart(medicine, shop)}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                                  >
                                    Order {medicine.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="border-t p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your symptoms..."
                className="flex-1 rounded-lg border border-gray-300 p-2 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;