# Publisher Code for Micropython
# ESP32 reads data from sensors, displays it on OLED
# Publishes data to MQTT broker

import network
import socket
from time import sleep
import machine
from machine import Pin,I2C,ADC
import ssd1306
from umqtt.simple import MQTTClient

#ssid = 'Trichas Phone'
#password = 'patrisha'
ssid = 'ORBI58'
password = 'quaintsquash288'

# Function to connect to a Wifi network
def connect():
    
    #Connect to WLAN
    wlan = network.WLAN(network.STA_IF)
    wlan.active(False)
    wlan.active(True)
    wlan.connect(ssid, password)
    while wlan.isconnected() == False:
        print('Waiting for connection...')
        sleep(1)
    print('Connected to Wifi:',wlan.ifconfig())
    
    
# Initialize OLED Display
# Sets I2C communication with pin 7 and 6 
i2c = I2C(freq=100000, scl=Pin(7), sda=Pin(6))
display = ssd1306.SSD1306_I2C(128, 64, i2c)
display.fill(0)
display.show()

# Initialize ADC for sensor
light_sensor = ADC(1) # Reads light intensity values

soil_sensor =ADC(2) #Reads soil moisture analog values
soil_sensor.atten(ADC.ATTN_11DB)

# MQTT setup
broker = "test.mosquitto.org"
topic = "pat_light"
client = MQTTClient(client_id="ppppp", server=broker, port=1883)

# Function to display sensor data on OLED
def display_sensor_data(light_value, soil_value):
    display.fill(0)  # Clear display
    display.text("Light Sensor:", 0, 0, 1)
    display.text(str(light_value), 0, 10, 1)
    display.text("Soil Moisture:", 0, 30, 1)
    display.text(f"{soil_value:.2f} V", 0, 40, 1)
    display.show()
    
# Function to publish sensor data
def publish_sensor_data():
    try:
        client.connect()
        print("Connected to MQTT broker.")

        while True:
            # Read sensor data
            light_value = light_sensor.read_u16()  # Raw ADC value for light sensor
            light_intensity = (light_value / 65535) * 100  # Map to percentage

            soil_value = soil_sensor.read_uv() / 1000000  # Soil moisture in volts

            # Display data on OLED
            display_sensor_data(light_intensity, soil_value)

            # Publish both values to MQTT
            message = f"Light: {light_intensity} %, Soil: {soil_value:.2f} V"
            client.publish(topic, message)
            print(f"Published: {message}")
            
            sleep(5)  # Delay between readings
    except Exception as e:
        print("Error:", e)
    finally:
        client.disconnect()
        print("Disconnected from MQTT broker.")

# Connect to Wi-Fi
connect()

# Publish sensor data to broker
publish_sensor_data()

