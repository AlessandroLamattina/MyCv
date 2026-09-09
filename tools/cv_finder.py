import openpyxl
from datetime import datetime
import os
import pandas as pd
import subprocess
import time
import sys
from PyQt5.QtCore import Qt, QThread, pyqtSignal
from PyQt5.QtWidgets import QApplication, QLabel, QMainWindow, QVBoxLayout, QPushButton, QWidget
import requests
import subprocess
import win32com.client
import pythoncom

class MyThread(QThread):
    update_signal = pyqtSignal(str)
    status_button = pyqtSignal(bool)
    def run(self):
        self.update_signal.emit("Inizio la scannerizzazione")
        self.client_id = ''
        self.tenant_id = ''
        self.client_secret = ''
        self.graph_api_url = "https://graph.microsoft.com/v1.0"
        self.last_modify = []
        self.cv_folder = []
        token_url = f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0/token"
        token_data = {
            'grant_type': 'client_credentials',
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'scope': 'https://graph.microsoft.com/.default'
        }
        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        if 'access_token' in token_json:
            self.access_token = token_json['access_token']
            self.whoiam()
        else:
            raise Exception("Authentication failed. Check client_id, tenant_id, and client_secret.")

    def esegui_chiamata_api_ms(self, api_url):
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        response = requests.get(api_url, headers=headers)
        return response.json()

    def whoiam(self):
        user_mail = subprocess.run(["whoami", "/upn"], capture_output=True, text=True).stdout.strip()
        item_id = []
        user_id = ""
        extract_list = []
        cv_list = ["urriculum", "URRICCULUM", "CV", "cv", "Cv"]
        api_url = 'https://graph.microsoft.com/v1.0/users'
        result = self.esegui_chiamata_api_ms(api_url)
        self.update_signal.emit("Ricerca utente")
        for item in result.get("value", []):
            if user_mail in item.get("userPrincipalName", ""):
                user_id = item.get("id", "")
        api_url = f'https://graph.microsoft.com/v1.0/users/{user_id}/memberOf'
        result = self.esegui_chiamata_api_ms(api_url)
        self.update_signal.emit("Ricerca gruppi utente")
        for item in result.get("value", []):
            try:
                api_url = f'https://graph.microsoft.com/v1.0/groups/{item.get("id", "")}'
                result2 = self.esegui_chiamata_api_ms(api_url)
                if "On" in result2.get("membershipRuleProcessingState", "") or "null" in result2.get(
                        "membershipRuleProcessingState", ""):
                    extract_list.append((result2.get("displayName", "")))
            except Exception as error:
                print(f" ")
        api_url = ''
        result = self.esegui_chiamata_api_ms(api_url)
        self.update_signal.emit("Ricerca gruppi compatibili")
        for item in result.get("value", []):
            if any(keyword in str(item.get("displayName", "")) for keyword in extract_list):
                site_id = item.get("id", "")
                search_char = ','
                index_of_char = site_id.find(search_char)
                site_id = site_id[index_of_char + 1:]
                index_of_char = site_id.find(search_char)
                site_id = site_id[:index_of_char]
                try:
                    api_url = f'https://graph.microsoft.com/v1.0/sites/{site_id}/lists'
                    result_sites_id = self.esegui_chiamata_api_ms(api_url)
                    self.update_signal.emit(f"Inizio la ricerca in {item.get("displayName", "")}")
                    for item_sites in result_sites_id.get("value", []):
                        api_url = f'https://graph.microsoft.com/v1.0/sites/{site_id}/lists/{item_sites.get("id", "")}/items'
                        while True:
                            if not api_url:
                                break
                            r_list_id = self.esegui_chiamata_api_ms(api_url)
                            for item2 in r_list_id.get("value", []):
                                if any(keyword in str(item2.get("webUrl", "")) for keyword in cv_list):
                                    if "ocument" in item2.get("contentType", {}).get("name", ""):
                                        self.cv_folder.append(item2.get("webUrl", ""))
                                        self.last_modify.append(item2.get("createdDateTime", ""))
                            api_url = r_list_id.get("@odata.nextLink", "")
                except Exception as e:
                    print(e)
        self.update_signal.emit("Inizio la ricerca sul computer")
        self.cv_folder.append("Inizio file trovati sul pc")
        self.last_modify.append("########")
        for root, dirs, files in os.walk(os.path.join(os.environ['USERPROFILE'])):
            for file in files:
                if any(keyword in file for keyword in cv_list):
                    percorso_file = os.path.join(root, file)
                    if "AppData" in percorso_file:
                        pass
                    else:
                        percorso_file = os.path.join(root, file)
                        self.last_modify.append(datetime.fromtimestamp(os.path.getmtime(percorso_file))
                                                .strftime("%Y-%m-%d %H:%M"))
                        self.cv_folder.append(percorso_file)
        try:
            df = pd.DataFrame({'Data Ultima Modifica': self.last_modify,
                               'Percorso in cui si trova il file': self.cv_folder})
            df.to_excel(f'cv_folder.xlsx', index=False)
        except Exception as e:
            print(e)
        self.update_signal.emit(f"Trovati {len(self.cv_folder) - 1} file con cv nel nome.\nCreo un file excel sul pc con i file trovati\nnella mia directory.")
        self.status_button.emit(True)

class MyOutlookThread(QThread):

    update_signal = pyqtSignal(str)
    status_button = pyqtSignal(bool)

    def run(self):
        pythoncom.CoInitialize()
        try:
            outlook_app = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")
            self.update_signal.emit("Inizio i controlli")
            start_time = time.time()
            outlook_app = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")

            keywords_to_check = [3, 4, 5, 6, 16]
            z = 0
            oggetto = []
            nome_allegato = []
            folder = []
            date=[]

            for k in range(18):
                if k in keywords_to_check:
                    inbox = outlook_app.GetDefaultFolder(k)
                    for message in inbox.Items:
                        subject = message.Subject
                        attachments = message.Attachments
                        for i in range(attachments.Count):
                            attachment_name = attachments.Item(i + 1).FileName
                            if any(keyword in attachment_name.lower() for keyword in ['cv', 'curriculum']):
                                oggetto.append(subject)
                                nome_allegato.append(attachment_name)
                                folder.append(message.Parent.Name)
                                date.append((message.ReceivedTime).strftime("%Y-%m-%d %H:%M:%S"))
                        z += 1
                        self.update_signal.emit(f"Per la cartella {message.Parent.Name} sono a {z}/{inbox.Items.Count}")
                    z = 0
                    for subfolder in inbox.Folders:
                        for message in subfolder.Items:
                            subject = message.Subject
                            attachments = message.Attachments
                            for i in range(attachments.Count):
                                attachment_name = attachments.Item(i + 1).FileName
                                if any(keyword in attachment_name.lower() for keyword in ['cv', 'curriculum']):
                                    oggetto.append(subject)
                                    nome_allegato.append(attachment_name)
                                    folder.append(message.Parent.Name)
                                    date.append((message.ReceivedTime).strftime("%Y-%m-%d %H:%M:%S"))
                            z += 1
                            self.update_signal.emit(f"Per la cartella {message.Parent.Name} sono a {z}/{inbox.Items.Count}")
                        z = 0
            self.update_signal.emit(f"Trovati {len(oggetto)} mail con allegato un CV")
            df = pd.DataFrame({
                            'Data e ora': date,
                            'Oggetto': oggetto,
                            'Trovato nella cartella': folder,
                            'Nome allegato': nome_allegato})
            df.to_excel(f'mail_con_allegati.xlsx', index=False)
            end_time = time.time()
            elapsed_time = end_time - start_time
            self.update_signal.emit(f"Tempo di esecuzione: {elapsed_time:.2f} secondi")
            self.status_button.emit(True)
        except Exception as e:
            print("Error:", e)

        # Uninitialize COM
        pythoncom.CoUninitialize()
class MyMainWindow(QMainWindow):

    def __init__(self):
        super().__init__()
        self.init_ui()

    def init_ui(self):
        central_widget = QWidget(self)
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        self.label = QLabel("Benvenut*!\nQuesto script serve per\ntrovare i cv nel tuo pc e segnalarteli", self)
        layout.addWidget(self.label)
        self.start_button = QPushButton("Inizia a scannerizzare", self)
        self.start_button.clicked.connect(self.start_thread)
        self.start_outlook_button = QPushButton("Inizia controllo Mail", self)
        self.start_outlook_button.clicked.connect(self.start_outlook)
        layout.addWidget(self.start_button)
        layout.addWidget(self.start_outlook_button)
        self.setStyleSheet("""
                    QWidget {
                        background-color: #f5f5f5;
                    }

                    QLabel {
                        color: #333333;
                    }

                    QPushButton {
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        padding: 10px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;
                        border-radius: 5px;
                    }

                    QPushButton:disabled {
                        background-color: #aaaaaa;
                        color: #666666;
                    }
                """)
        self.setGeometry(400, 400, 400, 400)
        self.setWindowTitle('CV Finder')

    def start_thread(self):
        self.thread = MyThread()
        self.thread.update_signal.connect(self.update_label)
        self.thread.status_button.connect(self.update_button)
        self.update_button(False)
        self.thread.start()

    def start_outlook(self):
        self.thread2 = MyOutlookThread()
        self.thread2.update_signal.connect(self.update_label)
        self.thread2.status_button.connect(self.update_button)
        self.update_button(False)
        self.thread2.start()

    def update_button(self,status):
        self.start_button.setEnabled(status)
        self.start_outlook_button.setEnabled(status)

    def update_label(self, message):
        self.label.setText(message)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MyMainWindow()
    window.show()
    sys.exit(app.exec_())
