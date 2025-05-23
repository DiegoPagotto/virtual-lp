#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <WebServer.h>

#define SS_PIN 5
#define RST_PIN 22
#define LED_PIN 2

const char* ssid = "";
const char* password = "";

WebServer server(80);
MFRC522 mfrc522(SS_PIN, RST_PIN);

enum Mode { READ_MODE, WRITE_MODE };
Mode currentMode = READ_MODE;
String writeData = "";
String lastCardData = "";
bool cardPresent = false;

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW); 

  server.on("/setMode", HTTP_POST, handleSetMode);
  server.on("/getCard", HTTP_GET, handleGetCard);
  
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
  checkCardPresence();
  delay(100);
}

void checkCardPresence() {
  static unsigned long lastCardTime = 0;
  static bool lastCardState = false;

  bool currentCardState = false;
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    currentCardState = true;
    lastCardTime = millis();
  } else if (millis() - lastCardTime < 1000) {
    currentCardState = true;
  }

if (currentCardState && !lastCardState) {
  handleCardDetected();
  cardPresent = true;
  digitalWrite(LED_PIN, HIGH);  
  Serial.println("Card detected.");
} else if (!currentCardState && lastCardState) {
  cardPresent = false;
  digitalWrite(LED_PIN, LOW); 
  mfrc522.PICC_HaltA();
  Serial.println("Card removed.");
}


  lastCardState = currentCardState;
}

void handleCardDetected() {

  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uid += String(mfrc522.uid.uidByte[i], HEX);
    if (i < mfrc522.uid.size - 1) uid += ":";
  }
  Serial.println("Card detected: " + uid);

  if (currentMode == WRITE_MODE && writeData.length() > 0) {
    String dataToWrite = writeData.substring(0, 22);
    byte buffer[24] = {0};
    dataToWrite.getBytes(buffer, 23);

    bool success = true;
    for (byte page = 4; page <= 9; page++) {
      byte pageData[4] = {
        buffer[(page-4)*4], buffer[(page-4)*4+1], 
        buffer[(page-4)*4+2], buffer[(page-4)*4+3]
      };
      
      if (mfrc522.MIFARE_Ultralight_Write(page, pageData, 4) != MFRC522::STATUS_OK) {
        success = false;
        break;
      }
      delay(50);
    }

    if (success) {
      lastCardData = dataToWrite;
      Serial.println("Write successful: " + dataToWrite);
    }
  } else {
    byte buffer[24] = {0};
    bool success = true;
    
    for (byte page = 4; page <= 9; page++) {
      byte size = 18;
      byte pageBuffer[18];
      if (mfrc522.MIFARE_Read(page, pageBuffer, &size) != MFRC522::STATUS_OK) {
        success = false;
        break;
      }
      memcpy(&buffer[(page-4)*4], pageBuffer, 4);
    }

    if (success) {
      lastCardData = "";
      for (byte i = 0; i < 22; i++) {
        if (buffer[i] >= 32 && buffer[i] <= 126) {
          lastCardData += (char)buffer[i];
        } else if (buffer[i] != 0) {
          lastCardData += ".";
        }
      }
      Serial.println("Card read: " + lastCardData);
    }
  }

}

void handleSetMode() {
  if (server.method() != HTTP_POST) {
    server.send(405, "application/json", "{\"error\":\"Method Not Allowed\"}");
    return;
  }

  String mode = server.arg("mode");
  if (mode == "READ") {
    currentMode = READ_MODE;
    server.send(200, "application/json", "{\"status\":\"ok\", \"mode\":\"READ\"}");
  } else if (mode == "WRITE") {
    writeData = server.arg("data");
    currentMode = WRITE_MODE;
    server.send(200, "application/json", "{\"status\":\"ok\", \"mode\":\"WRITE\", \"data\":\"" + writeData + "\"}");
  } else {
    server.send(400, "application/json", "{\"error\":\"Invalid mode\"}");
  }
}


void handleGetCard() {
  String json = "{";
  json += "\"card\":\"" + lastCardData + "\",";
  json += "\"mode\":\"" + String(currentMode == READ_MODE ? "READ" : "WRITE") + "\",";
  json += "\"card_present\":" + String(cardPresent ? "true" : "false");
  json += "}";
  server.send(200, "application/json", json);
}
