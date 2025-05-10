#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5
#define RST_PIN 22

MFRC522 mfrc522(SS_PIN, RST_PIN);

void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("Ready to scan MIFARE Ultralight...");
  Serial.println("Enter a string (max 22 chars) and press ENTER:");
}

void loop() {
  if (Serial.available() > 0) {
    String userInput = Serial.readStringUntil('\n');
    userInput.trim();

    if (userInput.length() > 22) {
      Serial.println("Input too long! Trimming to 22 chars.");
      userInput = userInput.substring(0, 22);
    }

    Serial.print("You entered: ");
    Serial.println(userInput);

    Serial.println("Place the card near the reader...");
    while (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
      delay(100);
    }

    Serial.print("UID: ");
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      Serial.printf("%02X ", mfrc522.uid.uidByte[i]);
    }
    Serial.println();

    byte dataToWrite[24] = {0};
    userInput.getBytes(dataToWrite, 23);

    bool writeSuccess = true;
    for (byte page = 4; page <= 9; page++) {
      byte pageData[4] = {
        dataToWrite[(page-4)*4 + 0],
        dataToWrite[(page-4)*4 + 1],
        dataToWrite[(page-4)*4 + 2],
        dataToWrite[(page-4)*4 + 3]
      };

      Serial.printf("Writing Page %d: %02X %02X %02X %02X\n", 
                   page, pageData[0], pageData[1], pageData[2], pageData[3]);

      MFRC522::StatusCode status = mfrc522.MIFARE_Ultralight_Write(page, pageData, 4);
      if (status != MFRC522::STATUS_OK) {
        Serial.printf("Write failed on Page %d (Error %d)\n", page, status);
        writeSuccess = false;
        break;
      }
      delay(50);
    }

    if (writeSuccess) {
      Serial.println("Verifying write...");
      byte verifyBuffer[24];
      bool verifyOK = true;

      for (byte page = 4; page <= 9; page++) {
        byte size = 18;
        byte readBuffer[18];
        MFRC522::StatusCode status = mfrc522.MIFARE_Read(page, readBuffer, &size);
        if (status != MFRC522::STATUS_OK) {
          Serial.printf("Failed to read Page %d for verification\n", page);
          verifyOK = false;
          break;
        }

        for (byte i = 0; i < 4; i++) {
          verifyBuffer[(page-4)*4 + i] = readBuffer[i];
        }
      }

      if (verifyOK) {
        Serial.print("Read back: ");
        for (byte i = 0; i < 22; i++) {
          Serial.printf("%02X ", verifyBuffer[i]);
        }
        Serial.println();

        Serial.print("As string: ");
        for (byte i = 0; i < 22; i++) {
          if (verifyBuffer[i] >= 32 && verifyBuffer[i] <= 126) {
            Serial.write(verifyBuffer[i]);
          } else {
            Serial.print(".");
          }
        }
        Serial.println();
      }
    }

    mfrc522.PICC_HaltA();
    Serial.println("Done. Enter a new string or scan another card.");
  } else {
    Serial.println("Waiting for data input via serial...");
    delay(5000);
  }
}