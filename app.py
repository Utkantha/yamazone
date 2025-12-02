from flask import Flask, render_template, jsonify, request

app = Flask(__name__)


# Simple in-memory "database" of products
PRODUCTS = [
    {
        "id": 1,
        "name": "Echo Smart Speaker (4th Gen)",
        "price": 49.99,
        "rating": 4.6,
        "reviews": 12834,
        "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
        "tag": "Best Seller",
        "category": "Electronics",
        "description": "Smart speaker with rich sound, smart home hub, and Alexa voice control. Perfect for home automation.",
    },
    {
        "id": 2,
        "name": "Wireless Noise Cancelling Headphones",
        "price": 89.99,
        "rating": 4.4,
        "reviews": 8421,
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
        "tag": "Limited Time Deal",
        "category": "Electronics",
        "description": "Immersive sound with powerful ANC, 30 hours battery life, and comfortable over-ear design.",
    },
    {
        "id": 3,
        "name": "Ergonomic Office Chair",
        "price": 139.99,
        "rating": 4.3,
        "reviews": 4319,
        "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        "tag": "Top Rated",
        "category": "Home & Office",
        "description": "Adjustable lumbar support, breathable mesh back, and smooth-rolling wheels for all-day comfort.",
    },
    {
        "id": 4,
        "name": "4K UHD Smart TV 55 Inch",
        "price": 399.99,
        "rating": 4.7,
        "reviews": 22109,
        "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop",
        "tag": "Today's Deal",
        "category": "Electronics",
        "description": "Vibrant 4K display, HDR support, built-in streaming apps, and voice control remote.",
    },
    {
        "id": 5,
        "name": "Stainless Steel Water Bottle (1L)",
        "price": 19.99,
        "rating": 4.8,
        "reviews": 5219,
        "image": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop",
        "tag": "Amazon's Choice",
        "category": "Sports & Outdoors",
        "description": "Double-wall insulated bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free.",
    },
    {
        "id": 6,
        "name": "Mechanical Gaming Keyboard RGB",
        "price": 59.99,
        "rating": 4.5,
        "reviews": 10219,
        "image": "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop",
        "tag": "Hot New Release",
        "category": "Computers",
        "description": "Responsive mechanical switches, per-key RGB backlighting, and detachable wrist rest included.",
    },
    {
        "id": 7,
        "name": "Wireless Ergonomic Mouse",
        "price": 29.99,
        "rating": 4.6,
        "reviews": 8765,
        "image": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop",
        "tag": "Best Seller",
        "category": "Computers",
        "description": "Comfortable ergonomic design with precision tracking, long battery life, and silent clicks.",
    },
    {
        "id": 8,
        "name": "Adjustable Laptop Stand",
        "price": 39.99,
        "rating": 4.7,
        "reviews": 6543,
        "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
        "tag": "Amazon's Choice",
        "category": "Home & Office",
        "description": "Aluminum stand with 9 height adjustments, improves posture and enhances laptop cooling.",
    },
]


@app.route("/")
def home():
    featured = PRODUCTS[:4]
    deals = sorted(PRODUCTS, key=lambda p: p["rating"], reverse=True)
    return render_template("index.html", products=PRODUCTS, featured=featured, deals=deals)


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/api/products")
def get_products():
    return jsonify(PRODUCTS)


@app.route("/api/cart/preview", methods=["POST"])
def cart_preview():
    data = request.get_json(force=True)
    ids = data.get("ids", [])
    selected = [p for p in PRODUCTS if p["id"] in ids]
    total = round(sum(p["price"] for p in selected), 2)
    return jsonify({"items": selected, "total": total})


@app.route("/api/buy", methods=["POST"])
def buy():
    data = request.get_json(force=True)
    product_id = data.get("productId")
    product = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if not product:
        return jsonify({"success": False, "message": "Product not found"}), 404
    return jsonify(
        {
            "success": True,
            "message": f"Order placed for {product['name']}!",
            "estimatedDelivery": "2–4 business days",
        }
    )


if __name__ == "__main__":
    app.run(debug=True)


