import os
from dotenv import load_dotenv
from google.oauth2 import service_account
from googleapiclient.discovery import build

load_dotenv()


def acessando_drive():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    SERVICE_ACCOUNT_FILE = os.path.join(
        BASE_DIR, os.getenv('SERVICE_ACCOUNT_FILE'))
    EMAIL_USER = os.getenv('EMAIL_USER')
    SCOPES = os.getenv('SCOPES_DRIVE').split(',')
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES).with_subject(EMAIL_USER)
    drive_service = build("drive", "v3", credentials=creds)
    return drive_service
