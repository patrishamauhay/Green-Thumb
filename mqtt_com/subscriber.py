import paho.mqtt.client as mqtt
import firebase_admin
from firebase_admin import credentials, db
import re  # Import regex to extract values

# Initialize Firebase
cred = credentials.Certificate("C:/Users/patri/Documents/Publish-Subscriber/serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://greenthumb-125c0-default-rtdb.europe-west1.firebasedatabase.app/"
})

# Define MQTT Callbacks
def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT Broker with result code {0}".format(rc))
    client.subscribe("greenthumb")  # Subscribe to the topic

def on_message(client, userdata, msg):
    message = msg.payload.decode()
    print(f"Received -> Topic: {msg.topic}, Data: {message}")

    # Extract Light and Soil Moisture values using regex
    light_match = re.search(r"Light: (\d+\.\d+)%", message)
    soil_match = re.search(r"Soil: (\d+\.\d+)%", message)

    # Convert extracted values to floats
    light_value = float(light_match.group(1)) if light_match else None
    soil_value = float(soil_match.group(1)) if soil_match else None

    # Push structured data to Firebase
    ref = db.reference("mqtt_data")  
    ref.push({
        "Topic": msg.topic,
        "Light": light_value,
        "Soil Moisture": soil_value
    })

# Configure MQTT Client
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Connect to MQTT broker
client.connect("test.mosquitto.org", 1883, 60)

# Start the MQTT loop
client.loop_forever()
