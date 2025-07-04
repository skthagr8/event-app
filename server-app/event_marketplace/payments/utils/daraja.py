import base64
import requests
from django.conf import settings
from datetime import datetime

class DarajaAPI:
    def __init__(self):
        self.consumer_key = settings.DARAJA['CONSUMER_KEY']
        self.consumer_secret = settings.DARAJA['CONSUMER_SECRET']
        self.shortcode = settings.DARAJA['SHORT_CODE']
        self.passkey = settings.DARAJA['PASSKEY']
        self.base_url = settings.DARAJA['BASE_URL']
        self.token = self._generate_token()

    def _generate_token(self):
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        response = requests.get(url, auth=(self.consumer_key, self.consumer_secret))
        response.raise_for_status()
        data = response.json()
        print("Access Token:", data['access_token'])
        return data['access_token']

    def _generate_password(self, timestamp):
        data_to_encode = self.shortcode + self.passkey + timestamp
        return base64.b64encode(data_to_encode.encode()).decode()

    def initiate_stk_push(self, amount, phone_number, account_reference, transaction_desc):
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = self._generate_password(timestamp)
        
        if phone_number.startswith("0"):
            phone_number = "254" + phone_number[1:] 
            

        payload = {
            "BusinessShortCode": 174379,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(1),
            "PartyA": str(phone_number),
            "PartyB": 174379,
            "PhoneNumber": str(phone_number),
            "CallBackURL": "https://f0a3-102-218-90-29.ngrok-free.app/api/payments/callback/",
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc
        }

        print("STK Push Payload:", payload)
        print("")

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        response = requests.post(url, json=payload, headers=headers)
        print("")
        print("STK Push Response:", response.status_code, response.text)
        return response.json()
    
    def stk_push_query(self,checkout_id):
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        shortcode = 174379
        password = base64.b64encode(f"{shortcode}{self.passkey}{timestamp}".encode()).decode()


        headers = {
        'Authorization': f'Bearer {self.token}',
        'Content-Type': 'application/json'
        }

        payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "CheckoutRequestID": checkout_id,
         }

        res = requests.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
        json=payload,
        headers=headers
        )

        return res.json()
