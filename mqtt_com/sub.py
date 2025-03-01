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
    client.subscribe("greenthumb")  # Subscribe to the MQTT topic

def on_message(client, userdata, msg):
    print(f"Message received -> Topic: {msg.topic}, Data: {msg.payload.decode()}")
    
    # Extract sensor data from the received message
    try:
        # Assuming the message follows the format: "Light: XX.X%, Soil: YY.Y%"
        payload = msg.payload.decode()
        data_parts = payload.split(", ")  # Split message by comma
        
        light_value = float(data_parts[0].split(": ")[1].strip("%"))  # Extract light percentage
        soil_moisture_value = float(data_parts[1].split(": ")[1].strip("%"))  # Extract soil moisture percentage
        
        # Write to Firebase with separate fields
        ref = db.reference("mqtt_data")  # Reference to the database node
        ref.push({  
            "Topic": msg.topic,
            "Light": light_value,
            "Soil Moisture": soil_moisture_value
        })
        
        print("Data pushed to Firebase:", {"Topic": msg.topic, "Light": light_value, "Soil Moisture": soil_moisture_value})
    
    except Exception as e:
        print("Error processing message:", e)


# Configure MQTT Client
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Connect to MQTT broker
client.connect("test.mosquitto.org", 1883, 60)

# Start the MQTT client loop
client.loop_forever()

