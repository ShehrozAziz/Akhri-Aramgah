from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import stripe

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Read Stripe API key from .env
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@app.route('/api/create-payment', methods=['POST'])
def create_payment():
    try:
        # Get request data
        data = request.get_json()
        amount = data.get('amount')

        if not amount:
            print("Dadasafjafasfoasfsasaf")
            return jsonify({'error': 'Missing amount'}), 400

        print(f"Creating PaymentIntent for amount: {amount}")

        # ✅ Correct way: Specify `payment_method_types` when disabling `automatic_payment_methods`
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,  # Amount in cents
            currency='usd',
            payment_method="pm_card_visa",  # Test payment method
            confirm=False,  # Confirm immediately
            payment_method_types=['card']  # ✅ Specify allowed types
        )

        print("PaymentIntent created successfully:", payment_intent)

        return jsonify({
            'clientSecret': payment_intent.client_secret
        })

    except stripe.error.CardError as e:
        print("Stripe Card Error:", e)
        return jsonify({'error': {'message': e.error.message, 'code': e.error.code}}), 400

    except stripe.error.StripeError as e:
        print("Stripe API Error:", e)
        return jsonify({'error': {'message': str(e), 'code': 'stripe_error'}}), 500

    except Exception as e:
        print("General Error:", e)
        return jsonify({'error': {'message': str(e), 'code': 'server_error'}}), 500

if __name__ == '__main__':
    app.run(host='localhost', port=5008, debug=False)
