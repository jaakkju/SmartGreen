/*
 * SmartGreen.ino
 *
 * Created: 5/12/2015 10:39:31 AM
 * Author: jaakkju
 */
#include <avr/pgmspace.h>
#include <SoftwareSerial.h>
#include <DHT.h>

//#define DEBUG_ON

#ifdef DEBUG_ON
	#define DEBUG_CONNECT(x)	Serial.begin(x)
	#define DEBUG_PRINTLN(x)	Serial.println(x)
	#define DEBUG_PRINT(x)		Serial.print(x)
	#define DEBUG_WRITE(x)		Serial.write(x)
#else
	#define DEBUG_CONNECT(x)
	#define DEBUG_PRINTLN(x)
	#define DEBUG_PRINT(x)
	#define DEBUG_WRITE(x)
#endif

// Wait times in milliseconds
#define WAIT			300000
#define WLAN_WAIT		5000
#define DEFAULT_TIMEOUT 3000

// WiFi AP information
#define SSID "CSGuestNet"
#define PASS "mTVznw-anJuF"

// SmartGreen Device Identifier:"n9wqbbZtZDPq1yPrQOVZ", "HpwuWPH8GDlk02D2qLbu"
#define DID "HpwuWPH8GDlk02D2qLbu"

// waitForString reply definitions
#define ACT		2	// act
#define NACT	1	// nact
#define ERROR	0	// none

// ESP 8266 pins
#define ESP_RX 8
#define ESP_TX 7

// ESP CH_DP pin (enable pin)
#define ESP_ENABLE_PIN		6
#define ESP_ENABLE_RETRIES	3

// On board led pin on Arduino Pro Mini
#define LED_PIN 13

// ESP 8266 module responses
const char ESP_OK[]	        PROGMEM = "OK";
const char ESP_ERROR[]		PROGMEM = "Error";
const char ESP_NO_IP[]	    PROGMEM = "no ip";
const char ESP_LINKED[]		PROGMEM = "CONNECT";
const char ESP_CLOSED[]		PROGMEM = "CLOSED";
const char ESP_START[]		PROGMEM = ">";
const char ESP_SAVED[]		PROGMEM = "200";
const char ESP_NONE[]		PROGMEM = "";
const char ESP_WIFI_ON[]	PROGMEM = "CWJAP:";
const char ESP_NOAP[]		PROGMEM = "No AP";
const char ESP_BOOT[]		PROGMEM = "ready";
const char ESP_NO_CHANGE[]	PROGMEM = "no change";


SoftwareSerial ESP_Serial(ESP_RX, ESP_TX); // RX | TX
long LAST_UPDATE = 0;

// DHT 22 pin and retry definitions
#define DHTPIN 9
#define DHT22_POWER_PIN 5
#define DHTTYPE DHT22   // DHT 22  (AM2302)
#define DHT_READ_RETRIES 3
DHT dht(DHTPIN, DHTTYPE, 3);

float MEASUREMENT[3]; // temp C, temp F, humidity, heat index

void setup()
{
  DEBUG_CONNECT(9600);
  DEBUG_PRINTLN(F("Starting setup"));

  // Disable the ADC by setting the ADEN bit (bit 7)  of the ADCSRA register to zero.
  ADCSRA = ADCSRA & B01111111;

  // Disable the analog comparator by setting the ACD bit (bit 7) of the ACSR register to one.
  ACSR = B10000000;

  // Disable digital input buffers on all analog input pins by setting bits 0-5 of the DIDR0 register to one.
  DIDR0 = DIDR0 | B00111111;

  // Set on board led, ESP enable
  pinMode(LED_PIN, OUTPUT);
  pinMode(ESP_ENABLE_PIN, OUTPUT);
  pinMode(DHT22_POWER_PIN, OUTPUT);

  digitalWrite(LED_PIN, LOW);
  digitalWrite(ESP_ENABLE_PIN, LOW);

  dht.begin();

  // Start the software serial for communication with the ESP8266
  ESP_Serial.begin(9600);
  DEBUG_PRINTLN(F("\r\nSetup done"));
}

void loop()
{
  update();
}

bool measure(byte retry_attempt) {
  DEBUG_PRINT(F("\r\nMeasuring: "));
  DEBUG_PRINT(retry_attempt);
  DEBUG_PRINT(F("\r\n"));

  // Store measurements into an array of floats [4]
  float h = dht.readHumidity();

  // Read temperature as Celsius
  float t = dht.readTemperature();

  // Read temperature as Fahrenheit
  float f = dht.readTemperature(true);

  // Check if any reads failed and exit early (to try again).
  if (isnan(h) || isnan(t) || isnan(f)) {
    DEBUG_PRINTLN("Failed to read from DHT sensor!");

  } else {
    float hi = dht.computeHeatIndex(f, h);

    MEASUREMENT[0] = h;
    MEASUREMENT[1] = t;
    MEASUREMENT[2] = hi;

    DEBUG_PRINT(F("Humidity: "));
    DEBUG_PRINT(h);
    DEBUG_PRINT(F(" %  "));
    DEBUG_PRINT(F("Temperature: "));
    DEBUG_PRINT(t);
    DEBUG_PRINT(F(" *C  "));
    DEBUG_PRINT(f);
    DEBUG_PRINT(F(" *F  "));
    DEBUG_PRINT(F("Heat index: "));
    DEBUG_PRINT(hi);
    DEBUG_PRINT(F(" *F\r\n"));

    return true;
  }

  //Try again until retry counts expire
  if (retry_attempt < DHT_READ_RETRIES) {
    retry_attempt++;
    return measure(retry_attempt);

  } else {
    return false;
  }
}

void update() {
  long now = millis();
  if (now > LAST_UPDATE + WAIT || LAST_UPDATE == 0) {

    //Power on DHT22
    digitalWrite(DHT22_POWER_PIN, HIGH);
    DEBUG_PRINTLN(F("DHT22 Power ON"));

    if (enableESP(0) && measure(0)) {

      DEBUG_PRINTLN(F("\r\ESP Connected to wifi, starting send.."));
      espStr_P(PSTR("AT+CIPSTART=\"TCP\",\"murmuring-bayou-3294.herokuapp.com\",80\r\n"));
      byte link = waitForString(ESP_LINKED, ESP_NO_IP, DEFAULT_TIMEOUT);

      // ESP returned 'Linked'
      if (link == ACT) {

        // CIPSEND value and Content-Length in the request must be correct!
        espStr_P(PSTR("AT+CIPSEND=208\r\n"));
        if (waitForString(ESP_START, ESP_NONE, DEFAULT_TIMEOUT) == ACT) {

          // Building POST Request
          espStr_P(PSTR("POST /api/data HTTP/1.1\r\n"));
          espStr_P(PSTR("Host: murmuring-bayou-3294.herokuapp.com\r\n"));
          espStr_P(PSTR("Connection: close\r\n"));
          espStr_P(PSTR("Content-Type: application/json\r\n"));
          espStr_P(PSTR("Content-Length: 68\r\n\r\n"));

          // Building POST Request body
          espStr_P(PSTR("{\"did\":\""));
          espStr_P(PSTR(DID));
          espStr_P(PSTR("\",\"tem\":"));

          char value[6];
          espStr(dtostrf(MEASUREMENT[0], 5, 2, value)); // Insert temperature
          espStr_P(PSTR(",\"hum\":"));
          espStr(dtostrf(MEASUREMENT[1], 5, 2, value)); // Insert humidity
          espStr_P(PSTR(",\"hin\":"));
          espStr(dtostrf(MEASUREMENT[2], 5, 2, value)); // Insert heat index
          espStr_P(PSTR("}\r\n"));

			if(waitForString(ESP_SAVED, ESP_NONE, DEFAULT_TIMEOUT) == ACT) { // 'SAVED', 'CLOSED'
				DEBUG_PRINTLN(F("\r\nSend successfully"));
				} else {
				DEBUG_PRINTLN(F("\r\nSend failed"));
			}
        }
		
		clearBuffer();

        // Close connection if it is still open
        if (link == ACT) {
          espStr_P(PSTR("AT+CIPCLOSE\r\n"));
          if (waitForString(ESP_CLOSED, ESP_NONE, DEFAULT_TIMEOUT)) { // 'CLOSED'
            DEBUG_PRINTLN(F("\r\nConnection closed successfully"));
          }
        }
      }
    }

    LAST_UPDATE = millis();
    clearBuffer();
    disableESP();

    //Power off DHT22
    digitalWrite(DHT22_POWER_PIN, LOW);
    DEBUG_PRINTLN(F("DHT22 Power OFF"));
  }
}

// Bring Enable pin up, wait for module to wake-up/connect.
bool enableESP(byte retry_attempt) {

  // Enable ESP8266 Module
  digitalWrite(ESP_ENABLE_PIN, HIGH);

  if (retry_attempt > 0 || waitForString(ESP_BOOT, ESP_NONE, DEFAULT_TIMEOUT) == ACT) { // 'ready'
    DEBUG_PRINTLN(F("\r\nESP8266 pin is HIGH. Waiting for boot up..."));

    // Needs some time to connect to AP, 5 seconds
    delay(WLAN_WAIT);
    clearBuffer();

    espStr_P(PSTR("AT+CWJAP?\r\n")); // Ask AP name
    switch (waitForString(ESP_WIFI_ON, ESP_NOAP, DEFAULT_TIMEOUT)) { // 'CWJAP:'
      case ACT:

        DEBUG_PRINTLN(F("\r\nAP connected automatically. Everything OK"));
        return true;

        break;
      case NACT:

        espStr_P(PSTR("AT+CWMODE=1\r\n"));
        byte mode = waitForString(ESP_OK, ESP_NO_CHANGE, DEFAULT_TIMEOUT);

        if (mode == ACT || mode == NACT) {
          DEBUG_PRINT(F("\r\nSTA Mode set\r\n"));

          espStr_P(PSTR("AT+CIPMUX=0\r\n")); // Configure for single connection
          waitForString(ESP_OK, ESP_NONE, DEFAULT_TIMEOUT);

          espStr_P(PSTR("AT+CWJAP=\""));
          espStr_P(PSTR(SSID));
          espStr_P(PSTR("\",\""));
          espStr_P(PSTR(PASS));
          espStr_P(PSTR("\"\r\n"));

          if (waitForString(ESP_OK, ESP_NONE, 7000) == ACT) { // 'OK'
            DEBUG_PRINTLN(F("\r\nAP connected manually. Everything OK"));
            return true;
          }
        }

        break;
    }
  }

  //Couldn't connect to the module
  DEBUG_PRINT(F("\r\nError initializing the module. Retry attempt "));
  DEBUG_PRINT(retry_attempt);
  DEBUG_PRINT(F("\r\n"));

  //Try again until retry counts expire
  if (retry_attempt < ESP_ENABLE_RETRIES) {
    retry_attempt++;
    return enableESP(retry_attempt);

  } else {
    return false;
  }
}

// Bring ESP 8266 Enable pin down
void disableESP() {
  digitalWrite(ESP_ENABLE_PIN, LOW);
  DEBUG_PRINTLN(F("\r\nESP8266 Disabled"));
}

//Remove all bytes from the buffer
void clearBuffer() {
  while (ESP_Serial.available()) {
    byte c = ESP_Serial.read();
    DEBUG_WRITE(c);
  }

  DEBUG_PRINTLN(F("\r\nESP8266 buffer cleared"));
}

void blinkLED(int NumberOfBlinks, int OnDuration)
{
  for (int x = 1; x <= NumberOfBlinks ; x ++) {
    digitalWrite(LED_PIN, HIGH);
    delay(OnDuration);
    digitalWrite(LED_PIN, LOW);
    delay(OnDuration);
  }
}

void espStr_P(PGM_P str) {
  for (uint8_t c; (c = pgm_read_byte(str)); str++) {
    ESP_Serial.write(c);
  }

  // Wait until buffer is sent completely
  ESP_Serial.flush();
}

void espStr(char *str) {
  for (uint8_t c; (*str); str++) {
    ESP_Serial.write(*str);
  }

  // Wait until buffer is sent completely
  ESP_Serial.flush();
}

// Read characters from WiFi module (and echo to serial) until keyword occurs or timeout.
byte waitForString(PGM_P act, PGM_P nact, long timeout) {

  PGM_P act_pointer = act;
  byte act_length = strlen_P(act);
  byte act_index = 0;

  PGM_P nact_pointer = nact;
  byte nact_length = strlen_P(nact);
  byte nact_index = 0;

  long deadline = millis() + timeout;
  while (deadline >= millis()) {

    if (ESP_Serial.available()) {
      char current_byte = ESP_Serial.read();

      DEBUG_WRITE(current_byte);

      if (current_byte != -1) {

        // Finding act string from the reply
        if (act_length > 0) {
          if (current_byte == pgm_read_byte(act_pointer)) {

            // Move to next char and increment index
            act_pointer++;
            act_index++;

            // Found act string
            if (act_index == act_length) {

              blinkLED(1, 50);
              return ACT;
            }
          } else {

            // Reset index and pointer
            act_index = 0;
            act_pointer = act;

          }
        }

        // Finding nact string from the reply
        if (nact_length > 0) {
          if (current_byte == pgm_read_byte(nact_pointer)) {

            // Move to next char and increment index
            nact_pointer++;
            nact_index++;

            // Found nact string
            if (nact_index == nact_length) {

              blinkLED(2, 50);
              return NACT;
            }
          } else {

            // Reset index and pointer
            nact_pointer = nact;
            nact_index = 0;
          }
        }
      }
    }
  }

  // Neither found, returning error
  blinkLED(3, 50);
  return ERROR;
}

