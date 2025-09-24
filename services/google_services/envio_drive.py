import os
from dotenv import load_dotenv
from googleapiclient.http import MediaFileUpload
from services.google_services.google_service import acessando_drive


load_dotenv()
PASTA_RAIZ_ID = os.getenv('PASTA_DRIVE_FOTOS')


def salvar_drive(nome_arquivo, email_usuario, nome_usuario):

    drive = acessando_drive()
    pasta_id = PASTA_RAIZ_ID

    nome = f"{email_usuario}_{nome_usuario}"

    file_metadata = {
        'name': nome,
        'parents': [pasta_id]
    }

    media = MediaFileUpload(nome_arquivo, resumable=True)
    arquivo = drive.files().create(body=file_metadata,
                                   media_body=media, fields='id').execute()
    return arquivo.get('id')


def remover_drive(id_arquivo):
    drive = acessando_drive()
    drive.files().delete(fileId=id_arquivo).execute()
    return True
