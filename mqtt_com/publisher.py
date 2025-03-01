import network
import socket
import time
import machine
from machine import Pin, I2C, ADC
import ssd1306
from umqtt.simple import MQTTClient

# WiFi Credentials
ssid = 'ORBI58'
password = 'quaintsquash288'

# Function to connect to Wi-Fi
def connect():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(False)
    wlan.active(True)
    wlan.connect(ssid, password)
    
    while not wlan.isconnected():
        print('Waiting for connection...')
        time.sleep(1)
    
    print('Connected to Wifi:', wlan.ifconfig())

# Initialize OLED Display
i2c = I2C(freq=100000, scl=Pin(7), sda=Pin(6))
display = ssd1306.SSD1306_I2C(128, 64, i2c)
display.fill(0)
display.show()

# Initialize Sensors
light_sensor = ADC(1)  # Light Sensor
soil_sensor = ADC(2)   # Soil Moisture Sensor
soil_sensor.atten(ADC.ATTN_11DB)  # Increase reading range for soil sensor

# MQTT Setup
broker = "test.mosquitto.org"
topic = "greenthumb"
client = MQTTClient(client_id="pmauhay", server=broker, port=1883)

# Function to display sensor data on OLED
def display_sensor_data(light_percentage, moisture_percentage):
    display.fill(0)  # Clear display
    display.text("Light:", 0, 0, 1)
    display.text(f"{light_percentage:.1f}%", 50, 0, 1)
    
    display.text("Soil Moisture:", 0, 20, 1)
    display.text(f"{moisture_percentage:.1f}%", 90, 20, 1)
    
    display.show()

# Function to convert raw ADC values to percentages
def convert_light_to_percentage(raw_value):
    return (raw_value / 65311) * 100  # Max light sensor value is 65311

def convert_soil_to_percentage(voltage):
    return max(0, min((1 - (voltage / 2.576)) * 100, 100))  # Ensure 0-100%

# Function to publish sensor data
def publish_sensor_data():
    global client
    try:
        client.connect()
        print("Connected to MQTT broker.")
        
        while True:
            raw_light = light_sensor.read_u16()
            light_percentage = convert_light_to_percentage(raw_light)

            raw_soil = soil_sensor.read_uv() / 1000000
            moisture_percentage = convert_soil_to_percentage(raw_soil)

            display_sensor_data(light_percentage, moisture_percentage)

            message = json.dumps({
                "Light": round(light_percentage, 2),
                "Soil Moisture": round(moisture_percentage, 2)
            })

            client.publish(topic, message)
            print(f"Published: {message}")

            time.sleep(5)
    except Exception as e:
        print("Error:", e)
    finally:
        client.disconnect()
        print("Disconnected from MQTT broker.")

# Connect to Wi-Fi
connect()

# Start publishing sensor data to MQTT
publish_sensor_data()

