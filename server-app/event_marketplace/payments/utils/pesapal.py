import requests
import uuid
import json
from django.conf import settings

class PesapalPaymentHandling:
    def __init__(self):
        self.base_url = settings.PESAPAL_BASE_URL
        self.consumer_key = settings.PESAPAL_CONSUMER_KEY
        self.consumer_secret = settings.PESAPAL_CONSUMER_SECRET
        self.callback_url = settings.PESAPAL_CALLBACK_URL
        self.order_tracking_id = str(uuid.uuid4())

        # Store the registered IPN ID permanently
        self.ipn_id = "5423db16-9e87-4050-9113-dfe54bc4db0f"

    def get_access_token(self):
        url = "https://pay.pesapal.com/v3/api/Auth/RequestToken"
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        payload = {
            "consumer_key": self.consumer_key,
            "consumer_secret": self.consumer_secret
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            print("Status code:", response.status_code)
            print("Raw response text:", response.text)
            response.raise_for_status()
            return response.json()
        except Exception as err:
            print("Access token error:", err)
            return {}

    def register_ipn_url(self):
        token_data = self.get_access_token()
        access_token = token_data.get("token")

        if not access_token:
            raise Exception("Failed to obtain access token.")

        url = "https://pay.pesapal.com/v3/api/URLSetup/RegisterIPN"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        payload = {
            "url": "https://f0a3-102-218-90-29.ngrok-free.app/api/payments/callback/",
            "ipn_notification_type": "GET"  # or "POST"
        }

        try:
            response = requests.post(url, headers=headers, json=payload)
            print("Register IPN Response:", response.status_code, response.text)
            return response.json()
        except requests.RequestException as e:
            print("Request failed:", e)
            return {"status": "error", "message": str(e)}
        except json.JSONDecodeError as e:
            print("Invalid JSON response:", e)
            return {"status": "error", "message": "Invalid JSON from Pesapal"}
    
   

    def submit_request_order(self,id, amount, phone_number, email, firstname, lastname):
        token = self.get_access_token().get("token")
        ipn = self.register_ipn_url().get("ipn_id")

        if not token and not ipn:
            raise Exception("Failed to obtain access token or register IPN URL.")
        url = f"{self.base_url}/Transactions/SubmitOrderRequest"

        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        payload = {
    "id": self.order_tracking_id,  # Generate a unique ID for the order
    "currency": "KES",
    "amount":  f"{float(amount):.2f}",  # Convert to string with 2 decimal places
    "description": "Payment for goods",
    "callback_url": self.callback_url,
    "notification_id": ipn,
    "billing_address": {
        "email_address": email,
        "phone_number": str(phone_number),
        "country_code": "KE",
        "first_name": firstname,
        "last_name": lastname,
    }
}
        print("Sending Order Payload:", json.dumps(payload, indent=2))
        try:
            response = requests.post(url, json=payload, headers=headers)
            print(f"Submit Order Response [{response.status_code}]:\n{response.text}\n")

            if not response.text.strip():
               raise Exception("Empty response body from Pesapal")
            
            try:
                data = response.json()
                print("Parsed JSON Response:", json.dumps(data, indent=2))
            except json.JSONDecodeError as e:
                print("Failed to parse JSON response:", e)
                raise Exception("Invalid JSON response from Pesapal")
            if "redirect_url" not in data:
              raise Exception(f"'redirect_url' not found in response: {json.dumps(data, indent=2)}")
        except requests.RequestException as req_err:
           print("Request error:", req_err)
           raise

        except Exception as err:
           print("Error during order submission:", err)
           raise

    def obtain_redirect_url(self, order_tracking_id, amount, phone_number, email, firstname, lastname):
        response = self.submit_request_order(
            id=order_tracking_id,
            amount=amount,
            phone_number=phone_number,
            email=email,
            firstname=firstname,
            lastname=lastname
        )

        if not response:
            raise Exception("Empty response from Pesapal")

        redirect_url = response.get("redirect_url")
        if redirect_url:
            return {"redirect_url": redirect_url}
        
        raise Exception(f"Failed to obtain redirect URL: {response.get('message') or response}")
    
    def query_payment_status(self, order_tracking_id):
        token = self.get_access_token().get("token")
        url = f"{self.base_url}/Transactions/GetTransactionStatus?orderTrackingId={order_tracking_id}"

        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        try:
            response = requests.get(url, headers=headers)
            print("Query Payment Status Response:", response.status_code, response.text)
            return response.json()
        except json.JSONDecodeError as err:
            print("JSON decode failed:", err)
            return {"status": "error", "message": "Invalid JSON"}



