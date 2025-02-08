# Subscribes to topic and receives published data (sensor data)
# After receiving data, it pushes it to Firebase

import paho.mqtt.client as mqtt # type: ignore
import firebase_admin
from firebase_admin import credentials, db

# Initialize Firebase SDK
cred = credentials.Certificate(r"C:\Users\patri\Documents\Publish-Subscriber\serviceAccountKey.json") 
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://greenthumb-125c0-default-rtdb.europe-west1.firebasedatabase.app/"  # Firebase database URL
})

# Define MQTT Callbacks
def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT Broker with result code {0}".format(rc))
    client.subscribe("pat_light")  # Subscribe to the MQTT topic

def on_message(client, userdata, msg):
    print(f"Message received -> Topic: {msg.topic}, Light Sensor: {str(msg.payload.decode())}")
    
    # Write to Firebase
    ref = db.reference("mqtt_data")  # Create a reference to the database node
    ref.push({  # Push the received data as a new record
        "topic": msg.topic,
        "sensordata": msg.payload.decode()  # Convert byte payload to string
    })

# Configure MQTT Client
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Connect to MQTT broker
client.connect("test.mosquitto.org", 1883, 60)

# Start the MQTT client loop
client.loop_forever()
